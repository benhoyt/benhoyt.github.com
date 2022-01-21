---
layout: default
title: "Compiling Python syntax to x86-64 assembly for fun and (zero) profit"
permalink: /writings/pyast64/
description: A toy (but working) compiler that turns Python syntax into x86-64 assembly using Python's built-in AST module.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">June 2017</p>

> Summary: I used Python's built-in AST module to parse a subset of Python syntax and turn it into an x86-64 assembly program. It's basically a toy, but it shows how easy it is to use the `ast` module to co-opt Python's lovely syntax for your own ends.

One of the reasons people like Python is because of its readable, low-punctuation syntax. You can write an algorithm in pseudocode, and then a minute later realize you've just written valid Python. So why not borrow Python's syntax -- and its parser -- for your own evil schemes?

I got onto this recently when I was doing some performance work on Python bytecode (a story for another day), and I wondered, "Hmmm, what if Python bytecode was just x86 code?" That is, why have a bytecode interpreter when you have a super-speedy native interpreter right there in your CPU? I'm sure that idea isn't original with me, and it has probably been tried and found wanting. It's obviously not portable, and Python's data and memory model is *much* different and higher-level than the x86's.

I still think that's an interesting idea, but I decided to try my hand at a much smaller and more fun problem: using the Python [`ast`](https://docs.python.org/3/library/ast.html) (abstract syntax tree) module to parse Python syntax, then recursively visit the AST nodes to turn them into another language. I thought it'd be easiest to generate C, but then I decided that going straight to (very unoptimized) assembly would be more fun.

For example, we'll be turning this:

```python
        65 + i
```

Into something like this:

```
        movq    8(%rbp), %rdx
        movq    $65, %rax
        addq    %rdx, %rax
```


Enter pyast64
-------------

I've written a bunch of 8086 and 80386 assembly back in the day, but have never actually had the need to write 64-bit x86 code. ("What's this `rax` thing? I've only heard of `ax` and `eax`.") These days almost everything is 64-bit, and I spend most of my time (alas) on macOS, so I'm generating x86-64 code for macOS. It wouldn't be hard to port it to Linux, though Windows might be a bit more work.

Outputting assembly source is easier than outputting machine code and an executable directly, so that's what I did, letting `as` and `ld` take care of assembly and linking. I'm not a fan of AT&T assembly syntax, but that's what's built in, so I used it.

I chose to keep it really simple: my language looks like Python, but it's definitely not. The only data type is integers, and the only output mechanism is a predefined `putc` function (adding `getc` for input is left as an exercise for the reader). 

The compiler uses a simple `%rbp`-based stack frame to handle an arbitrary number of local variables. It supports `while` loops, as well as `for i in range()` loops -- `for` is implemented in terms of `while`. It supports `if`/`else`, comparisons, logical `and` and `or`, the four basic math operators, and recursion.

If I felt the urge to make it more than a toy, I'd use Python 3's type annotations to support different data types like floating point and strings, and I'd add some features to allocate and use memory arrays. Oh, and things like `*args` and default arguments.

To keep it simple, the assembly output is very dumb, basically ignoring the fact that the x86-64 has a whole slew of registers, and just using `%rax` and `%rdx` for calculations and the stack for the rest. However, there's a small peephole optimizer which turns push-then-pop sequences into `mov` instructions.


A quick look at the implementation
----------------------------------

The full source is on GitHub at [benhoyt/pyast64](https://github.com/benhoyt/pyast64), but here's a quick look at the implementation.

When writing AST-handling code, you typically write a visitor class that implements `visit_*` methods to visit each AST node type, for example `visit_FunctionDef` or `visit_Add`. There's a simple standard library `ast.NodeVisitor` class that you can subclass to do the lookups, but I implemented my own because I wanted it to fail hard on unknown node types instead of calling the `generic_visit` fallback.

Python's dynamic attributes and `getattr()` function makes this trivial:

```python
class Compiler:
    def visit(self, node):
        name = node.__class__.__name__
        visit_func = getattr(self, 'visit_' + name, None)
        assert visit_func is not None, '{} not supported'.format(name)
        visit_func(node)

    def visit_Module(self, node):
        for statement in node.body:
            self.visit(statement)

    def visit_FunctionDef(self, node):
        ...
```

And here is how the meat of the node types are implemented (for a selection of simple node types):

```python
    def visit_Num(self, node):
        # A constant, just push it on the stack
        self.asm.instr('pushq', '${}'.format(node.n))

    def local_offset(self, name):
        # Calculate the offset of the given local variable
        index = self.locals[name]
        return (len(self.locals) - index) * 8 + 8

    def visit_Name(self, node):
        # Push the value of a local on the stack
        offset = self.local_offset(node.id)
        self.asm.instr('pushq', '{}(%rbp)'.format(offset))

    def visit_Assign(self, node):
        # Assign (set) the value of a local variable
        assert len(node.targets) == 1, \
            'can only assign one variable at a time'
        self.visit(node.value)
        offset = self.local_offset(node.targets[0].id)
        self.asm.instr('popq', '{}(%rbp)'.format(offset))

    def simple_binop(self, op):
        self.asm.instr('popq', '%rdx')
        self.asm.instr('popq', '%rax')
        self.asm.instr(op, '%rdx', '%rax')
        self.asm.instr('pushq', '%rax')

    def visit_Add(self, node):
        self.simple_binop('addq')

    def visit_Sub(self, node):
        self.simple_binop('subq')

    def visit_Call(self, node):
        assert not node.keywords, 'keyword args not supported'
        for arg in node.args:
            self.visit(arg)
        self.asm.instr('call', node.func.id)
        if node.args:
            # Caller cleans up the arguments from the stack
            self.asm.instr('addq', '${}'.format(
                    8 * len(node.args)), '%rsp')
        # Return value is in rax, so push it on the stack now
        self.asm.instr('pushq', '%rax')
```

When a `FunctionDef` node is encounted, we use another visitor class (this time an `ast.NodeVisitor` subclass) to whip through the AST of that function and find the names and number of local variables. We store a dict of variable name to index that's used to calculate stack offsets when fetching and storing locals.

In my toy language, the only node types that can "create" locals are assignment and `for` loops, so here's that visitor class in its entirety:

```python
class LocalsVisitor(ast.NodeVisitor):
    def __init__(self):
        self.local_names = []

    def add(self, name):
        if name not in self.local_names:
            self.local_names.append(name)

    def visit_Assign(self, node):
        assert len(node.targets) == 1, \
            'can only assign one variable at a time'
        self.visit(node.value)
        self.add(node.targets[0].id)

    def visit_For(self, node):
        self.add(node.target.id)
        for statement in node.body:
            self.visit(statement)
```

In addition to the `Compiler` class, there's an `Assembler` class that actually outputs the assembly instructions, labels, etc. This class also implements the peephole optimizer to combine sequences of pushes and pops into moves. Here's the structure of that:

```python
class Assembler:
    def __init__(self, output_file=sys.stdout, peephole=True):
        self.output_file = output_file
        self.peephole = peephole
        # Current batch of instructions, flushed on label and
        # end of function
        self.batch = []

    def instr(self, opcode, *args):
        # Output a single instruction with given args
        self.batch.append((opcode, args))

    def flush(self):
        if self.peephole:
            self.optimize_pushes_pops()
        for opcode, args in self.batch:
            args_str = ', '.join(str(a) for a in args)
            print('\t{}\t{}'.format(opcode, args_str),
                  file=self.output_file)
        self.batch = []

    def optimize_pushes_pops(self):
        """This finds runs of push(es) followed by pop(s) and combines
        them into simpler, faster mov instructions. For example:

        pushq   8(%rbp)
        pushq   $100
        popq    %rdx
        popq    %rax

        Will be turned into:

        movq    $100, %rdx
        movq    8(%rbp), %rax
        """
        ...
```

Again, go to the [GitHub repo](https://github.com/benhoyt/pyast64) to browse the full source -- it's only 500 lines of code including blanks and comments.


Example of output
-----------------

There are a couple of examples (the `*.p64` files) in the source tree. Below is the simplest of them: [forloop.p64](https://github.com/benhoyt/pyast64/blob/master/forloop.p64), which simply prints the letters A through J using a `for` loop:

```python
def loop():
    for i in range(10):
        putc(65 + i)            # 65 is 'A'

def main():
    loop()
```

Note that `for i in range(10)` is not compiled directly, but expanded to a `while` loop:

```python
i = 0
while i < 10:
    putc(65 + i)
    i = i + 1
```

To give you a taste of the output, the `loop` function compiles to the following assembly (with some comments added afterward):

```
loop:
        pushq   $0              # allocate stack space for "i"
        pushq   %rbp            # save and setup frame pointer
        movq    %rsp, %rbp
        movq    $0, 8(%rbp)     # i = 0
loop_1_while:
        movq    $10, %rdx       # rax = 1 if i < 10 else 0
        movq    8(%rbp), %rax
        cmpq    %rdx, %rax
        movq    $0, %rax
        jnl     loop_3_less
        incq    %rax
loop_3_less:
        cmpq    $0, %rax        # if bool is zero, break
        jz      loop_2_break
        movq    8(%rbp), %rdx   # 65 + i
        movq    $65, %rax
        addq    %rdx, %rax
        pushq   %rax            # putc()
        call    putc
        addq    $8, %rsp
        movq    $1, %rdx        # i = i + 1
        movq    8(%rbp), %rax
        addq    %rdx, %rax
        movq    %rax, 8(%rbp)
        jmp     loop_1_while
loop_2_break:
        popq    %rbp            # restore frame pointer
        leaq    8(%rsp),%rsp    # deallocate stack space for "i"
        ret                     # return to caller
```


A quick benchmark
-----------------

Again, this is very much a toy, and the assembly output is pretty terrible. But benchmarks are fun (and Python is slow at integer math), so I did a quick benchmark that sums the first 100,000,000 integers:

```python
def main():
    sum = 0
    for i in range(100000000):
        sum += i
```

I also compared to a slightly more idiomatic version that only works in actual Python using `sum(range(100000000))`, as well as a [C version](https://github.com/benhoyt/pyast64/blob/master/benchmark_for.c) of the same loop for reference. On my MacBook Pro 2.5GHz i7, here are the results:

<table>
    <thead>
        <tr><th>version</th><th>time (s)</th><th>ratio</th></tr>
    </thead>
    <tbody>
        <tr><td>python 3.5</td><td>7.0</td><td>1.0</td></tr>
        <tr><td>python 3.5 with sum()</td><td>2.2</td><td>3.2</td></tr>
        <tr><td>pyast64 without peephole</td><td>0.55</td><td>12.7</td></tr>
        <tr><td>pyast64 with peephole</td><td>0.24</td><td>29.7</td></tr>
        <tr><td>C version (<code>gcc -O0</code>)</td><td>0.22</td><td>31.8</td></tr>
    </tbody>
</table>

So there you go: my 500-line toy compiler executes an integer-summing loop 30x as fast as Python, and on a par with `gcc` with optimizations disabled (`gcc -O2` optimizes the entire loop away to a constant).

Enjoy! Just don't try to use it for real projects anytime soon. :-)

Please write your comments on [Hacker News](https://news.ycombinator.com/item?id=14644576) or [programming reddit](https://www.reddit.com/r/programming/comments/6js83f/compiling_python_syntax_to_x8664_assembly_for_fun/).


{% include sponsor.html %}
