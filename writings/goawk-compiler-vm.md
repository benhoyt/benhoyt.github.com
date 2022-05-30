---
layout: default
title: "Optimizing GoAWK with a bytecode compiler and virtual machine"
permalink: /writings/goawk-compiler-vm/
description: "How I sped up GoAWK by switching from a tree-walking interpreter to a bytecode compiler and virtual machine interpreter."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2022</p>


> Summary: I recently sped up GoAWK by switching from a tree-walking interpreter to a bytecode compiler with a virtual machine interpreter. I discuss why it's faster and how the new interpreter works.
>
> **Go to:** [Why VMs?](#why-are-virtual-machines-faster-than-tree-walking) \| [Details](#compiler-and-virtual-machine-details) \| [Go's `switch`](#gos-switch-statement) \| [Other optimizations](#other-optimizations-and-a-de-optimization) \| [Results](#virtual-machine-results) \| [Conclusion](#conclusion)


*Update: GoAWK now includes native [support for CSV files](/writings/goawk-csv/).*

A few years ago I wrote [GoAWK](https://github.com/benhoyt/goawk), an AWK interpreter written in Go, along with an [article](/writings/goawk/) describing how it works, how it's tested, and how I made it faster.

GoAWK has been a fun side project, and is [used](https://www.benthos.dev/docs/components/processors/awk) in at least one sizeable open source project, the [Benthos](https://github.com/Jeffail/benthos) stream processor. It even landed me my current job at Canonical.

GoAWK previously used a [tree-walking interpreter](/writings/goawk/#interpreter): to execute a code block, it recursively walked the parsed syntax tree. That's very simple, but not particularly fast. I've been wanting to switch to a bytecode compiler and virtual machine interpreter for a while, and I finally got around to it.

One of my early programming projects was [Third](https://github.com/benhoyt/third), a [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) compiler for DOS. Most Forth compilers, including Third, are simple compilers that use a form of bytecode -- called [threaded code](https://en.wikipedia.org/wiki/Threaded_code) in the Forth world. So I guess you could say I've been interested in virtual machines for 25 years ... does that make me a true geek, or just old?


## Why are virtual machines faster than tree-walking?

It's not immediately obvious why compiling to virtual instructions and then executing them with a virtual machine is faster than evaluating a syntax tree ("tree-walking").

It's actually *more* work up-front: instead of just lexing and parsing into a syntax tree, we now also have a compile step. That said, virtual machine compilers (including GoAWK's) are usually very simple and non-optimizing, so that step is fast.

One reason it's faster to execute is this: RAM -- which stands for Random Access Memory -- is not actually *random access* on modern processors. Memory blocks are loaded into fast CPU caches as needed, so when you have to access a new block, it takes about 10x as long as if it's in the cache. Peter Norvig's table of [timings for various operations on a typical CPU](http://norvig.com/21-days.html#answers) shows how fetching from level 1 cache takes about 0.5 nanosecond, fetching from level 2 cache 14x that long, and fetching from main memory another 14x!

Programming with this in mind is called "data-oriented design". I was reminded of how much impact this makes when watching Andrew Kelley's excellent talk, [A Practical Guide to Applying Data-Oriented Design](https://media.handmade-seattle.com/practical-data-oriented-design/). Andrew is the creator of the [Zig programming language](https://ziglang.org/), and his talk describes how he significantly sped up the Zig compiler by applying data-oriented design techniques. That talk was what pushed me to think about this for GoAWK. But back to why a virtual machine is faster than tree-walking...

A syntax tree is a bunch of node structures that point to other nodes. They're scattered around in memory, so to evaluate the child nodes you have to follow pointers and jump around in RAM, possibly evicting whatever's in the cache already.

Here's a diagram of the GoAWK syntax tree for the expression `print $1+$2`, showing the memory address in hex above each node name:

<p align="center"><img alt="Syntax tree for 'print $1+$2'" src="/images/goawk-ast-example.svg"></p>

The `PrintStmt` is only 48 bytes from the `BinaryExpr`, but the left `FieldExpr` is 8KB from that, and then its `NumExpr` is almost 120KB away from that. Cache blocks are typically 64 bytes, so each of those probably requires loading an additional cache block from main memory. Not very cache-friendly.

With a virtual machine interpreter, the instructions are in a nice linear array of opcodes (instruction numbers), which will probably be loaded into a cache block all at once. There's much less jumping around in RAM. Here's what the GoAWK virtual machine instructions for that same program look like (you can see this "assembly listing" with the new debug flag, `goawk -da`):

```
$ echo 3 4 | goawk -da '{ print $1+$2 }'
        // { body }
0000    FieldInt 1
0002    FieldInt 2
0004    Add
0005    Print 1    // 1 is the number of values to print

7
```

One of the (relatively few) optimizations GoAWK's compiler does is shown here: it turns `$i` into a single `FieldInt i` instruction when `i` is an integer constant, rather than the two-instruction sequence `Num i` followed by `Field`. This means most field lookups only go through the opcode decoding loop once instead of twice.

Another reason the virtual machine approach is faster is because there are fewer function calls, and function calls are relatively slow. When evaluating a syntax tree, the `eval` function recursively calls `eval` again to evaluate child nodes. With a virtual machine, that's all flattened into a single array of opcodes that we loop over -- no function calls are needed for dispatching opcodes.


## Compiler and virtual machine details

GoAWK's virtual machine uses 32-bit opcodes. Initially I was going to use 8-bit opcodes (where the "byte" in "bytecode" comes from), but 32-bit opcodes were just as fast, and with 32-bit opcodes you avoid the need for variable sized jump offsets: larger AWK scripts may need more than -128 to +127 jump offsets, whereas nobody's going to need bigger jump offsets than the two billion that 32 bits gives you. 64-bit opcodes are unnecessary big, and they were slightly slower as well.

Here are the first 10 opcodes (there are 85 total -- you can see the full list in [internal/compiler/opcodes.go](https://github.com/benhoyt/goawk/blob/master/internal/compiler/opcodes.go)):

```go
// Opcode represents a single virtual machine instruction (or argument).
// The comments beside each opcode show any arguments that instruction
// consumes.
type Opcode int32

const (
    Nop Opcode = iota

    // Stack operations
    Num // numIndex
    Str // strIndex
    Dupe
    Drop
    Swap

    // Fetch a field, variable, or array item
    Field
    FieldInt    // index
    Global      // index
    Local       // index
    ...
)
```

As you can see in the `print $1+$2` assembly listing above, I'm using a stack-based virtual machine. This is simpler to implement, because the compiler doesn't need to figure out how to allocate registers, it just pushes to and pops from the stack. Stack-based virtual machines may be slightly slower, however -- very fast virtual machines like Lua's are register-based.

GoAWK's compiler is quite simple, with a fairly direct translation from the syntax tree to instructions. I use some specializations for accessing variables of different scopes: for example, fetching a global variable uses the `Global` instruction, fetching a local uses `Local`. (As you can see, my instruction naming scheme is extremely creative.)

Here's the assembly listing for a simple program that sums the numbers from 1 through 10:

```
$ goawk -da 'BEGIN { for (i=1; i<=10; i++) sum += i; print sum }'
        // BEGIN
0000    Num 1 (0)
0002    AssignGlobal i
0004    Global i
0006    Num 10 (1)
0008    JumpGreater 0x0018
000a    Global i
000c    AugAssignGlobal AugOpAdd sum
000f    IncrGlobal 1 i
0012    Global i
0014    Num 10 (1)
0016    JumpLessOrEqual 0x000a
0018    Global sum
001a    Print 1

55
```

This shows a neat little optimization I copied from Python, whose interpreter added it in Python 3.10 (though I'm sure it's not a new idea). To compile a `for` or `while` loop, it'd be simplest just to do the test at the top, and then use an unconditional `Jump` at the bottom of the loop. But that means you're executing two jump instructions every loop: one at the top and one at the bottom.

Instead, we compile the condition twice: once inverted before the loop (`JumpGreater`) and once at the bottom of the loop (`JumpLessOrEqual`). This is slightly more code overall because the condition is repeated, but the loop itself -- which is what matters -- is one jump instruction shorter.

We could almost certainly improve the instruction set further, perhaps adding special instructions for integers or strings when we know the type of the operation ahead of time. That adds complexity, however, and for now I'm going to keep it simple.

The one other optimization the GoAWK compiler does is for assignments. Assignments in AWK are expressions, so by default you'd push their value on the stack ... only to discard it right away in most cases. And you rarely use the value of an assignment expression.

Here's the assembly for an optimized assignment expression:

```
$ ./goawk -da 'BEGIN { x=42; print x }'
        // BEGIN
0000    Num 42 (0)
0002    AssignGlobal x
0004    Global x
0006    Print 1

42
```

And here's what it would look like if we didn't have that optimization:

```
0000    Num 42 (0)
0002    Dupe              # unnecessary
0003    AssignGlobal x
0005    Drop              # unnecessary
0006    Global x
0008    Print 1
```

Below is the [code that compiles statements](https://github.com/benhoyt/goawk/blob/16012e2ff77343e6fe93edcb243ad9df08e507b7/internal/compiler/compiler.go#L190), showing the special case used for this optimization. I also include how we compile `if` statements, to show something quite different. Note how the compiler makes heavy use of Go's type switch:

```go
func (c *compiler) stmt(stmt ast.Stmt) {
    switch s := stmt.(type) {
    case *ast.ExprStmt:
        // Optimize assignment expressions to avoid extra Dupe and Drop
        switch expr := s.Expr.(type) {
        case *ast.AssignExpr:
            c.expr(expr.Right)
            c.assign(expr.Left)
            return

        case *ast.IncrExpr:
            ... // similar optimization for i++ and i--

        case *ast.AugAssignExpr:
            ... // similar optimization for i+=2 (for example)
        }

        // Non-optimized ExprStmt: push value and then drop it
        c.expr(s.Expr)
        c.add(Drop)

    ...

    case *ast.IfStmt:
        if len(s.Else) == 0 {
            jumpOp := c.condition(s.Cond, true)
            ifMark := c.jumpForward(jumpOp)
            c.stmts(s.Body)
            c.patchForward(ifMark)
        } else {
            jumpOp := c.condition(s.Cond, true)
            ifMark := c.jumpForward(jumpOp)
            c.stmts(s.Body)
            elseMark := c.jumpForward(Jump)
            c.patchForward(ifMark)
            c.stmts(s.Else)
            c.patchForward(elseMark)
        }

    ...
    }
}
```

The virtual machine [`execute`](https://github.com/benhoyt/goawk/blob/e3a7a275348b7b44653276ebfccda61971461897/interp/vm.go#L30) function is a single `for` loop with a big `switch` statement -- one `case` for each opcode. Here's a snippet showing the instruction fetching and the code to handle a few of the opcodes:

```go
func (p *interp) execute(code []compiler.Opcode) error {
    for ip := 0; ip < len(code); {
        op := code[ip]
        ip++

        switch op {
        case compiler.Num:
            index := code[ip]
            ip++
            p.push(num(p.nums[index]))

        case compiler.Str:
            index := code[ip]
            ip++
            p.push(str(p.strs[index]))

        case compiler.Dupe:
            v := p.peekTop()
            p.push(v)

        ...

        case compiler.FieldInt:
            index := code[ip]
            ip++
            v, err := p.getField(int(index))
            if err != nil {
                return err
            }
            p.push(v)

        ...
        }
    }
}
```


## Go's switch statement

As shown above, the virtual machine is implemented as a big `switch` statement with one `case` per opcode (around 80 cases). Go's `switch` statement is currently implemented as a binary search through the "case space". You can think of it as compiling to something like this -- for brevity, only a few branches of the tree are shown in full:

```go
if op < 40 {
    if op < 20 {
        if op < 10 {
            if op < 5 {
                if op < 2 {
                    if op < 1 {
                        // handle opcode 0
                    } else {
                        // handle opcode 1
                    }
                } else {
                    // cases for opcodes 2-4
                }
            } else {
                // cases for opcodes 5-9
            }
        } else {
            // cases for opcodes 10-19
        }
    } else {
        // cases for opcodes 20-39
    }
} else {
    if op < 60 {
        // cases for opcodes 40-59
    } else {
        // cases for opcodes 60-79
    }
}
```

As you can see, you need to do O(log<sub>2</sub> N) comparisons and jumps to get down to the case you're interested in. For 80 opcodes, that's 6 or 7 branches to decode every instruction.

As the number of instructions grows, the number of branches grows too (though thankfully that growth is logarithmic, not linear). When I first coded a proof-of-concept virtual machine for GoAWK and just implemented the 7 or 8 instructions I needed for the demo, it gave a huge performance boost, almost 40% faster, because the `switch` only had a few cases. But now that I have all the opcodes in place, it's "only" 18% faster.

It was actually slower than that when I had around 100 opcodes. I removed some specializations that I had thought would speed things up, but with fewer opcodes it meant one less binary search branch and was actually [12% faster on average](https://github.com/benhoyt/goawk/commit/71e2560da9b5084a175f7a6336c6ecdb5266dc94).

It'd be great if there were a way to get constant time instruction dispatch, no matter how many instructions we have. Why can't Go implement `switch` as a table of jump addresses: look up the code address in a table and jump directly to it? It turns out Keith Randall on the Go team is [working on just that](https://go-review.googlesource.com/c/go/+/357330/), so we may get it in Go 1.19.

I tried Keith's branch (which only works with `int64` types at the moment) on GoAWK, and it [improved the speed](https://groups.google.com/g/golang-dev/c/CO4flfrYeo4/m/RxmdO1oJDQAJ) of a simple microbenchmark by 10%. So I'm definitely looking forward to the Go compiler learning about "jump tables".

Could we do this optimization ourself? What about an array of functions? I tried that, turning the dispatch loop into the following:

```go
func (p *interp) execute(code []compiler.Opcode) error {
    for ip := 0; ip < len(code); {
        op := code[ip]
        ip++

        n, err := vmFuncs[op](p, code, ip)
        if err != nil {
            return err
        }
        ip += n
    }
    return nil
}

// Type of function called for each instruction. Each function returns
// the number of arguments the instruction read from code[ip:].
type vmFunc func(p *interp, code []compiler.Opcode, ip int) (int, error)

var vmFuncs [compiler.EndOpcode]vmFunc

func init() {
    vmFuncs = [compiler.EndOpcode]vmFunc{
        compiler.Nop: vmNop,
        compiler.Num: vmNum,
        compiler.Str: vmStr,
        ...
    }
}

func vmNop(p *interp, code []compiler.Opcode, ip int) (int, error) {
    return 0, nil
}

func vmNum(p *interp, code []compiler.Opcode, ip int) (int, error) {
    index := code[ip]
    p.push(num(p.nums[index]))
    return 1, nil
}

func vmStr(p *interp, code []compiler.Opcode, ip int) (int, error) {
    index := code[ip]
    p.push(str(p.strs[index]))
    return 1, nil
}
```

This only gave me a 1-2% speed increase on GoAWK's microbenchmarks ([see results and code](https://github.com/benhoyt/goawk/commit/8e04b069b621ff9b9456de57a35ff2fe335cf201)). In the end I decided I'd rather stick with the simpler `switch` code and find other ways to improve the speed. And when the Go compiler supports jump tables for `switch`, I'll get a 10% improvement by doing nothing!

The `gcc` compiler has a non-standard feature called "computed goto", which allows you to write something like `goto *dispatch_table[code[ip++]]` at the end of each opcode's code to jump directly to the code for the next opcode. Eli Bendersky has written an [excellent article about computed goto](https://eli.thegreenplace.net/2012/07/12/computed-goto-for-efficient-dispatch-tables), so I won't dwell on it further here. Most virtual machines written in C use this technique, including CPython and many others. Unfortunately Go doesn't have computed goto, but again, when `switch` is compiled to a jump table, that will get us half way there.

If you're interested in reading something a bit more academic about how compilers can optimize `switch`, read the paper ["A Superoptimizer Analysis of Multiway Branch Code Generation [PDF]"](https://www.nextmovesoftware.com/technology/SwitchOptimization.pdf) by Roger Sayle, which was presented at the 2008 GCC Developers' Summit.


## Other optimizations (and a de-optimization)

Apart from converting from tree-walking to a virtual machine, I've recently added a few other optimizations:

* [Buffering output piped to commands](https://github.com/benhoyt/goawk/commit/89aae73fcb0ba6ebbe4981318901a0d696067911), which gave a 10x speedup for print redirection. I got a similar speedup for all print output when I [added buffering to stdout](https://github.com/benhoyt/goawk/commit/60745c3503ba3d99297816f5c7b5364a08ec47ab) originally, but I overlooked adding it for the redirected variant.
* [Only convert numeric strings to number if needed](https://github.com/benhoyt/goawk/commit/b05d0d983d4e96ae518c6af3e846fbb1a15040aa). Previously I was doing the conversion eagerly, now I only do it if the value is required in a number context. This gives a solid improvement on real-world scripts that use `$i` fields as strings, though it did [slow down](https://github.com/benhoyt/goawk/commit/cbe2629f0d8ffa33bc84013a9cb54ac03aac8dcd) comparisons. It gave a 40% speedup for my reasonably real-world word counting script.
* My [optimization for `strings.TrimSpace`](https://go-review.googlesource.com/c/go/+/152917) was included in Go 1.13, so I was able to [remove](https://github.com/benhoyt/goawk/commit/91ddc5b3dcf9c813bdf3378f30d5968abe55b733) my custom version of `TrimSpace` now that GoAWK requires at least Go 1.13.

One problematic [fix](https://github.com/benhoyt/goawk/commit/b7ec795b6716aa2159907cce7a54351dc78b0788) I did was to change GoAWK's string functions, such as `length()` and `substr()`, to use Unicode character indexes rather than byte indexes. I knew this was going to change these operations from O(1) to O(N) in the length of the string, but I figured it wouldn't matter that much because "N is usually small".

That assumption turned out not to be the case: Volodymyr Gubarkov's [gron.awk](https://github.com/xonixx/gron.awk) script went from processing a large JSON file in 1 second to over 8 minutes -- [accidentally quadratic](https://accidentallyquadratic.tumblr.com/). This was untenable, so I decided to revert that fix for now, and figure out an O(1) way to address this in future. Arnold Robbins, long-time maintainer of Gawk, [commented](https://github.com/benhoyt/goawk/issues/35#issuecomment-1020994304) on how Gawk does a lot of work to make string handling efficient.

I hope to optimize GoAWK further in the future, and have opened an [umbrella issue](https://github.com/benhoyt/goawk/issues/91) to track future performance work. Here are some of the ideas:

**Virtual machine improvements.** Here are a few things I'm considering to speed up the virtual machine:

* Optimize or reduce stack operations. The `interp.push` method is particularly slow, due to the `append` check (and the `append` is almost never needed in normal AWK code). Let me know if you have good ideas about how to 
determine the maximum stack size ahead of time. Is it even possible with potentially-recursive function calls?
* Are there any specialized opcodes we could add, such as an `Int` instruction that pushes the integer constant in its argument? Adding `Int` would save a memory lookup to the `interp.nums` slice.
* Presumably `JumpLess` and similar opcodes are not used very often on strings. Would it be better to replace them with `JumpLessNum` to avoid the type check on at least one of the operands? (For strings we'd use a longer instruction sequence.)

**String concatenation** is also unnecessarily expensive due to excess allocations and copying when you're concatenating more than two strings. Currently a multi-concatenation expression like `first_name " " last_name` is compiled to two binary `Concat` instructions:

```
Global first_name
Str " "
Concat
Global last_name
Concat
```
    
It'd be more efficient for the compiler to detect this and output a new `Concat numArgs` instruction, for example:

```
Global first_name
Str " "
Global last_name
Concat 3
```

This is one fewer instruction, but more importantly, it would avoid allocating a temporary string only to have to allocate a new one and copy the bytes over. Concatenating more than two values is quite common in AWK, and this optimization would get better the more values you're concatenating.

**Regular expressions** would be great to speed up. GoAWK currently uses Go's `regexp` package, but unfortunately it's [quite slow](https://github.com/golang/go/issues/26623). This makes AWK scripts that use regular expressions heavily about half the speed of Gawk and almost a quarter the speed of Mawk.

There are two ways to improve this:

1. Write my own regular expression engine (probably trying to port Mawk's directly to Go). This is probably a lot of work, and due to Go's bounds checking and fewer compiler optimizations, might still not be all that fast.
2. Improve the speed of Go's regular expression engine. This would be the better way by far, because everyone who uses Go's `regexp` package would benefit. It's also likely to be quite hard. I may leave this to smarter minds than mine -- perhaps some of [these issues](https://github.com/golang/go/issues?q=is%3Aissue+is%3Aopen+regexp+label%3APerformance) will be fixed over time.


## Virtual machine results

So how much faster *is* the virtual machine interpreter? The microbenchmarks -- which admittedly are mostly not the kind of scripts you'd write in AWK -- got about 18% faster overall. These are elapsed times, so smaller is better (you can see the [original](https://github.com/benhoyt/goawk/commit/16012e2ff77343e6fe93edcb243ad9df08e507b7) or measure them yourself using [benchmark.sh](https://github.com/benhoyt/goawk/blob/master/benchmark.sh) followed by [benchstat.sh](https://github.com/benhoyt/goawk/blob/master/benchstat.sh) to show these deltas):

```
name                    old time/op  new time/op  delta
NativeFunc-8            10.7µs ± 0%  10.8µs ± 0%   +0.67%
BuiltinGsub-8           16.2µs ± 0%  16.2µs ± 0%   +0.36%
BuiltinGsubAmpersand-8  16.2µs ± 0%  16.2µs ± 0%   +0.29%
BuiltinSub-8            13.6µs ± 0%  13.6µs ± 0%     ~   
BuiltinSubAmpersand-8   13.5µs ± 0%  13.6µs ± 0%     ~   
SimplePattern-8          133ns ± 1%   134ns ± 0%     ~   
ConcatLarge-8           8.43ms ± 1%  8.35ms ± 2%     ~   
BuiltinSplitRegex-8     87.9µs ± 0%  87.7µs ± 0%   -0.21%
BuiltinSplitSpace-8     35.4µs ± 0%  35.1µs ± 0%   -0.70%
GetField-8               445ns ± 1%   435ns ± 2%   -2.42%
FuncCall-8              2.84µs ± 0%  2.76µs ± 2%   -2.65%
BuiltinSprintf-8        9.67µs ± 0%  9.23µs ± 0%   -4.58%
RecursiveFunc-8         15.7µs ± 0%  14.9µs ± 0%   -4.95%
ConcatSmall-8            735ns ± 0%   691ns ± 1%   -5.98%
BuiltinMatch-8          2.91µs ± 0%  2.71µs ± 1%   -7.02%
BuiltinIndex-8          1.23µs ± 1%  1.11µs ± 1%   -9.51%
RegexMatch-8            1.24µs ± 1%  1.11µs ± 4%  -10.07%
SetField-8               905ns ± 0%   810ns ± 0%  -10.45%
ForInLoop-8             2.04µs ± 2%  1.78µs ± 4%  -12.86%
ArrayOperations-8        657ns ± 0%   565ns ± 0%  -13.94%
BinaryOperators-8        493ns ± 0%   413ns ± 0%  -16.15%
BuiltinSubstr-8          975ns ± 0%   765ns ± 0%  -21.50%
Comparisons-8            417ns ± 0%   321ns ± 0%  -22.98%
SimpleBuiltins-8        1.00µs ± 0%  0.75µs ± 0%  -25.61%
CondExpr-8               203ns ± 0%   151ns ± 0%  -25.62%
BuiltinLength-8          607ns ± 0%   429ns ± 0%  -29.34%
IfStatement-8            219ns ± 0%   152ns ± 0%  -30.65%
AugAssign-8             1.50µs ± 0%  0.98µs ± 0%  -34.74%
LocalVars-8              479ns ± 0%   300ns ± 2%  -37.32%
Assign-8                 446ns ± 0%   261ns ± 0%  -41.55%
ForLoop-8               4.34µs ± 0%  2.50µs ± 0%  -42.39%
GlobalVars-8             468ns ± 0%   269ns ± 1%  -42.48%
IncrDecr-8               448ns ± 0%   148ns ± 0%  -66.87%
[Geo mean]              2.36µs       1.94µs       -17.90%
```

Increment, decrement, and augmented assignment are so much faster because the virtual machine has dedicated opcodes for them. Variable access has improved considerably too, as have `for` loops, `if` statements, binary operators, and many other benchmarks.

My more "real world" benchmark suite -- most of which I pulled from the [original AWK source](https://github.com/onetrueawk/awk) -- got 13% faster overall. In this table, `goawk` is the new virtual machine interpreter and `orig` is the old tree-walking one. Somewhat unintuitively, the numbers here are the number of times faster it is than the original `awk`, so *bigger is better*.

Test                         | goawk |  orig |   awk |  gawk |  mawk
---------------------------- | ----- | ----- | ----- | ----- | -----
tt.01 (print)                |  2.02 |  1.91 |  1.00 |  1.66 |  2.29
tt.02 (print NR NF)          |  1.59 |  1.60 |  1.00 |  1.77 |  2.20
tt.02a (print length)        |  1.54 |  1.56 |  1.00 |  1.73 |  2.05
tt.03 (sum length)           |  1.32 |  1.27 |  1.00 |  3.85 |  1.83
tt.03a (sum field)           |  1.29 |  1.26 |  1.00 |  4.08 |  1.79
tt.04 (printf fields)        |  0.97 |  0.80 |  1.00 |  1.26 |  2.74
tt.05 (concat fields)        |  0.95 |  0.88 |  1.00 |  1.61 |  2.26
tt.06 (count lengths)        |  1.39 |  1.35 |  1.00 |  2.53 |  1.97
tt.07 (even fields)          |  1.24 |  1.18 |  1.00 |  1.46 |  1.71
tt.08 (even lengths)         |  1.97 |  1.98 |  1.00 |  1.13 |  2.70
tt.09 (regex starts with)    |  2.13 |  2.13 |  1.00 |  2.41 |  5.01
tt.10 (regex ends with)      |  0.34 |  0.34 |  1.00 |  1.45 |  3.40
tt.10a (regex ends with var) |  0.32 |  0.34 |  1.00 |  1.30 |  3.08
tt.11 (substr)               |  2.20 |  2.13 |  1.00 |  1.15 |  3.68
tt.12 (update fields)        |  1.21 |  1.19 |  1.00 |  1.70 |  1.78
tt.13 (array ops)            |  3.14 |  2.62 |  1.00 |  3.11 |  5.92
tt.13a (array printf)        |  2.25 |  1.80 |  1.00 |  1.86 |  4.85
tt.14 (function call)        |  1.17 |  1.09 |  1.00 |  0.64 |  1.56
tt.15 (format lines)         |  0.62 |  0.61 |  1.00 |  0.96 |  2.21
tt.16 (count words)          |  1.47 |  1.21 |  1.00 |  1.27 |  2.12
tt.big (complex program)     |  1.62 |  1.41 |  1.00 |  1.83 |  3.82
tt.x1 (mandelbrot)           |  2.25 |  1.62 |  1.00 |  1.34 |  3.44
tt.x2 (sum loop)             |  1.76 |  1.03 |  1.00 |  1.15 |  2.68
---------------------------- | ----- | ----- | ----- | ----- | -----
**Geo mean**                 | **1.45** | **1.28** | **1.00** | **1.86** | **2.32**


## Conclusion

I definitely like the performance improvements I got. They weren't quite as much as I was hoping for, but the fact that GoAWK is faster than Gawk for many CPU-bound operations now is pretty cool. It's still always slower than the performance-fiend Mawk. And for the stuff that AWK is normally used for -- string processing and regular expressions -- GoAWK still has a lot of room for improvement.

To be honest, I'm not entirely sure it was worth the additional 2500 lines of code (for a project that's only 15,000 lines of code, including tests). If I had an engineering manager overseeing this, I would have expected pushback ("is this going to help us with real-world workloads?"). However, GoAWK was and remains a passion project -- I had fun making and sharing this, and that's enough for me.

I've merged the compiler and virtual machine and released them in [GoAWK v1.15.0](https://github.com/benhoyt/goawk/releases/tag/v1.15.0). The Go API and `goawk` command should be 100% backwards compatible. It's been well-tested against my interpreter tests as well as the tests from the original AWK and the relevant ones from Gawk, but file an [issue](https://github.com/benhoyt/goawk/issues) if you find something amiss.

I hope you've enjoyed or learned from this write-up. Please don't hesitate to contact me with your feedback or ideas.


{% include sponsor.html %}
