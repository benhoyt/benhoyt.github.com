---
layout: default
title: A Lox interpreter implemented in ... Lox
permalink: /writings/loxlox/
description: LoxLox is an interpreter for Crafting Interpreters' Lox programming language written in Lox!
---
<h1>{{ page.title }}</h1>
<p class="subtitle">October 2018</p>


> Summary: I had a lot of fun reading *Crafting Interpreters* with its "Lox" language. Being the meta-nerd that I am, I decided that it'd be fun to write an interpreter for Lox, in Lox (while eating lox).


A while back I read through Bob Nystrom's excellent [Crafting Interpreters](http://craftinginterpreters.com/), which teaches you how lexers, parsers, and interpreters are built, using a language called Lox. At that point I wrote a [little language](https://benhoyt.com/writings/littlelang/) of my own using Go, followed by an interpreter for that language written in itself.

But I kept coming back to Lox, and I wondered whether it'd be possible to write a Lox interpreter in Lox. I originally got into programming by writing a [self-hosting Forth compiler](https://github.com/benhoyt/third), so it's never been too mind-bending to me to write a language using itself.

I [mentioned](https://www.reddit.com/r/programming/comments/7yp7qn/chunks_of_bytecode_crafting_interpreters/dujvo3b/) this idea to Bob on programming reddit, and he replied that it'd be kinda tricky:

> It would be possible but pretty difficult to write a Lox interpreter in vanilla Lox. It doesn't have arrays/lists so you'd have to roll your own linked list which is kind of a chore (to put it mildly).

Challenge accepted! Enter [LoxLox](https://github.com/benhoyt/loxlox).


A taste of Lox
--------------

You can read more about the Lox language in Bob's book, particularly [chapter 3](http://www.craftinginterpreters.com/the-lox-language.html). But I'd like to give a little taste of what we're trying to implement (in itself).

Lox is dynamically typed, garbage collected, has basic builtin types (boolean, number, string), is lexically scoped, and supports classes, first-class functions, and closures. Below is what it looks like:

```
for (var i = 1; i < 5; i = i + 1) {
  print i * i;
}

class Duck {
  init(name) {
    this.name = name;
  }

  quack() {
    print this.name + " quacks";
  }
}

var duck = Duck("Waddles");
duck.quack();

fun make_adder(n) {
  fun adder(i) {
    return n + i;
  }
  return adder;
}
var add5 = make_adder(5);
print add5(1);
print add5(100);

// Output:
// 1
// 4
// 9
// 16
// Waddles quacks
// 6
// 105
```


Constraints
-----------

So **Lox doesn't have array or map types**, but that actually wasn't too bad. It has classes, so I wrote List and Map classes using linked lists (doubly-linked lists to allow append and pop operations so we can use List as a stack). Simple enough -- though of course slow, as fetching item N requires an O(N) traversal.

Here's a snippet of their implemententation:

```
class ListNode {
  init(value) {
    this.value = value;
    this.next = nil;
    this.previous = nil;
  }
}

class List {
  init() {
    this.head = nil;
    this.tail = nil;
    this._length = 0; // So getting the length is O(1)
  }

  append(value) {
    var node = ListNode(value);
    if (this.head == nil) {
      this.head = node;
      this.tail = node;
    } else {
      node.previous = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._length = this._length + 1;
    return this;
  }

  // ...
}
```

The next problem was that **Lox doesn't have a way to read input** from the user (as Bob notes at the [end of chapter 3](http://www.craftinginterpreters.com/the-lox-language.html#the-standard-library)). This is kind of an issue when you're trying to read source code.

I tried to think of creative ways to read input without reading input, like appending the numeric values of the input bytes to a Lox source file as literals. But nothing straight-forward came to mind, and preprocessing the input felt like cheating anyway.

So I gave in and added two functions to the Lox builtins:

* `getc()`: Read a single character and return the character code as an integer.
* `chr(ch)`: Convert given character code number to a single-character string.

With these two functions I was able to read source code one character at a time and write a Scanner class.

I had actually tried to add just a single function `getc` that returned a one-character string. But because Lox strings don't support escape sequences, there's no way to include a string with `"` (double-quote) in a program. It also made it painful to test for ranges of characters, like "char between A and Z". So I made `getc` return a number and added `chr`.

Those two functions are all that are really needed. However, to support printing error messages to stderr and exiting with a non-zero status code (this made running the Lox test suite much easier), I also added these two functions:

* `exit(status)`: Exit with given status code.
* `print_error(message)`: Print message string on stderr.

With those [changes](https://github.com/benhoyt/loxlox/blob/master/jlox_diff.patch) to the JLox interpreter in place, we're ready to roll.

I wanted to be able to run LoxLox under Bob's CLox and not just JLox, but unfortunately **CLox bytecode only supports a maximum of 255 constants** in a code block, and LoxLox exceeds that by quite a bit. I hope to patch this limitation at some point to see how much faster LoxLox runs under CLox.

Lox is quite a cleanly-designed language. I did miss arrays and maps, but the core language, classes, and scoping rules are very pleasant to work with!


Implementation
--------------

The structure of LoxLox is very similar to JLox, and a good amount of code is ported directly from JLox. Lox only supports running a single file, so all the code is in [`lox.lox`](https://github.com/benhoyt/loxlox/blob/master/lox.lox). It's structured as follows:

* `Scanner`: tokenizes Lox source.
* `List`, `Map`, and `Environment`.
* `numberStr(num)`: converts a number to a string. This was surprisingly tricky without a `%` (modulo) operator.
* Syntax tree nodes, for example: `Assign`, `Binary`, `While`.
* Lox runtime objects: `LoxFunction`, `LoxInstance`, and `LoxClass`.
* `Parser`: the recursive-descent parser.
* `Resolver`: resolves variable scope.
* `Interpreter`: this is really a shell. The real work is done in the syntax tree classes.

You can call `str()` on a Program (parsed Lox syntax tree) to print a nicely-indented version of the syntax tree -- this is mainly for debugging. `Program.str()` recursively calls the `str` methods on all the sub-nodes in the syntax tree.

Because LoxLox is a toy within a toy, I've taken a few shortcuts, such as:

* The syntax tree isn't an *abstract* syntax tree. I was lazy and just added `str`, `resolve`, and `evaluate` / `execute` methods right on each syntax tree node. This simplified things, avoiding the need for a visitor class.
* The syntax tree nodes don't store the line number, meaning LoxLox doesn't print the line number or stack trace for runtime error messages.
* I use JLox values directly for LoxLox scalar values, without reimplementing the value type. This keeps things simple, though it does mean some funky error messages for runtime errors (for example "Undefined property 'get'" instead of "Only instances have properties").
* I tried to get away without the resolver pass, but Lox has tricky (and clean!) scoping rules, so you really need it.


Testing
-------

The canonical implementation of Lox already had a nice test suite, so I just re-used that. I copied [`test.py`](https://github.com/benhoyt/loxlox/blob/master/test.py) from the Crafting Interpreters repo and hacked it to run LoxLox under JLox.

LoxLox passes the entire test suite. It says it passes 207 out of 234 tests, but it actually passes the logic for all 234 -- as mentioned above, a number of the runtime error messages are different under LoxLox. I've checked all the [failures](https://github.com/benhoyt/loxlox/blob/master/failures) manually to ensure they're all just error-message differences.


Performance
-----------

First of all, I have spent no time trying to optimize LoxLox. Not that there's a Lox profiler out there waiting to be used...

There might be a few things that could be tweaked, but without arrays there's not many optimizations I can think of. I might be able to change a bunch of `if (foo != nil)` clauses to just `if (foo)`. Let me know if you can think of any larger or structural optimizations.

Anyway, the following is not a serious benchmark, but it gives you some idea of how fast (slow!) LoxLox is. The benchmark program is:

```
var sum = 0;
for (var i = 0; i < 100000; i = i + 1) {
  sum = sum + i;
}
print sum;
```

And I simply adjusted the N (100,000 above) and ran several times via the `time` command to determine the running time. "Times as slow" is relative to JLox:

Interpreter        | Number of loops | Loops/sec | Times as slow
------------------ | --------------- | --------- | -------------
JLox               |      10,000,000 | 5,359,056 |           1.0
LoxLox under JLox  |         100,000 |    15,267 |           351

So LoxLox is not something you'd want as your next in-game scripting language. But that's what happens when you write an interpreter in an interpreter!


To wrap up
----------

I find writing interpreters a lot of fun. And therapeutic -- I actually did this project in between procrastinating on my other side project.

So I encourage you to read [Crafting Interpreters](http://craftinginterpreters.com/) and have fun learning. (Maybe Bob should give me a commission when I sign up new readers to his free book.) And then design a language of your own, and implement it in your favorite host language. As a final step, implement your new language in itself.
