---
layout: default
title: ZZT in Go (using a Pascal-to-Go converter)
permalink: /writings/zzt-in-go/
description: "An (incomplete) port of Adrian Siekierka's 'Reconstruction of ZZT' to Go, done in a semi-automated way using a Pascal-to-Go converter."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">May 2020</p>

> Summary: After seeing Adrian Siekierka's "Reconstruction of ZZT", I wrote a program to translate his Turbo Pascal code to Go. This article describes my Pascal-to-Go converter and my (not exactly complete) Go port of ZZT.


I'm not "a gamer", but one of the games I enjoyed playing as a teenager was Epic MegaGames' [ZZT](https://museumofzzt.com/about-zzt) -- an old text-mode DOS game that came out in 1991. Even in its time the graphics were far from revolutionary ... but the reason ZZT did so well, and still has something of a cult following, was because of the world editor (that came free, even with the shareware version).

Here's what the original shareware "Town of ZZT" title screen looked like:

![Town of ZZT title screen](/images/zzt-orig.png)

The world editor had a scripting language called ZZT-OOP, where the "O" in OOP referred to ZZT's "objects", which are programmable game characters or robots. So people created thousands of their own worlds and shared them -- hundreds of which are downloadable and even playable online at the [Museum of ZZT](https://museumofzzt.com/), a kind of archive.org for ZZT worlds.


## The Reconstruction of ZZT

The original source code for ZZT was lost in a computer crash, but there have been various attempts over the years to recreate the game in other languages, including [C++](https://github.com/inmatarian/freezzt), a partial implementation in [JavaScript](https://github.com/bstreiff/zztjs), and even an accurate reimplementation in [Rust](https://github.com/yokljo/ruzzt). And [Adrian Siekierka](https://github.com/asiekierka) is the author of [Zeta](https://zeta.asie.pl/), a specialized DOS emulator just for running ZZT.

In March 2020, Adrian published his [Reconstruction of ZZT](https://github.com/asiekierka/reconstruction-of-zzt/), a reverse-engineered recreation of the Pascal source code that, when compiled with the original Turbo Pascal 5.5 used by ZZT, compiles to a byte-for-byte identical `.EXE` file. I for one find that an amazing feat! See the original [Hacker News discussion](https://news.ycombinator.com/item?id=22609474) and the [article Adrian wrote](https://blog.asie.pl/2020/08/reconstructing-zzt/) later about how he did it.

He has since gone further, and created [libzoo](https://github.com/asiekierka/libzoo), a portable C reimplementation of the ZZT game engine with a permissive license for use in other ZZT ports.


## A Pascal-to-Go converter

A while back I started trying to write a version of ZZT in Go, but after making a tiny bit of progress, I gave up -- it seemed like too big a job for a side project. However, when the Pascal reconstruction came out, I had another (ahem) *go*.

I [enjoy](https://benhoyt.com/writings/goawk/) [tinkering](https://benhoyt.com/writings/loxlox/) [around](https://benhoyt.com/writings/littlelang/) with interpreters and compilers, so I wanted to see if I could write a program to convert Adrian's Pascal reconstruction to Go semi-automatically. So I wrote a not-very-complete Turbo Pascal parser, and a converter that takes the Pascal syntax tree and tries to write it out with Go types and syntax.

Go's structure and declaration syntax actually has quite a number of similarities to Pascal, so this made the overall structure of the converter pretty straight-forward. For example, take a small Pascal function [in OOP.PAS](https://github.com/asiekierka/reconstruction-of-zzt/blob/4541b845e1433e63367591214a1b26dc840391b8/SRC/OOP.PAS#L303-L312):

```pascal
function WorldGetFlagPosition(name: TString50): integer;
    var
        i: integer;
    begin
        WorldGetFlagPosition := -1;
        for i := 1 to 10 do begin
            if World.Info.Flags[i] = name then
                WorldGetFlagPosition := i;
        end;
    end;
```

Here's the converted Go code:

```go
func WorldGetFlagPosition(name string) (WorldGetFlagPosition int16) {
    var i int16
    WorldGetFlagPosition = -1
    for i = 1; i <= 10; i++ {
        if World.Info.Flags[i-1] == name {
            WorldGetFlagPosition = i
        }
    }
    return
}
```

Almost identical. To keep the converter simple, I've opted for a more literal translation of the Pascal, rather than trying to produce idiomatic Go -- my thinking was that making it idiomatic Go is too hard to do programmatically, and I can always clean that up later.

Note the use of Go named return values to match Pascal's use of the function name as the return value. I converted the integer sizes literally to avoid bugs, so this returns an `int16` rather than a plain `int`.

Pascal allows you to declare arrays that start at at any index (not just 0), and in practice they often start at 1. Hence `Flags[i]` in the Pascal version and `Flags[i-1]` in the Go version.

The most difficult thing -- and something I barely automated -- was the differences between Turbo Pascal pointers and strings and their Go counterparts. I made the converter convert all string types to plain `string`, and then fixed up the breakages manually.

Pascal's `var` parameters (its way of doing "pass by reference") turn into pointers in Go, but of course in Go you need to explicitly dereference them when you assign their values. So this Pascal function:

```pascal
procedure ElementSpinningGunDraw(x, y: integer; var ch: byte);
    begin
        case CurrentTick mod 8 of
            0, 1: ch := 24;
            2, 3: ch := 26;
            4, 5: ch := 25;
        else ch := 27 end;
    end;
```

Becomes this in Go:

```go
func ElementSpinningGunDraw(x, y int16, ch *byte) {
    switch CurrentTick % 8 {
    case 0, 1:
        *ch = 24
    case 2, 3:
        *ch = 26
    case 4, 5:
        *ch = 25
    default:
        *ch = 27
    }
}
```

I used `go build -gcflags="-e"` to build the converted Go, so as to print all errors rather than just the first few, and outputted the results to an [errors.txt](https://github.com/benhoyt/pas2go/blob/c6a612380d3d4a8234f3f62776712d0f313e6a19/converted/errors.txt) file. Initially this file had over 800 errors in it. By the end of my automated translation journey, it had only 33 -- which I then fixed up manually.

The source code for my Pascal to Go converter is at [**github.com/benhoyt/pas2go**](https://github.com/benhoyt/pas2go). I started by building the [lexer](https://github.com/benhoyt/pas2go/blob/master/lexer.go) and [parser](https://github.com/benhoyt/pas2go/blob/master/parser.go), and output the parsed original source (the [orig](https://github.com/benhoyt/pas2go/tree/master/orig) directory) as pretty-printed Pascal to the [parsed](https://github.com/benhoyt/pas2go/tree/master/parsed) directory. I did a diff between those two directories to determine whether my Turbo Pascal parser was correct.

Once I'd finished the parser, I moved on to the [converter](https://github.com/benhoyt/pas2go/blob/master/converter.go). This is not the most elegant code I've ever written; I just wanted to get the job done. In particular, it mixes up trying to figure out types with outputting the Go source code -- if building a real transpiler, I would separate these into two phases and build the "types" data structures first.

Pascal's handling of integer data types is quite different from Go's. Go is very strict and doesn't do any automatic number type coercion. I couldn't find a good online reference for how Turbo Pascal actually did such conversions, but between the [Free Pascal](https://www.freepascal.org/) documentation and trying things in Turbo Pascal 5.5 running in DOSBox, I think I got most of the rules figured out.

Pascal seems to promote to `integer` (`int16`) when you do math operations, and they're automatically promoted or truncated if needed on assignment. So there are a lot more explicit conversions in the Go version, such as this code from [ELEMENTS.PAS](https://github.com/asiekierka/reconstruction-of-zzt/blob/4541b845e1433e63367591214a1b26dc840391b8/SRC/ELEMENTS.PAS#L435-L437):

```pascal
if Difference(Y, Board.Stats[0].Y) <= 2 then begin
    shot := BoardShoot(element, X, Y,
                       Signum(Board.Stats[0].X - X),
                       0, SHOT_SOURCE_ENEMY);
end;
```

Ends up with a bunch of `int16()` conversions in Go:

```go
if Difference(int16(stat.Y), int16(Board.Stats[0].Y)) <= 2 {
    shot = BoardShoot(element, int16(stat.X), int16(stat.Y),
                      Signum(int16(Board.Stats[0].X)-int16(stat.X)),
                      0, SHOT_SOURCE_ENEMY)
}
```


## The Go port

Once the semi-automated conversion was done, it still had dozens of Go compile errors. The first step was getting it to compile without errors. I moved the Go code to its own [**github.com/benhoyt/zztgo**](https://github.com/benhoyt/zztgo) repo and systematically worked through the `errors.txt` file, fixing issues as well as removing less important source code (sound functions).

Once I got it to compile, I had to add in the video functionality. It currently uses terminal "graphics" via [tcell](https://github.com/gdamore/tcell). To get it to look like real ZZT, you have to adjust your font and terminal colours to match the old DOS ones. Here's what the `zztgo` version looks like (pretty close, right!):

![zztgo title screen](/images/zztgo.png)

I also had to write ZZT world [serialization routines](https://github.com/benhoyt/zztgo/blob/master/serialize.go) -- the Turbo Pascal version just loads the binary structures directly into memory (you just assumed little-endian and packed structures in the good old days).

Once I had eliminated the major bugs, a surprising amount of the gameplay just worked. Things were really starting to fall into place. I remember two commits in particular: [this one](https://github.com/benhoyt/zztgo/commit/2b98366edc5f937a030925437321a8643f2eb1c8) which got the bulk of the gameplay working, and [this one](https://github.com/benhoyt/zztgo/commit/958b94192a0e048334a1a86b70764caf4a7910f9) which got the in-game world editor pretty much working. Yay for automated code conversion!


## Running zztgo yourself

To run it yourself: [install Go](https://golang.org/), clone the [repo](https://github.com/benhoyt/zztgo), type `go build`, and then run `./zztgo`. If you want to make it look a bit more authentic, you should install an [IBM EGA font](https://int10h.org/oldschool-pc-fonts/fontlist/#ibmega) and adjust the line spacing to zero. On macOS you can use [this Terminal settings file](https://github.com/benhoyt/zztgo/blob/master/zzt.terminal).


## Where to from here?

Unfortunately, I've run out of time to spend on this project. Most of the gameplay is in place, and it seems reasonably playable, but if you want to fork it and take it further, go right ahead! What I know is missing or broken:

* The timing code is far from ideal: it currently just [calls `time.Sleep()`](https://github.com/benhoyt/zztgo/blob/9edb1452d887852c5c68cae0a91a6227cd4ef7a9/game.go#L1489-L1490) for a fixed duration instead of waiting accurately till the next tick time. Shouldn't be hard to fix.
* Sound is not working at all. All the useful stuff in [sounds.go](https://github.com/benhoyt/zztgo/blob/master/sounds.go) is commented out. This would take a bunch of work to fix, and require pulling in a sound/game library.
* Speaking of a game library, it may be better to use a proper graphics library for the rendering to get more control over the output (instead of having to install a DOS font and muck about with your terminal's line spacing).
* Most ZZT-OOP objects seems to work, but there are definitely some bugs, as evidenced by the [Preposterous Machines](https://museumofzzt.com/file/p/prepostm.zip?file=PREPOSTM.ZZT) title screen messing up.
* [EditorTransferBoard](https://github.com/benhoyt/zztgo/blob/9edb1452d887852c5c68cae0a91a6227cd4ef7a9/editor.go#L422) is commented out.
* Last but not least, it's definitely not idiomatic Go! The code has a very "automatically converted from Pascal" feel to it (for some strange reason).

But I thought I'd release it as is -- enjoy! I definitely had fun implementing the Pascal-to-Go converter and seeing the gameplay come to life.
