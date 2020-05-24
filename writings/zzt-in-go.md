---
layout: default
title: ZZT in Go (and a Pascal-to-Go converter)
permalink: /writings/zzt-in-go/
description: "A port of Adrian Siekierka's 'Reconstruction of ZZT' to Go, done in a semi-automated way using a Pascal-to-Go converter."
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">May 2020</p>

TODO: draft in progress

I'm not "a gamer", but one of the games I enjoyed playing as a teenager was Epic MegaGames' [ZZT](https://museumofzzt.com/about-zzt) -- an old text-mode DOS game that came out in 1991. Even in its time the graphics were far from revolutionary ... but the reason ZZT did so well, and still has something of a cult following, was because of the "world editor" (that came even with the shareware version).

And the world editor had a scripting language called ZZT-OOP, where the "O" in OOP referred to ZZT's "objects", which are programmable game characters or robots. So people created thousands of their own worlds and shared them -- hundreds of which are downloadable and even playable online at the [Museum of ZZT](https://museumofzzt.com/), a kind of archive.org for ZZT worlds.


## The Reconstruction of ZZT

The original source code of ZZT was lost in a computer crash, but there have been various attempts over the years to recreate the game in other languages, including [C++](https://github.com/inmatarian/freezzt), a partial implementation in [JavaScript](https://github.com/bstreiff/zztjs), and even an accurate reimplementation in [Rust](https://github.com/yokljo/ruzzt). And [Adrian Siekierka](https://github.com/asiekierka) is the author of [Zeta](https://zeta.asie.pl/), a specialized DOS emulator just for running ZZT.

In March 2020, Adrian published his [Reconstruction of ZZT](https://github.com/asiekierka/reconstruction-of-zzt/), a reverse-engineered recreation of the Pascal source code that, when compiled with the original Turbo Pascal 5.5 used by ZZT, compiles to a byte-for-byte identical `.EXE` file. I for one find that an amazing feat! (See the [Hacker News comments](https://news.ycombinator.com/item?id=22609474).)

He has since gone further, and created [libzoo](https://github.com/asiekierka/libzoo), a portable C reimplementation of the ZZT game engine with a permissive license for use in other ZZT ports.


## A Pascal-to-Go transpiler

A while back I started trying to write a version of ZZT in Go, but after making a tiny bit of progress, got lazy and gave up. However, when the Pascal reconstruction came out, I had another go.

I [enjoy](https://benhoyt.com/writings/goawk/) [tinkering](https://benhoyt.com/writings/loxlox/) [around](https://benhoyt.com/writings/littlelang/) with interpreters and compilers, so I wanted to see if I could write a program to convert Adrian's Pascal reconstruction to Go semi-automatically. So I wrote a not-very-complete Turbo Pascal parser and a converter that takes the Pascal syntax tree and tries to write it out with Go types and syntax.

Go's structure and declaration syntax actually has quite a number of similarities to Pascal.


Its type system, however, is quite different.


## The Go port

Once the semi-automated conversion was done, it still had hundreds of Go compile errors. The first step was getting it to compile without errors. So I wrote a script to build it with (TODO args to show all errors) and output the result to `errors.txt`. I systematically worked through that file, fixing issues and removing less important source code (sound and video stuff).

If I found a problem that was a result of the Pascal-to-Go conversion, I went back and fixed it there so 


Then I added terminal "graphics" using the Go [tcell](TODO) library.

The next step was getting it to actually work.
