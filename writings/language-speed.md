---
layout: default
title: "Two kinds of speed (or why I still like dynamically typed languages)"
permalink: /writings/language-speed/
description: Responds to dynamic-typing dislike with some reasons I think dynamically typed languages like Python are still a good idea.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2017</p>


I've seen a lot of dislike for dynamically typed languages on Hacker News and programming reddit recently. I'm an avid user of Python, and I'm going to make some arguments for it based on two kinds of speed: that compile speed matters a lot, and that execution speed doesn't matter as much as you think.

Don't get me wrong -- I've worked on large, dynamically typed codebases, and I understand the trade-off. The main problem with languages like Python is refactoring: when you make changes, you have to re-test pretty much every part of code you've changed, either manually or via unit tests. If you don't, there's a good chance it will throw some kind of runtime error because you spelled an attribute name wrong (or similar).

But, as I'm going to argue, I believe that *in many cases* the developer-productivity pros outweigh the refactoring cons.


Compile speed matters
---------------------

Python compiles almost instantly. In fact, it compiles so fast that most people don't think it *is* a compiled language; they call it "interpreted". It's actually both: it is compiled, but it's compiled to a bytecode which is the interpreted. It's not too different from Java in this respect, except that the main CPython interpreter doesn't do [JIT compilation](https://en.wikipedia.org/wiki/Just-in-time_compilation) like Java's does (though there's a new interpreter called [PyPy](https://pypy.org/) which does).

Why does Python compile so fast? Because the compiler is very simple and doesn't do much. No complicated compile-time checks, no type checking, no type inference. (It's so simple, even coders like me with an electrical engineering degree can understand it.)

The compiler turns Python source code like this:

```python
def count_words(string):
    words = string.split()
    counts = Counter(words)
    return counts
```

Into bytecode like this (use [dis](https://docs.python.org/3/library/dis.html) module):

    2   LOAD_FAST                0 (string)
        LOAD_ATTR                0 (split)
        CALL_FUNCTION            0 (0 positional, 0 keyword pair)
        STORE_FAST               1 (words)

    3   LOAD_GLOBAL              1 (Counter)
        LOAD_FAST                1 (words)
        CALL_FUNCTION            1 (1 positional, 0 keyword pair)
        STORE_FAST               2 (counts)

    4   LOAD_FAST                2 (counts)
        RETURN_VALUE

It's pretty tedious: load the string, look up its `split` attribute, call that, store the result. Look up the `Counter` function, load the previous result, call the function, store the result. Then load and return the result.

Why does compile speed matter? Because as a developer I never have to wait. Occasionally after I've installed a big new library and import it for the first time I see a second or so of delay, but it's basically instant. This means I don't need to bring my [sword](https://xkcd.com/303/) to work, and I don't switch tabs to "do something else real quick" while waiting for my project to compile.

One statically-typed language I've used takes 20 minutes to compile a medium-sized project, and 15-30 seconds even for an incremental compile. (Yep, it's Scala. Scala's author has a [good StackOverflow answer](http://stackoverflow.com/questions/3490383/java-compile-speed-vs-scala-compile-speed/3612212#3612212) on why the compiler is so slow.)

The fact that "`scalac` manages about 500 to 1000 lines per second" on modern gigahertz-clocked CPUs boggles my mind. Back in the 1990's, when CPU speeds were measured in the tens of *mega*hertz, Borland's Turbo Pascal was already compiling at [thousands](http://prog21.dadgum.com/47.html) of lines per second.

I think the Go language has the right idea. The language is relatively simple partly *because* they wanted to keep compile times down -- this was a design goal of the language from day one. It's statically typed (but doesn't have a complex type system), compiles to machine code and does pretty decent optimizations, but the compiler is still pretty fast.

What about the best of both worlds? Recently I saw the new [Zig](http://andrewkelley.me/post/intro-to-zig.html) language, which is designed to compile super fast in debug mode (with almost no optimizations) but then takes a lot longer in release mode (with lots of optimizations). So you get a good developer experience and fast code at the end of the day.

In short, fast compile times are really important for developer productivity. Plus, short edit-compile-run cycles are part of what makes coding fun!


Execution speed doesn't matter as much as you think
---------------------------------------------------

Python is a powerful, general-purpose programming language in its own right, but that said, I do think the somewhat pejorative term "glue language" label applies. Or *sticks*, shall we say. The semantics of the core language are one thing, but Python is nothing without its data types, standard library, and perhaps most importantly, high-quality third party libraries. And the glue that holds it all together? Bytecode.

With a single bytecode instruction, I can call a string method that scans 100MB of text for the substring `abc`, executing millions of CPU instructions in some highly-optimized C code to get there.

With a single bytecode, I can tell Python to call an image library function that resizes an image from 4000 by 3000 pixels to 400 by 300. Again, executing thousands of instructions of highly-optimized C code.

If you're doing a whole lot of low-level operations in Python itself, for example, adding a list of 10 million integers, it's going to be slow. Very slow -- 100x as slow as C kind of slow. But, as the doctor said, "if it hurts when you do that, don't do that". Use [numpy](http://www.numpy.org/) or another library written in C.

You might even find doing your matrix calculations with Python and numpy is faster than if you'd used straight C, because numpy has been heavily optimized over time, and it uses the x86's SSE/SIMD instructions to process a lot of data fast.

Take a web app that resizes images in real time. Your web framework reads the HTTP input using the socket library (which is written in C), then you connect to your database using a database library (probably written in C, or at least a thin wrapper around that C socket library again), then you call your image library (probably PIL or ImageMagick, both written in C), then you send your data back to the user (C socket library again). So you might be executing a few hundred Python bytecodes, but all they're really doing is setting things up to call fast, domain-specific C libraries to do the hard work.

String processing in Python is the same way: very fast, as long as you stick to the well-trod paths that process entire strings in C code. For example, `'xyz' in big_string` will translate to a fancy, optimized C [Boyer-Moore kind of algorithm](http://effbot.org/zone/stringlib.htm). If you use Python's [re module](https://docs.python.org/3/library/re.html), compiling the regex (a one-time operation) is done in Python code, but the actual execution (usually occurring many times) is done in fast C.

The rule of thumb for writing string code in Python is: don't iterate through strings character by character. Or, more generally, "iterate in C, not in Python". For example, compare the following:

    $ python -m timeit -s "s = 'Aa' * 20" \
        "''.join(chr(ord(c) + 32) if 65 <= ord(c) <= 90 else c for c in s)"
    100000 loops, best of 3: 11.8 usec per loop

    $ python -m timeit -s "s = 'Aa' * 20" \
        "s.lower()"
    10000000 loops, best of 3: 0.121 usec per loop

The iterate-character-by-character approach is almost exactly 100 times slower. It's executing a couple of dozen bytecode instructions *per character*; the `s.lower()` version is executing one bytecode instruction for the entire string.

To summarize, execution speed matters, but if you're simply calling into highly-tuned C code, it doesn't matter as much as you think.


Some caveats
------------


Of course, there are cases where you shouldn't use a compile-fast, execute-more-slowly language. Here are a few:

* When you're writing that low-level, performance critical code for math libraries, graphics engines, or similar. Nobody wants a 100x slower libjpeg written in Python.
* In safety-critical code, for example, code that powers airliner control systems. Use Ada or MISRA C or something saner for that.
* In systems or operating system code. You don't want to write your next file system driver or memory allocator in a fast-compile, slow-execute language. Use Rust or C or C++ for that.
* In embedded programming -- you don't want the overhead of a dynamic language running on a micro with 8KB of RAM (though there is [MicroPython](https://micropython.org/)!).
* Where responsiveness and resource usage are important (*cf* those lovely [Electron apps](https://josephg.com/blog/electron-is-flash-for-the-desktop/), Visual Studio Code's [blinking cursor issue](https://www.reddit.com/r/programming/comments/612v99/vs_code_uses_13_cpu_when_idle_due_to_blinking/), or [Atom vs Sublime Text](https://blog.xinhong.me/post/sublime-text-vs-vscode-vs-atom-performance-dec-2016/) performance).

But do use Python (or Ruby, or JavaScript) for your next startup, for web apps, for deployment tools, and for scientific and numerical processing. Developer productivity for the win!
