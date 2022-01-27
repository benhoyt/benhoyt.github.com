---
layout: default
title: "Optimizing GoAWK with a compiler and virtual machine"
permalink: /writings/goawk-compiler-vm/
description: "TODO"
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2022</p>


<!--
> Summary: TODO
>
> **Go to:** [TODO1](#todo1) \| [TODO2](#todo2)
-->

A few years ago I wrote [GoAWK](https://github.com/benhoyt/goawk), an AWK interpreter written in Go, along with an article describing [how it works, how it's tested, and how I made it faster](https://benhoyt.com/writings/goawk/).

GoAWK has been a fun side project, and has been [used](https://www.benthos.dev/docs/components/processors/awk) in at least one sizeable open source project, the [Benthos](https://github.com/Jeffail/benthos) stream processor. It even landed me my current job at Canonical.

In any case, GoAWK previously used a [tree-walking interpreter](https://benhoyt.com/writings/goawk/#interpreter): to execute a code block, it recursively walked the parsed syntax tree. That's very simple, but not particularly fast. I've been wanting to switch to a bytecode compiler and virtual machine interpreter for a while, and I finally got around to it.

To summarize up front: the new version is definitely faster, though it didn't speed things up as much as I'd hoped. It made the micro-benchmarks about 18% faster (I was hoping for about 40%). On the more "real world" or macro-benchmarks it gave a 10% improvement. (TODO: real numbers)


## My history with virtual machines

I had a unique start in the programming world: my first languages were [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) and x86 assembly. My dad was a minister by day, Forth hacker by night -- as a teen I learned programming partly due to his Forth enthusiasm, and partly reading tutorials written by [demosceners](https://en.wikipedia.org/wiki/Demoscene).

One of my early projects was [Third](https://github.com/benhoyt/third), an ANS-compliant Forth interpreter for 8086 DOS. Most Forth compilers, including mine, are very simple compilers that use a form of bytecode -- called [threaded code](https://en.wikipedia.org/wiki/Threaded_code) in the Forth world. Third used "direct threading", where each instruction is the address of the machine code to jump to.

Often a Forth virtual machine is written in assembly (for example, the well-known [Jonesforth](https://github.com/nornagon/jonesforth/blob/master/jonesforth.S)). You can also do direct threading in C compilers such as gcc that support [computed goto](https://eli.thegreenplace.net/2012/07/12/computed-goto-for-efficient-dispatch-tables).

The heavily-optimized Gforth interpreter uses this approach: it turns out Anton Ertl, one of Gforth's authors, has written a [virtual machine generator](https://www.complang.tuwien.ac.at/anton/vmgen/) and many papers on efficient interpreters.

I guess you could say I've been interested in efficient interpreters for about 25 years. My nerd credentials are impeccable...


## Why are virtual machines faster than tree-walking?

It's not immediately obvious why compiling to virtual instructions and then executing them with a virtual machine is faster than just walking the syntax tree.

It's actually *more* work up-front: instead of just lexing and parsing, we now also have a compile step -- but virtual machine compilers (including GoAWK's) are usually very simple and non-optimizing, so that step is very fast.

The reason it's faster to execute boils down to this: RAM (Random Access Memory) is not actually *random access* on modern processors. Memory blocks are loaded into fast CPU caches as needed, so when you have to access a new block, it takes about 10x as long as if it's in the cache. Peter Norvig's table of [timings for various operations on a typical CPU](http://norvig.com/21-days.html#answers) shows how fetching from level 1 cache takes about 0.5 nanosecond, fetching from level 2 cache 14x that long, and fetching from main memory another 14x!

Programming with this in mind is called "data-driven design". I was reminded of how much impact this makes when watching Andrew Kelley's excellent talk, [A Practical Guide to Applying Data-Oriented Design](https://media.handmade-seattle.com/practical-data-oriented-design/). Andrew is the creator of the Zig programming languages, and his talk describes how we significantly sped up the Zig compiler by applying simple data-driven design techniques. This talk was what pushed me to think about this for GoAWK.

That was a rather lengthy aside ... back to why a virtual machine is faster than tree walking. A syntax tree is a bunch of node structs that point to other nodes. They're scattered around in memory, so to evaluate the child nodes you have to follow pointers and jump around in RAM, possibly evicting whatever's in the cache already.

Here's a diagram of the GoAWK syntax tree for the expression `print $1+$2`, showing the memory address in hex above each node name:

<p align="center"><img alt="Syntax tree for 'print $1+$2'" src="/images/goawk-ast-example.svg"></p>

The `PrintStmt` is only 48 bytes from the `BinaryExpr`, but the left `FieldExpr` is 8KB from that, and then its `NumExpr` is almost 120KB away from that. Cache blocks are typically 64 bytes, so each of those probably requires loading an additional cache block from main memory. Not very cache-friendly.

With a virtual machine interpreter, the instructions are in a nice linear array of opcodes, which will probably be loaded into a cache block all at once. There's much less jumping around in RAM. Here's what the GoAWK virtual machine instructions for that same program looks like (you can see this with the new disassembly flag, `goawk -da '{ print $1+$2 }'`):

```
addr    instruction    comment
----    -----------    -------
0000    FieldInt 1     $1
0002    FieldInt 2     $2
0004    Add            +
0005    Print 1        print (1 is the number of values to print)
```

One of the (relatively few) optimizations GoAWK's compiler does is shown here: it turns `$i` into a single `FieldInt i` instruction when *i* is an integer constant, rather than the two-instruction sequence `Num i` and `Field`. This means most field lookups only go through the opcode decode loop once instead of twice.

Additionally, with the interpreter's for loop and big `switch`, there are fewer function calls, which are relatively slow. When evaluating a syntax tree, the `eval` function recursively calls `eval` again to evaluate child nodes. With a virtual machine, that's all flattened into a single array of opcodes that we loop over -- no function calls are needed for dispatching opcodes.



## Compiler and virtual machine details

GoAWK's virtual machine uses 32-bit opcodes (`type Opcode int32` in Go). Initially I was going to use 8-bit opcodes (where the "byte" in "bytecode" comes from), but I found that 32-bit opcodes were actually slightly faster than 8- or 16-bit ones. Also, with 32-bit opcodes you avoid the need for variable sized jump offsets: larger AWK scripts often need more than -128 to +127 jump offsets. Whereas nobody's going to need bigger jump offsets than two billion (though I do check just in case).

Here are the first 10 opcodes (there are 85 total -- you can see the full list in [internal/compiler/opcodes.go](TODO)):

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

As you can see in the `print $1+$2` assembly listing above, I'm using a stack-based virtual machine. This is simpler to implement, because the compiler doesn't need to figure out how to allocate registers, it just pushes and pops to and from the stack. Stack-based virtual machines may be slightly slower, however -- very fast virtual machines like Lua's are register-based.

GoAWK's compiler is very simple, with an almost direct translation from the syntax tree to instructions. I use some specializations for accessing variables of different scopes: for example, fetching a global variable uses the `Global` instruction, fetching a local uses `Local`. (As you can see, my instruction naming scheme is extremely creative.)

Here's the assembly listing for a very simple program that sums the numbers from 1 through 10:

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

This shows a neat little optimization I copied from Python (whose interpreter added it in Python 3.10). To compile a `for` or `while` loop, it'd be simplest just to do the test at the top, and then use an uncoditional `Jump` at the bottom of the loop. But that means you're executing two jump instructions every loop: one at the top and one at the bottom.

Instead, we compile the condition twice: once inverted before the loop (`JumpGreater 0x0018`) and once at the bottom of the loop (`JumpLessOrEqual 0x000a`). This is slightly more code overall as the condition is repeated, but the loop itself -- which is what matters -- is one jump instruction shorter.

We could almost certainly improve the instruction set further, perhaps adding special instructions for integers or strings, when we know the type of the operation ahead of time. That adds complexity, however, so for now I'm going to keep it simple.

The one other optimization the GoAWK compiler does is for assignments. Assignments in AWK are expressions, so by default you'd push their value on the stack ... only to discard it right away in most cases. And you rarely use the value of an assignment expression.

Compare this optimized assignment expression:

```
$ ./goawk -da 'BEGIN { x=42; print x }'
        // BEGIN
0000    Num 42 (0)
0002    AssignGlobal x
0004    Global x
0006    Print 1

42
```

With what the assembly would look like with that optimized disabled:

```
0000    Num 42 (0)
0002    Dupe              # unnecessary!
0003    AssignGlobal x
0005    Drop              # unnecessary!
0006    Global x
0008    Print 1
```

Here's a snippet of the [code that compiles statements](TODO), showing the special case for this optimization. Note how the compiler makes heavy use of Go's type switch:

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

The virtual machine [`execute` function](TODO) is a single `for` loop with a big `switch` statement, one `case` for each opcode. Here's a snippet:

```go
func (p *interp) execute(code []compiler.Opcode) error {
    for i := 0; i < len(code); {
        op := code[i]
        i++

        switch op {
        case compiler.Num:
            index := code[i]
            i++
            p.push(num(p.nums[index]))

        case compiler.Str:
            index := code[i]
            i++
            p.push(str(p.strs[index]))

        case compiler.Dupe:
            v := p.peekTop()
            p.push(v)

        ...

        case compiler.FieldInt:
            index := code[i]
            i++
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

Go doesn't have "computed goto".

Results of switch vs funcslice

Reducing number of opcodes to 80-ish helped significantly: commit 71e2560da9b5084a175f7a6336c6ecdb5266dc94

Go uses a binary tree of jumps, but looks like it might get a jump table: link to issue.

So maybe the big switch will magically get faster in Go 1.19

Further reading: https://www.nextmovesoftware.com/technology/SwitchOptimization.pdf


## Other recent optimizations

* look in commit history
* concat
* Go 1.17 (?) register-based calling convention
  - maybe do a fun table of GoAWK speed across Go versions from 1.0 (one CPU benchmark and one I/O)
* bytes/unicode saga: https://github.com/benhoyt/goawk/issues/93


## Future work

* faster/smaller value representation?
* Go's slow regexp


## Conclusion

Still not entirely sure it was worth the additional 2500 lines of code, but okay.


{% include sponsor.html %}
