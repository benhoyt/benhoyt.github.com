---
layout: default
title: "Go Forth and WikiReadit"
permalink: /writings/wikireader/
description: "Go Forth and WikiReadit"
canonical_url: https://blog.brush.co.nz/2009/12/wikireader/
---
<h1>Go Forth and WikiReadit</h1>
<p class="subtitle">December 2009</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2009/12/wikireader/)


<p><a href="http://thewikireader.com/" title="Go to the WikiReader home page"><img style="width:auto" alt="WikiReader" class="right" height="202" src="/images/brushblog/2009_12_wikireader.png" width="200"/></a>The <a href="http://thewikireader.com/">WikiReader</a> is a little $99 gizmo that lets you read Wikipedia. Yep, that’s all it does. No mobile phone, no movie player, no Webkit-enabled browser.</p>

<p>There’s something about a product that does one simple thing well. But what really sets the WikiReader apart is that it lasts a year on 2 AAA batteries with no charging. <span style="background-color: #ffffff; ">How? The low-power LCD screen, and the <a href="http://www.epson.jp/device/semicon_e/product/mcu/32bit/">tiny microprocessor</a>.</span></p>

<p><span style="background-color: #ffffff;">But what’s even cooler, at least for someone who <a href="/writings/how-did-you-learn-to-program/">learned to program</a> by dabbling in Forth, is that the device has a built-in <a href="http://github.com/wikireader/wikireader/tree/master/samo-lib/forth/">Forth interpreter</a> for testing the hardware and running small programs.</span></p>

<p>I was pleasantly surprised – I know that Forth is good for embedded work on tiny micros, but since the main WikiReader app is written in C, I was curious why they chose Forth for testing and apps. So I asked Christopher Hall, one of the main firmware developers. His reply was very informative, and he’s kindly allowed me to copy it here:</p>

<blockquote>I have written testing programs in several languages, but compiled programs always have the problem of the edit, cross compile, load, and try to debug. Sometimes the platform can run BSD or Linux, and then you can have the full suite of tools on the platform. This is okay if the person doing the initial testing can write programs, but often the test is how to toggle a particular I/O line on/off and see the effect on the rest of the circuit. Then having some kind of scripting on the platform seems the best way to achieve this.
</blockquote>

<blockquote>For the initial testing, just start the interpreter REPL and you can start the initial tests. Initially I looked at TCL and Python which I have used before, but they would take far too long to port since they need a lot of Posix system calls which do not exist for this platform.
</blockquote>

<blockquote>I also considered Hedgehog, Pico Lisp or perhaps some simple Scheme interpreter but the syntax would probably be too difficult for the hardware engineers to use. Forth is pretty simple syntax and RPN was probably not too difficult for them to learn. Also it was easy to build the Forth interpreter, incrementally adding features until it is now an almost ANSI standard Forth.
</blockquote>

<blockquote>Since I added all the device registers the hardware engineers can use commands like the following (I used the same register names as the datasheet):
</blockquote>

<blockquote>
<pre>P0_P0D p?    \ display value of port
1 P0_P0D p!  \ set port to 1</pre>

</blockquote>

<blockquote>While waiting for the main application development I could build tests for items like the LCD and CTP with just a serial connection on the device itself – using cut/paste from Emacs to picocom to upload Forth words. This is much quicker than cross-compiling and swapping SD cards.
</blockquote>

<blockquote>The Forth is rather slow in compiling, the dictionary search is quite slow for example, and the indirect threading adds run-time overhead so in its present form it is probably not fast enough for the main reader application, but for quick applications to try things out I find it very convenient.
</blockquote>

<blockquote>Also, the first version was hand translated from a version of EForth for Linux before I migrated it to the ANSI standard. (I kept copies in <a href="http://github.com/wikireader/wikireader/tree/master/samo-lib/forth/EForthOriginals/">samo-lib/forth/EForthOriginals</a> subdirectory.)
</blockquote>

<p>Very neat. If Lisp is the <a href="http://www.paulgraham.com/avg.html">secret weapon</a> for developing web apps, maybe Forth is it for embedded apps. Both are extensible at the language level and both have real macros, but Lisp is high level and Forth is low level.</p>

<p>Well, you know what to buy me for Christmas:</p>

<blockquote style="font-size: 19px; margin-bottom: 3.5em;"><strong><code>feeling-nice? if  WikiReader buy  then</code></strong>
</blockquote>



<h2>Comments</h2>

<h3>Nickolai Leschov <span style="padding-left: 1em; color: #bbb;">5 Dec 2009, 02:55</span></h3>

<p>I am exceted to hear about such thing! I think the world could use more souch things, that do one thing and do it well. I learned Forth in 2002 and managed to get paid for programming Forth back then; it was a joy.</p>

<p>Could you please clarify some things:</p>

<ul>
<li>You say it uses 3 AAA batteries, their site says 2. Which is true?</li>
<li>How do I acess Forth interpreter? Do I need to connect to the device with a cable (no such thing seems to be included)? Or, wait, do I just type on the screen?</li>
<li>Is the code covered by some sort of open source license? (I suspect it is, but I didn’t see it mentioned.) How do I change the code running on the device or update to the newer release version? (It seems to be under active development.)</li>
</ul>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">5 Dec 2009, 08:44</span></h3>

<p>Hi Nickolai — out of interest, what company did you program Forth for? Thanks for the clarifications, too:</p>

<ul>
<li>Good catch. Yes, it definitely runs on 2 batteries. Fixed now.</li>
<li>I don’t own a WikiReader (I wish), but <a href="http://arstechnica.com/open-source/reviews/2009/11/hands-on-openmoko-wikireader-is-simple-appealing.ars" rel="nofollow">this Arstechnica article</a> says, “To access these programs, you hold the ‘random’ button down while you turn on the device. It will display a menu of the Forth programs and allow you to run one of them by tapping it on the touchscreen.”</li>
<li>As for licensing, browsing through the source tree shows that the main wiki app is licensed with the GPL, but the Forth is licensed with a BSD-style license. It looks like there are a <a href="http://wiki.github.com/wikireader/wikireader/flashing-the-bootloader" rel="nofollow">couple of ways</a> to update the source code, the easiest of which is by putting a file on the SD card.</li>
</ul>

<h3>Bob <span style="padding-left: 1em; color: #bbb;">6 Dec 2009, 02:51</span></h3>

<p>I used Forth a great deal in the 1980’s.  My last big Forth project was in 1995-6 — a system on a chip set top box decoder.  We designed a 32 bit Forth oriented CPU in Verilog, and I wrote the cross assembler, cross compiler, simulator, operating system, and debugger.  Too bad the chip was a bit too ambitious or its time, and the yeild out of fab was so low that they couldn’t make a profit with it.</p>

<h3>Adam <span style="padding-left: 1em; color: #bbb;">8 Dec 2009, 10:29</span></h3>

<p>I have one. I’m not even sure where to start with developing for it. I couldn’t get their toolchain going.</p>

<h3>Carsten Strotmann <span style="padding-left: 1em; color: #bbb;">26 Mar 2010, 23:37</span></h3>

<p>Hello Adam,</p>

<p>to start developing using Forth you do not need to have a toolchain. You can write and test a program using a Forth System on your PC (Linux or other OS), then you copy the source on the Micro-SD card in the Wikireader, and start executing. For debugging, you probably want to solder a serial terminal to the wikireader so that you can interactively develop and debug on thw wikireader itself (and not do cross-development, see <a href="http://wiki.github.com/wikireader/wikireader/hardware-specifications" rel="nofollow">http://wiki.github.com/wikireader/wikireader/hardware-specifications</a> under “debug-connector”).</p>

