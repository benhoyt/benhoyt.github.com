---
layout: default
title: "Compiling Python syntax to x86-64 assembly for fun and (zero) profit"
permalink: /writings/pyast64/
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">June 2017</p>

> Summary: I used Python's built-in AST module to parse a subset of Python syntax and turn it into an x86-64 assembly program. It's basically a toy, but it shows how easy it is to use the `ast` module to co-opt Python's lovely syntax for your own ends.

One of the reasons people like Python is because of its readable, low-punctuation syntax. You can write an algorithm in pseudocode, and then a minute later realize you've just written valid Python. So why not use Python's syntax -- and even its parser -- for your own evil schemes?

Recently I was doing some performance work on Python bytecode (story for another day), and I wondered, "Hmmm, what if Python bytecode was just x86 code?" That is, why have a bytecode interpreter when you have a super-speedy native interpreter right there in your CPU. I'm sure this idea isn't original with me, and it has probably been tried and found wanting. For one thing, Python's data and memory model is *much* different and higher-level than the x86's.

I still think that's an interesting idea, but I decided to try my hand at a much smaller and more fun problem: using the Python [`ast`](https://docs.python.org/3/library/ast.html) (abstract syntax tree) module to parse Python syntax, then recursively visit the AST nodes to turn them into another language. I thought it'd be easiest to generate C, but then I decided that going straight to (very unoptimized) assembly would be more fun.


Enter pyast64
-------------

I've written a bunch of 8086 and 80386 assembly back in the day, but have never actually had the need to write 64-bit x86 code. ("What's this `rax` thing? I've only heard of `ax` and `eax`.") These days almost everything is 64-bit, and I spend most of my time (alas) on macOS, so I'm generating x86-64 code for macOS. It wouldn't be hard to port it Linux, though Windows might be a bit more work.

Outputting assembly source is easier than outputting machine code and an executable directly, so that's what I did, letting `as` and `ld` take care of assembly and linking. I'm not a fan of AT&T assembly syntax, but that's what's built in, so I used it.

I chose to keep it really simple: my language looks like Python, but it's definitely not. The only data type is integers, and the only output mechanism is a predefined `putc` function (adding `getc` for input is left as an exercise for the reader). 

The compiler uses a simple `%rbp`-based stack frame to handle an arbitrary number of local variables. It supports `while` loops, as well as `for i in range()` loops -- `for` is implemented in terms of `while`. It supports `if`/`else`, comparisons, logical `and` and `or`, the four basic math operators, and recursion.

If I felt the urge to make it more than a toy, I'd use Python 3's type annotations to support different data types like floating point and strings, and I'd add some features to allocate and use memory arrays. Oh, and things like `*args` and default arguments.

To keep it simple, the assembly output is very dumb, basically ignoring the fact that the x86-64 has a whole slew of registers, and just using `%rax` and `%rdx` for calculations and the stack for the rest. However, there's a small peephole optimizer which turns push-then-pop sequences into `mov` instructions.


A quick look at the implementation
----------------------------------

The project is on GitHub at [benhoyt/pyast64](https://github.com/benhoyt/pyast64), but here's a quick look at the implementation. It's 500 lines of code (including blanks and comments).

TODO


An example
----------

There are a couple of examples (the `*.p64` files) in the source tree. Below is the simplest of them: [forloop.p64](https://github.com/benhoyt/pyast64/blob/master/forloop.p64), which simply prints the letters `A` through `J` using a `for` loop:

```python
def loop():
    for i in range(10):
        putc(65 + i)

def main():
    loop()
```

Note that the `for i in range(10)` loop is essentially expanded to:

```python
i = 0
while i < 10:
    putc(65 + i)
    i = i + 1
```

To give you a taste of the output, the `loop` function compiles to the following assembly:

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


Benchmark
---------

Again, this is very much a toy, and the assembly output is very unoptimized. But benchmarks are fun (and Python is slow at integer math), so I did a quick benchmark that sums the first  100,000,000 integers:

```python
def main():
    sum = 0
    for i in range(100000000):
        sum += i
```

I also compared a slightly more idiomatic version that only works in actual Python using `sum(range(100000000))`. On my Mac, here are the results:

    version                     time (s)   ratio
    --------------------------------------------
    python 3.5                  7.0        1.0
    python 3.5 with sum()       2.2        3.2
    pyast64 without peephole    0.55       12.7
    pyast64 with peephole       0.24       29.7

So there you go: my 500-line toy compiler executes an integer-summing loop 30x as fast as Python.

So enjoy! Just don't try to use it for real projects anytime soon. :-)

TODO: Please write your comments on [Hacker News](TODO) or [programming reddit](TODO).
