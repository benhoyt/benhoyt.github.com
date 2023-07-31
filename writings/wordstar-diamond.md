---
layout: default
title: "Using the WordStar diamond in 2023"
permalink: /writings/wordstar-diamond/
description: "Describes the WordStar diamond, a wonderful set of key bindings from the late 1970s, and how you can use it in 2023 on Linux or Windows."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">August 2023</p>


I grew up with the WordStar diamond, and still use it today on Ubuntu Linux. Most people have never heard of it, so let me explain -- in short, it's a wonderful set of key bindings from the late 1970s.

Back when the `Ctrl` key was where `Caps Lock` is now, there was a popular word processor named [WordStar](https://en.wikipedia.org/wiki/WordStar). As Wikipedia notes, it "dominated the market in the early and mid-1980s". It was beloved by writers, arguably well past its use-by date. For example, George R.R. Martin, author of the books behind *Game of Thrones*, [uses WordStar](https://georgerrmartin.com/notablog/2020/04/14/this-that-and-tother-thing-3/) to write his novels (as recently as 2020).

Here's what it looked like under DOS:

![Screenshot of WordStar under DOS](/images/wordstar-dos.png)

The *WordStar diamond* is the diamond-shaped, arrow key-like navigation the word processor used. When you held down `Ctrl`, you could use `E`, `S`, `D`, and `X` as arrow keys:

<p style="text-align: center;"><a title="Image credit: Peter Ibbotson" href="https://www.ibbotson.co.uk/hardware/keyboards/2020/12/01/keyboard-layouts.html"><img alt="The WordStar diamond" src="/images/wordstar-diamond.jpg"></a></p>

The beauty was that you could just move your left pinky a little bit, over to the `Ctrl` key, and then you could navigate the entire document without lifting your hand over to the arrow keys, and without reaching for the mouse.

`Ctrl-A` and `Ctrl-F` would navigate a word left or a word right, respectively. And `Ctrl-R` and `Ctrl-C` were page-up and page-down.

If you prefixed a navigation key with `Ctrl-Q` ("quick functions"), it would extend its meaning in a sensible way. For example, prefixing left or right with `Ctrl-Q` meant move to the start or end of the line, respectively. Similarly, prefixing page-up or page-down with `Ctrl-Q` meant jump to the top or bottom of the file.

There were other keys for selecting and copying text that used a `Ctrl-K` prefix: `Ctrl-K Ctrl-B` would begin selecting, and `Ctrl-K Ctrl-C` would copy, and so on.

All this is great for writing prose, but it's also good for writing code. I love being able to navigate and refactor code without moving my hands.

I'm just too young to have used WordStar proper. However, when learning to code as a teen I always used my Dad's [FE (Forth Editor)](https://github.com/benhoyt/fe). Keybindings were configurable, but the default was to use WordStar keys.

At some point some horrible keyboard designers swapped `Ctrl` with `Caps Lock`. I'll never understand why -- to use 2.5 keys worth of prime real estate for a key you almost never use is Not Good™. Thankfully there were (and are) ways to swap `Ctrl` and `Caps Lock`.

"But how do I use these amazing key bindings in 2023?" I thought you'd never ask!

My brother Berwyn created a set of scripts just for you. They're MIT-licensed, and available on his [**wordstar-keys**](https://github.com/berwynhoyt/wordstar-keys) repo. They map the `Caps Lock` key (right under your left pinky) as the WordStar control key, but leave the real `Ctrl` key available for other uses.

If you're on Linux, it uses the [xremap](https://github.com/k0kubun/xremap) key remapping tool. This works on X11 and Wayland, and I use it daily on Ubuntu (22.04 LTS). Installation is simple:

```
git clone https://github.com/berwynhoyt/wordstar-keys
cd wordstar-keys/xremap
./install
```

If you're on Windows, it uses the freely-available [AutoHotkey](https://www.autohotkey.com/) automation tool. Installation is just a matter of installing AutoHotkey and double-clicking `wordstar.ahk`.

**The brilliant thing about these scripts is that they allow you to navigate with the WordStar diamond in any program.**

I use the WordStar keys in my text editor (Sublime Text), my IDE (Intellij), my browser (including inside Google Docs), and even my terminal. One diamond to rule them all...

If you like this or find it useful, please share and star Berwyn's [wordstar-keys](https://github.com/berwynhoyt/wordstar-keys) repo!
