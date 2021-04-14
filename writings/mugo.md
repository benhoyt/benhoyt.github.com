---
layout: default
title: "Mugo, a toy compiler for a subset of Go that can compile itself"
permalink: /writings/mugo/
description: "Mugo is a single-pass compiler for a tiny subset of the Go programming language -- just enough to compile itself."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2021</p>


> Summary: This article presents Mugo, a single-pass compiler for a tiny subset of the Go programming language. It outputs (very naive) x86-64 assembly, and supports just enough of the language to implement a Mugo compiler: `int` and `string` types, slices, functions, locals, globals, and basic expressions and statements.
>
> **Go to:** [Which subset?](#which-subset-of-go) \| [Codegen](#code-generation) \| [Lexer and Parser](#lexer-and-parser) \| [Performance](#performance) \| [Related projects](#related-projects)


I've been fascinated with compilers since I started coding. One of my first programming projects was ["Third"](https://github.com/benhoyt/third), a self-hosted [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) compiler for 8086 DOS. Forth is incredibly easy to compile: there are no expressions or statements, and each space-separated token gets compiled directly to a call instruction -- often via techniques like [direct threading](https://en.wikipedia.org/wiki/Threaded_code#Direct_threading).

Typical languages like C and Go have more complex syntax with expressions and statements, so they require real parsers and code generators. Compilers for these languages are usually complex and powerful, but as we'll see, if you stick to basic types and non-optimized output, you can still write a simple one.

[Mugo](https://github.com/benhoyt/mugo) is kind of in the spirit of the [Obfuscated Tiny C Compiler](https://bellard.org/otcc/) by Fabrice Bellard, though of course mine's far more pedestrian, and won't be [winning the IOCCC](http://www.ioccc.org/years.html#2001) anytime soon. Bellard's compiler implements just enough C to compile itself to a native i386 Linux executable.

I wanted to do something a bit like that with Go, minus the obfuscation. The idea started as a shower thought: "I wonder what's the smallest subset of Go that could compile itself?" Fabrice's C compiler is implemented in 2048 bytes of obfuscated C, whereas mine is 1600 lines of formatted Go.

While this was a fun exercise to do over a long weekend, it's very much a toy -- it leaves out all the great features of Go: user-defined types, interfaces, goroutines, channels, maps, garbage collection, even bounds checking! My goal with Mugo was educational: for me, and hopefully also for you. Doing exercises like this helps demystify how our tools work.


## Which subset of Go?

Mugo is a subset of Go, so the [source code](https://github.com/benhoyt/mugo/blob/master/mugo.go) can be compiled with Go as well as with Mugo. In my opinion, this makes it much more interesting. It also made it easier to test: when the assembly output of the Go-compiled version was identical to the output of the Mugo-compiled version, I knew it was working -- it was a beautiful thing when `diff mugo2.asm mugo3.asm` showed no output!

Before I started, I mulled over which subset of features I should include. I knew I'd need some kind of container type to store compiler state: for example, the names and types of variables, and function signatures and return types. But which container?

Go has pointers, and they're safer but not nearly as powerful as C's, because you can't do pointer arithmetic. Bellard's compiler makes heavy use of C pointers, but those weren't going to work in Go.

What about structs or maps? Well, those were going to be more complex to implement, and don't really solve the most common problem of storing a list of things. So I decided I could do without all those, and just needed slices.

Here's what Mugo supports:

* The `int` type, decimal integer literals, character constants, and most expressions that operate on `int`: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `<=`, `>`, and `>=`, with operator precedence handled as per Go. The compiler recognizes the type name `bool` but treats it identically to `int` (`&&`, `||`, and `!` operate on these pseudo-bools).
* The `string` type, including string constants with `\` escapes, string equality tests using `==` or `!=`, string concatenation with `+`, and `len()`.
* Slices, but only `[]int` and `[]string`. Slice literals and `make()` are not supported, so to build a slice you have to create an empty slice and `append` to it. Fetching and assigning slice items is supported, as are `slice[:n]` expressions and `len()`.
* Type checking is present but incomplete. I check types in places where it made sense or where it helped with debugging, but it's certainly not exhaustive.
* Statements: `if` and `else`, `for condition { ... }`, `return`, and Go's `:=` short variable declaration.
* Variables and constants. However, `var` and `const` are only supported at the top level; you have to use `:=` for locals (which is more common in Go anyway). Only typed integer constants are supported.
* Top-level functions, including recursion. However, function values and anonymous functions are not supported. Functions can only have a single return value, and variadic functions aren't included.
* I/O, using three pre-defined functions: `getc` reads a single character from stdin, `print` and `log` write strings to stdout and stderr.
* Go grammar, but pared down to just what's needed here. A lot of constructs are not supported, for example `++` and `--`, `for range` loops, and many others. Single-line comments with `//` are supported.

And that's about it! If I've left it out of the above list, it's probably not included. Like I said, a *small* subset.

I consulted the nice and concise [Go language spec](https://golang.org/ref/spec) a bunch while building this, though I've almost certainly got some things wrong. However, what is implemented does seem to work like Go, as shown by my "diff test".


## Code generation

Mugo is a single-pass compiler that outputs x86-64 assembly from the parser as it goes. (It's written for Linux, but it wouldn't be hard to get it working on macOS or Windows.) There's no in-memory abstract syntax tree -- it would be tricky to build that with only slices in any case.

It's also very naive. There's no optimization -- I basically turn my powerful register-based CPU into a dumb stack machine, and `push` and `pop` intermediate values to and from the stack. Probably half the complexity of a real compiler is in the code generation -- the other half is in the type checking -- and both of those things are incredibly simplified in Mugo.

One of the tricks I had to play was for local variable declarations (with Go's `:=` syntax). Because there's only one pass, you don't know how many locals you'll have or what their types are until you've finished parsing the function. So my function prologue, apart from the usual `rbp` frame pointer dance, subtracts 64 bytes from the stack pointer to allow space for up to 8 cells of local variables (the most used in Mugo is 7 cells).

Update: "a1369209993" on Hacker News [pointed out](https://news.ycombinator.com/item?id=26786259) that I could have referenced an assembler constant that was defined at the end of the function, once we know the size. I'm letting the assembler handle that for forward jumps in `if` and `else` already. Thanks!

Here's the full output for an integer `add` function:

```
; func add(x int, y int) int {
;     return x + y
; }

; function prologue
add:
push rbp             ; rbp is the frame pointer
mov rbp, rsp
sub rsp, 64          ; make space for any more locals
                     ; (not used by this function)

; fetch and push local variable x, then y
push qword [rbp+24]
push qword [rbp+16]

; the + operation
pop rbx
pop rax
add rax, rbx
push rax

; pop result back into rax for "return"
pop rax

; function epilogue (restore stack and frame pointer)
mov rsp, rbp
pop rbp
ret 16              ; return, and free space due to
                    ; caller pushing x and y
```

Compared to `gcc`'s [non-optimized output](https://www.godbolt.org/z/d9rcYTbPf), we're not doing *too* badly:

```
push    rbp
mov     rbp, rsp
mov     qword [rbp-8], rdi
mov     qword [rbp-16], rsi
mov     rdx, qword [rbp-8]
mov     rax, qword [rbp-16]
add     rax, rdx
pop     rbp
ret
```

However, `gcc`'s [optimized output](https://www.godbolt.org/z/oobvPfnvG) produces a single, register-based instruction:

```
lea     rax, [rdi+rsi]
ret
```

On the caller side, to generate a call to `add`, Mugo produces the following code:

```
; add(1, 2)

push qword 1  ; push first arg
push qword 2  ; push second arg
call add      ; call the function
push rax      ; push return value back to stack
```

As you can see, Mugo uses its own very inefficient [ABI](https://en.wikipedia.org/wiki/Application_binary_interface) that's nothing like the [x86-64 ABI](https://eli.thegreenplace.net/2011/09/06/stack-frame-layout-on-x86-64) -- the standard ABI puts the first six "cells" (64-bit values) in registers.

For simplicity, Mugo's ABI pushes arguments onto the stack. They're pushed in order, so they end up on the stack in reverse order in memory. However, Mugo does use registers for return values: `rax`, and then `rbx` and `rcx` if there are more cells. Just like in Go, an `int` is one cell, a `string` is two (address and length), and a slice is three (address, length, and capacity).

For allocating memory for string concatenation and slice appending, Mugo uses a trivial "bump allocator". In other words, it bumps a pointer along in a fixed 1MB chunk of memory, and exits with an out-of-memory message if that gets used up. It never frees memory, and there's no garbage collector. Ideal for short-running programs!

To generate the assembly, Mugo simply calls `print` to write to standard output:

```go
func genFuncStart(name string) {
    print("\n")
    print(name + ":\n")
    print("push rbp\n")
    print("mov rbp, rsp\n")
    print("sub rsp, " + itoa(localSpace) + "\n") // space for locals
}
```

Once Mugo has run, I use [NASM](https://nasm.us/) to assemble the output, and the [`ld`](https://linux.die.net/man/1/ld) linker to build an executable. Here's an example from the [Makefile](https://github.com/benhoyt/mugo/blob/master/Makefile) showing how I build three versions of the compiler:

```
# Build the compiler with Go
mugo:
    go build -o build/mugo

# Build the compiler with the Go-built Mugo
mugo2:
    build/mugo <mugo.go >build/mugo2.asm
    nasm -felf64 -o build/mugo2.o build/mugo2.asm
    ld -o build/mugo2 build/mugo2.o

# Build the compiler with the Mugo-built Mugo
mugo3:
    build/mugo2 <mugo.go >build/mugo3.asm
    nasm -felf64 -o build/mugo3.o build/mugo3.asm
    ld -o build/mugo3 build/mugo3.o
    diff build/mugo2.asm build/mugo3.asm  # ensure output matches!
```

There's also a make target to produce a coverage report from a [simple test](https://github.com/benhoyt/mugo/blob/master/mugo_test.go) that runs the compiler on itself. The test simply calls Mugo's `main()`, so we run the test binary with a coverage profile turned on, and send `mugo.go` to the process's standard input. The "test" is to compile the full source code of the compiler and record what coverage we get:

```
coverage:
    go test -c -o build/mugo_test -cover
    build/mugo_test -test.coverprofile build/coverage.out \
        <mugo.go >/dev/null
    go tool cover -html build/coverage.out -o build/coverage.html
```

I initially included a couple of features that the compiler didn't use, so they weren't tested, and showed up as red in the coverage report. Apart from a [couple of things](https://github.com/benhoyt/mugo/blob/0875a24debe784e380be020d977a8daa27f337db/mugo.go#L1552-L1573) that it just seemed consistent to have, like the `!` not operator and string slice assignment, I removed unused features. Now I have [full coverage](https://htmlpreview.github.io/?https://github.com/benhoyt/mugo/blob/master/coverage.html#file1) of the features, excluding error handling.

Once or twice I had to break out `gdb` for debugging. My x86 assembly skills are definitely rusty, and I've never written serious 64-bit assembly. I'm sure there are many ways to improve the output, even with the one-pass constraint -- but I've left those improvements as an exercise for the reader. :-)


## Lexer and parser

Go has nice, simple syntax that's easy to tokenize and parse. Mugo uses a single character of lookahead in its lexer, and a typical recursive-descent parser.

The [lexer](https://github.com/benhoyt/mugo/blob/0875a24debe784e380be020d977a8daa27f337db/mugo.go#L88) is basically a big set of `if` statements on the next character, which is stored in a global integer `c`. Here's a snippet of what it looks like:

```go
func next() {
    // Skip whitespace and comments, and look for / operator
    for c == '/' || c == ' ' || c == '\t' || c == '\r' || c == '\n' {
        if c == '/' {
            nextChar()
            if c != '/' {
                token = tDivide
                return
            }
            nextChar()
            // Comment, skip till end of line
            for c >= 0 && c != '\n' {
                nextChar()
            }
        } else if c == '\n' {
            nextChar()
            // Semicolon insertion: golang.org/ref/spec#Semicolons
            if token == tIdent || token == tIntLit || token == tStrLit ||
                token == tReturn || token == tRParen ||
                token == tRBracket || token == tRBrace {
                token = tSemicolon
                return
            }
        } else {
            nextChar()
        }
    }
    if c < 0 {
        // End of file
        token = tEOF
        return
    }

    // Integer literal
    if isDigit(c) {
        tokenInt = c - '0'
        nextChar()
        for isDigit(c) {
            tokenInt = tokenInt*10 + c - '0'
            nextChar()
        }
        token = tIntLit
        return
    }

    // ... handle other tokens (snipped) ...
}
```

In the [parser](https://github.com/benhoyt/mugo/blob/0875a24debe784e380be020d977a8daa27f337db/mugo.go#L1074), I've tried to use the names of the productions from the grammar in the Go spec, for example `Expression`, `VarSpec`, and `Operand`. Many of them are slimmed-down from what's in the Go spec, of course, because we're dealing with a subset of the language. Here are a couple of examples of parsing functions -- note how the calls to the the code generation functions are intermingled:

```go
func Literal() int {
    if token == tIntLit {
        genIntLit(tokenInt)
        next()
        return typeInt
    } else if token == tStrLit {
        genStrLit(tokenStr)
        next()
        return typeString
    } else {
        error("expected integer or string literal")
        return 0
    }
}

func SimpleStmt() {
    // Funky parsing here to handle assignments
    identName := tokenStr
    expect(tIdent, "assignment or call statement")
    if token == tAssign {
        next()
        lhsType := varType(identName)
        rhsType := Expression()
        if lhsType != rhsType {
            error("can't assign " + typeName(rhsType) + " to " +
                typeName(lhsType))
        }
        genAssign(identName)
    } else if token == tDeclAssign {
        next()
        typ := Expression()
        defineLocal(typ, identName)
        genAssign(identName)
    } else if token == tLParen {
        genIdentifier(identName)
        typ := Arguments()
        genDiscard(typ) // discard return value
    } else if token == tLBracket {
        next()
        indexExpr()
        expect(tRBracket, "]")
        expect(tAssign, "=")
        Expression()
        genSliceAssign(identName)
    } else {
        error("expected assignment or call not " + tokenName(token))
    }
}

func Statement() {
    if token == tIf {
        IfStmt()
    } else if token == tFor {
        ForStmt()
    } else if token == tReturn {
        ReturnStmt()
    } else {
        SimpleStmt()
    }
}
```

One of the slightly messy things is the "simple statement" above -- with a parser that generated a syntax tree, you'd probably call `Expression` to parse the left-hand side, and then see if there's an `=` or `:=` for assignment, and parse the right-hand side. But we can't call `Expression`, or it will compile code to fetch that expression instead of assign to it. So we have to parse an identifier and then detect whether what's coming next is an assignment, function call, or slice expression. I'm sure the above code doesn't handle all the edge cases correctly, but it's good enough.

Operator precedence is handled using recursive-descent, like `&&` and `||` operators in the following (the names `orExpr` and `andExpr` don't appear in the Go spec):

```go
func andExpr() int {
    typ := comparisonExpr()
    for token == tAnd {
        op := token
        next()
        typRight := comparisonExpr()
        typ = genBinary(op, typ, typRight)
    }
    return typ
}

func orExpr() int {
    typ := andExpr()
    for token == tOr {
        op := token
        next()
        typRight := andExpr()
        typ = genBinary(op, typ, typRight)
    }
    return typ
}

func Expression() int {
    return orExpr()
}
```

There are two recursive forward references in the recursive-descent parser: `Expression` (various functions inside the expression-parsing have to call `Expression`) and `Block` (block elements end up nesting into `Block`). Go doesn't need or allow forward references, so Mugo [pre-defines those two functions](https://github.com/benhoyt/mugo/blob/0875a24debe784e380be020d977a8daa27f337db/mugo.go#L1589-L1591) with the correct signature when it starts up.

The compiler keeps track of variable names and type information in a set of global slices:

```go
var (
    globals        []string // global names and types
    globalTypes    []int
    locals         []string // local names and types
    localTypes     []int
    funcs          []string // function names
    funcSigIndexes []int    // indexes into funcSigs
    funcSigs       []int    // each func: retType N arg1Type ... argNType
)
```

The first four are pretty self-explanatory, but the `funcSigs` slice is a bit, well, funky. It's really a slice of structs. In real Go code you'd probably define a `funcSig` struct and roll all three of those "func" slices into a map of function name to struct:

```go
var funcSigs map[string]funcSig

type funcSig struct {
    retType  int
    argTypes []int
}
```

But Mugo doesn't support structs or maps, so I had to stuff these fields into a flat slice of `int`, with `funcSigIndexes[i]` pointing to the start of the pseudo-struct in the `funcSigs` slice (for the function at index `i`).


## Performance

Because it does no optimization, Mugo is obviously going to be a lot slower than Go, so I'm not going to do extensive performance testing. But just for fun, I wrote a [little program](https://github.com/benhoyt/mugo/blob/master/examples/perfloop.go) to test the performance of a basic loop with some integer arithmetic -- it sums the numbers from one to a billion:

```go
var (
    result int
)

func main() {
    sum := 0
    i := 1
    for i <= 1000000000 {
        sum = sum + i
        i = i + 1
    }
    result = sum // so Go doesn't optimize it out
}
```

On my machine, the Go version of this runs in 0.34 seconds. The Mugo version runs in 5.7 seconds -- about 17 times as long. I guess it's not bad for some of the worst assembly code ever produced. For reference, a [Python version](https://github.com/benhoyt/mugo/blob/master/examples/perfloop.py) of this same loop runs in 1 minute and 38 seconds ... a dynamically-typed bytecode interpreter is not a good choice for heavy integer arithmetic.

Interestingly, if I make `sum` itself a global variable instead of a local, the Mugo version is unchanged, but the Go version runs in 1.7 seconds instead of 0.34. I suspect a big part of the reason Mugo is so much slower is it's doing everything in memory on the stack -- even if the stack is in the CPU cache, registers are always going to be faster.

Another aspect of performance is code size: the executables Mugo builds are *much* smaller than those built with Go. The Mugo binary built with Go is 1.6MB. Mugo built with Mugo is only 56KB -- about 1/29th the size! It's not exactly a fair fight -- Mugo doesn't build in a goroutine scheduler, garbage collector, or runtime type information (see this [Go FAQ question](https://golang.org/doc/faq#Why_is_my_trivial_program_such_a_large_binary)). However, this does raise an interesting question: for simple CLI tools written in Go, I wonder if we could reduce binary size with a dead-simple scheduler and GC?


## Related projects

As I mentioned, I've been interested in interpreters and compilers for a long time. If you enjoyed this article, here are some of my related projects:

* [Third](https://github.com/benhoyt/third): the Forth compiler for 8086 DOS that I wrote years ago. See also [Richard Jones' `jonesforth.S`](https://github.com/nornagon/jonesforth/blob/master/jonesforth.S) for a tutorial on how to build a Forth compiler.
* [pyast64](/writings/pyast64/): turns Python syntax into x86-64 assembly using the [`ast`](https://docs.python.org/3/library/ast.html) module.
* [LoxLox](/writings/loxlox/): an interpreter for [*Crafting Interpreters'*](https://craftinginterpreters.com/) Lox programming language written in Lox itself (are you starting to notice a theme?). 
* [GoAWK](/writings/goawk/): a POSIX-compatible AWK interpreter written in Go.
* [ZZT in Go](/writings/zzt-in-go/): describes the Pascal-to-Go converter I wrote to kick off my Go port of Adrian Siekierka's [Reconstruction of ZZT](https://github.com/asiekierka/reconstruction-of-zzt/).

I hope you enjoyed this article -- I definitely had fun creating Mugo. Feel free to send me feedback! You can also read the [discussion on Hacker News](https://news.ycombinator.com/item?id=26777705).
