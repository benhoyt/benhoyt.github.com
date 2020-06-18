---
layout: default
title: Learning more Go and some computer science by implementing a language
permalink: /writings/littlelang/
description: Littlelang is a dynamically-typed programming language I designed and wrote an interpreter for in Go (and in littlelang itself!).
---
<h1>{{ page.title }}</h1>
<p class="subtitle">December 2017</p>


> Summary: I designed a small, dynamically-typed programming language and wrote a parser and tree-walk interpreter for it in Go (and again in the language itself!).

Recently I [learnt a bit of Go](/writings/learning-go/) by porting a small web backend from Python to Go, and I was looking around for my next Go project. I've been wanting to roll my own language for a while, and when I saw an implementation of the Python-like [Skylark](https://docs.bazel.build/versions/master/skylark/language.html) language [implemented in Go](https://github.com/google/skylark), I decided to, well, *go* for it.

And no, the world doesn't need another programming language. But this wasn't for the world, it was for my own learning. One, an excuse to learn more Go, and two, picking up more of the computer science education I never had (I studied electrical engineering).

I was surprised at how simple it all is. However, I did get a bit stuck implementing closures. So now's a good time to call out Bob Nystrom's excellent [Crafting Interpreters](http://www.craftinginterpreters.com/), a free online book about designing a language of your own and writing an interpreter for it. He's writing it chapter by chapter, and is now about half way through. I can't say enough good things about this book!


A taste of littlelang
---------------------

So what does my little language -- aptly named "littlelang" -- act and look like? Well, it's kind of a cross between Python and JavaScript, with a dash of Go syntax:

```
// Lists, the sort() builtin, and for loops
lst = ["foo", "a", "z", "B"]
sort(lst)
print(lst)
sort(lst, lower)
for x in lst {
    print(x)
}
// Output:
// ["B", "a", "foo", "z"]
// a
// B
// foo
// z

// A closure and first-class functions
func make_adder(n) {
    func adder(x) {
        return x + n
    }
    return adder
}
add5 = make_adder(5)
print("add5(3) =", add5(3))
// Output:
// add5(3) = 8

// A pseudo-class with "methods" using a closure
func Person(name, age) {
    self = {}
    self.name = name
    self.age = age
    self.str = func() {
        return self.name + ", aged " + str(self.age)
    }
    return self
}
p = Person("Bob", 42)
print(p.str())
// Output:
// Bob, aged 42
```

You can read the [full spec](https://github.com/benhoyt/littlelang#language-spec) and [grammar](https://github.com/benhoyt/littlelang#grammar) for littlelang on GitHub, but in short, it has the following features:

* **Go-like syntax,** with braces required around blocks, and no semicolons in sight. Trailing commas are allowed!
* **Dynamic typing,** with all the usual suspects: nil, bool, int, str, list, map, func.
* **Garbage collected.** But thanks to Go, I didn't have to write a GC.
* **Control flow:** `if` statements, `while` loops, and `for` loops. A `for` loop iterates over elements in a list, keys of a map, or characters in a string.
* **Named and anonymous functions,** which are first class and support closures (lexically-scoped references to variables in outer functions).
* **Vararg syntax** using `...` for function calls and definitions.
* **Variable assignment:** like Python, it always assigns to local function scope.
* **Map assignment and access** using either `m["foo"]` or `m.foo` syntax.
* **Logical `and` and `or`** spelled like Python (because they're really control-flow).
* **Binary operators:** `== != < <= > >= in + - * / %`
* **Unary operators:** `- not`
* **Deep equality:** `==` and comparisons operate recursively on lists and maps.
* **Literal syntax** for integers and strings, as well as JSON-like list and map expressions.
* **Handy overloads** like `str + str`, `str * repeat`, `list + list`, `elem in list`, etc.
* **Builtin functions** for a few other needs: `split()`, `join()`, or `slice()` strings, `append()` to or `sort()` a list, `print()`, `range()`, etc.

It's 100% dynamically typed. However, I consider it *strongly* typed, because it never automatically coerces things like `int + str`. It's even stronger than Python: `if` requires a boolean condition, `and` and `or` require booleans, and you can't compare different types using `<` and other inequality operators.

Some things littlelang does not support:

* Proper classes.
* Exceptions and try/catch.
* Floating point numbers (just integers).

Even though littlelang doesn't have classes, you can emulate something like them with objects and closure methods (see `Person` in the code snippet above, or `Assign` below). The only syntactic sugar is that `obj.foo` is shorthand for `obj["foo"]`, which makes data access and method calls much nicer to look at.

This way of representing objects as maps (a hash table per instance) is not very efficient, but that's okay -- this is only a toy language after all!


Littlelang in littlelang
------------------------

I wanted to make the language as simple as reasonably possible, but just powerful enough to be able to re-implement the parser and interpreter in itself. So lo and behold there's a version of [littlelang written in littlelang](https://github.com/benhoyt/littlelang/blob/master/littlelang.ll). It even works multiple levels deep, which I think is pretty cool (though see the benchmarks below).

The tokenizer and parser are pretty much straight ports of the Go version, but the interpreter is fairly different. The interpreter is also much simpler, partly because I forgo a lot of runtime checks (the Go interpreter will catch the errors, though the error messages point to the wrong place). In addition, the builtin functions just call the Go equivalents.

For interest, here's the number of lines of source code (LoC) for the Go interpreter versus the littlelang one -- again, a little unfair for the reasons above:

Component   |   Go LoC | Littlelang LoC
----------- | -------- | --------------
Tokenizer   |      357 |            259
AST Nodes   |      319 |            244
Parser      |      433 |            378
Interpreter |      718 |            156
Builtins    |      454 |             71
**Total**   | **2281** |       **1108**


I really like how easy it is to use nested functions to simulate objects with methods. Littlelang doesn't have any special syntax for classes, but you can just write a function which returns a map with data and some "closure methods".

For example, consider the AST nodes (only one node type shown). Each has a type and source file position as well as node-specific data, and then a `str()` method to return a pretty-printed version of the node:

```
// Node is not a base class, just a helper function to create a node
func Node(type, pos) {
    self = {}
    self.type = type
    self.pos = pos
    return self
}

// Variable or subscript assignment
func Assign(pos, target, value) {
    self = Node("Assign", pos)
    self.target = target
    self.value = value
    self.str = func() {
        return self.target.str() + " = " + self.value.str()
    }
    return self
}

// See source for other node types ...
```


How slow is it?
---------------

I wrote a [little benchmark](https://github.com/benhoyt/littlelang/blob/master/examples/benchmark.ll) that runs a `for` loop which calls a user-defined function. Here are some results for how this compares to a [Python version](https://github.com/benhoyt/littlelang/blob/master/examples/benchmark.py), as well as the littlelang interpreter written in littlelang, interpreting itself once and then twice. How meta!

Note that I ran these on a 2.5GHz i7 on macOS, using Go 1.9 and Python 3.6.

Version                           | Number of loops | Loops/sec | Times as slow
--------------------------------- | --------------- | --------- | -------------
Python                            |      10,000,000 | 4,200,000 |           1.0
Go interpreter                    |      10,000,000 |   860,000 |           5.0
littlelang interpreter            |         100,000 |    21,000 |           200
littlelang<sup>2</sup> intepreter |           1,000 |       203 |        21,000

Not too bad, right? My simplistic tree-walk interpreter is a mere 5 times as slow as the CPython bytecode virtual machine.

Go interpreting littlelang interpreting itself and then running the benchmark is another 40x slower than that. And Go interpreting littlelang interpreting littlelang interpreting littlelang and running the benchmark another 105x slower again. We're back to the speeds of the first, room-sized computers in the 1940's!


Go forth and code
-----------------

So building your own language is a great learning experience and a lot of fun. My recommendation: roll your own language, and when you get stuck, read [Crafting Interpreters](http://www.craftinginterpreters.com/) from cover to cover!
