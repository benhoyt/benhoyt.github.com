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

I still think that's an interesting idea, but I decided to try my hand at a much smaller and more fun problem: using the Python [`ast`](https://docs.python.org/3/library/ast.html) (abstract syntax tree) module to parse Python syntax, then recursively visit the AST nodes to turn them into another language. I though it'd be easiest to generate C, but then I decided that going straight to (very unoptimized) assembly would be more fun.

I've written a bunch of 8086 and 80386 assembly back in the day, but have never actually had the need to write 64-bit x86 code. ("What's this `rax` thing? I've only heard of `ax` and `eax`.") These days almost everything is 64-bit, and I spend most of my time (alas) on macOS, so I'm generating x86-64 code for macOS. It wouldn't be hard to port it Linux, though Windows might be a bit more work.

Outputting assembly source is much easier than outputting machine code and an executable directly, so that's what I did (`as` and `ld` are good at assembly and linking). I kinda detest AT&T assembly syntax, but that's what's built in, so I used it.

Enter `pyast64`. I chose to keep it really simple: my language looks like Python, but it's definitely not. The only data type is integers, and the only output mechanism is a predefined `putc` function (adding `getc` for input is left as an exercise for the reader). 

The compiler uses a simple `%rbp`-based stack frame to handle an arbitrary number of local variables. It supports `while` loops, as well as `for i in range()` loops -- `for` is implemented in terms of `while`. It supports `if`/`else`, comparisons, logical `and` and `or`, the four basic math operators, and recursion.

If I felt the urge to make it more than a toy, I'd use Python 3's type annotations to support different data types like floating point and strings, and I'd add some features to allocate and use memory arrays. Oh, and things like `*args` and default arguments.

To keep it simple, the assembly output is very dumb, basically ignoring the fact that the x86-64 has a whole slew of registers, and just using `%rax` and `%rdx` for calculations and the stack for the rest. However, there's a small peephole optimizer which turns push-then-pop sequences into `mov` instructions.


A quick look at the implementation
----------------------------------

TODO


An example
----------

TODO



TODO: Please write your comments on [Hacker News](TODO) or [programming reddit](TODO).
