---
layout: default
title: "Can modern software be snappy?"
permalink: /writings/snappy-software/
description: "Can modern software be snappy?"
canonical_url: https://blog.brush.co.nz/2008/06/snappy-software/
---
<h1>Can modern software be snappy?</h1>
<p class="subtitle">June 2008</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2008/06/snappy-software/)


<p><a href="http://www.mattwardman.com/blog/2007/08/22/dumping-itunes-because-of-software-bloat/" title="See this blog entry, for example"><img style="width:auto" alt="No bloat" class="right" height="126" src="/images/brushblog/2008_06_nobloat.png" width="125"/></a>Solomon once said <a href="http://www.biblegateway.com/passage/?search=eccl%207:10;&amp;version=31;">not to pine for the good ol’ days</a>, and that’s sage advice, but I’m sure he didn’t intend it to apply to software bloat.</p>

<p>I’m not just talking about memory and megahertz bloat — we’ve also got performance <i>un</i>bloat. And it almost seems like the two go hand-in-hand. The <i>more</i> memory something hogs, the slower it’ll run.</p>

<p>Compare <a href="http://www.foxitsoftware.com/pdf/rd_intro.php">Foxit’s PDF reader</a> to <a href="http://www.adobe.com/products/acrobat/readstep2.html">Adobe Reader</a>:</p>

<ul>
<li>Foxit is a 2.5 MB download, Adobe is a 25 MB one.</li>
<li>Foxit uses 8 MB of memory for a 700 KB PDF, Adobe uses 56 MB.</li>
<li>Foxit loads in about 1 second, Adobe in 4 seconds.</li>
<li>Foxit is as fast or faster to use.</li>
</ul>

<p>Okay, so maybe Foxit doesn’t display all the latest 3D JavaScript-enhanced PDFs, but it does all you need, and it does it (relatively) small, fast, and light.</p>

<p>Maybe it helps (or hinders) to be an <a href="http://brush.co.nz/software">embedded programmer</a>, and know how much you <i>can</i> do with 32 KB of code, 2 KB of RAM, and an 8 MHz, 8-bit processor. Sometimes I wish developers had to write code on ancient 66 MHz 486s. Constraints are the mother of optimization, and programmers will usually forget about optimization after it runs “fast enough” on their 42-core Pentium IX, 10 TB RAM development machine.</p>

<p>Sure, I grant that RAM and clock cycles are cheap these days, and we might as well use ’em. But surely there’s a limit to all this. When my (plain text!) editor runs slow enough so I can see the screen updating, there’s something wrong.</p>

<p>When Visual Studio takes 2 entire seconds to pop up a simple properties window the first time, there’s something wrong.</p>

<p>Back in the days when programmers cared about how many characters they could write to video memory during the <a href="http://en.wikipedia.org/wiki/Color_Graphics_Adapter">CGA</a> horizontal retrace time without it producing snow — back in those days, and running on a 286, I couldn’t see my screen updating.</p>

<p>We now have 1000’s of times the computing power, and as far as user experience is concerned, stuff runs slower than it used it. And we put up with it, because they’ve added one or two features we like, and it’s “good enough”. But it just ain’t right.</p>

<p>And it’s not just the my text editor and Visual Studio. When <a href="http://www.mozilla.com/thunderbird/">Thunderbird</a> first came out, it was so slow on my fairly average hardware that I simply couldn’t use it. And now on my 2 GHz dual-core whatever-it-is, it’s still slow. I click on Inbox the first time, and it takes a second and a half for the message to pop up. Come on, people — you could load a usenet thread off a floppy drive in that time!</p>

<p>Somehow we’ve convinced ourselves that Gmail’s conversation view and anti-spam features make it worth putting up with 750 millisecond <a href="http://www.codinghorror.com/blog/archives/000722.html">Ajax delays all the time</a>. <i>Nope, it just ain’t right.</i></p>

<p>Recently I was reading from Michael Abrash’s <a href="http://www.byte.com/abrash/"><i>Graphics Programming Black Book</i></a>, and he has something telling (albeit provocative) to say about all this in chapter 2:</p>

<blockquote><p><a href="http://www.byte.com/abrash/" title="Abrash is the Antibloat"><img style="width:auto" alt="Abrash's Black Book" class="right border" height="133" src="/images/brushblog/2008_06_abrash.png" width="150"/></a>You will notice that my short list of objectives for high-performance assembly programming does not include traditional objectives such as easy maintenance and speed of development. Those are indeed important considerations— to persons and companies that develop and distribute software. <b>People who actually <i>buy</i> software, on the other hand, care only about how well that software performs, not how it was developed nor how it is maintained.</b> These days, developers spend so much time focusing on such admittedly important issues as code maintainability and reusability, source code control, choice of development environment, and the like that they often forget rule #1: From the user’s perspective, <i>performance is fundamental.</i></p>
</blockquote>

<p>My theory is that it’s gonna take an <a href="http://en.wikipedia.org/wiki/Richard_Stallman">RMS</a>-style prophet to come along, take a few pages out of Abrash’s book, write his own instant-GUI operating system, wake up the masses to the 
joy of responsive computing, and watch the bloat industry crumble.</p>

<p>It’ll be a world where you can turn on your computer and use it immediately. A world where you wait at most half a second for big programs to load. A world where your screen will update even before the keyup event is sent. It won’t be utopia, but I’m still looking forward to it.</p>

<p>We’re taking submissions for this kind of prophet. Drop your résumé or CV in the comments below. :-)</p>



<h2>Comments</h2>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 11:46</span></h3>

<p>Just a small P.S. about tiny programs.</p>

<p>It was probably my dad who first gave me a love of antibloat. He taught me to program in x86 assembly, as well as in <a href="http://en.wikipedia.org/wiki/Forth_(programming_language)" rel="nofollow">Forth</a> — a language in which you can write a compiler in about 2 KB. Ages ago he wrote a little <a href="http://en.wikipedia.org/wiki/Terminate_and_Stay_Resident" rel="nofollow">TSR</a> text editor for DOS called PED (Popup EDitor). The PED.COM executable is 3559 bytes, and it works on everything from an 8086 running DOS to a Pentium IV running Windows XP.</p>

<h3>Norman <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 20:49</span></h3>

<p>You’re in good company :</p>

<p><a href="http://cr.yp.to/bib/1995/wirth.pdf" rel="nofollow">http://cr.yp.to/bib/1995/wirth.pdf</a></p>

<h3>Norman <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 21:18</span></h3>

<p>I just tried PED.COM, great program !</p>

<p>If you’re still into small code and Forth then try this system that’s being developped by Pablo Reda : </p>

<p><a href="http://reda4.org/" rel="nofollow">http://reda4.org/</a></p>

<p>All the code is in TXT files, the text editor might interest you or your father. The Forth is a Colorforth inspired. It’s all free.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 22:51</span></h3>

<p>Norman, thanks for the links. Looking forward to reading the article by Niklaus Wirth (tomorrow). Though I admit to having trouble reading the (is that Spanish?) redo4 website. :-)</p>

<h3>James Justin Harrell <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 23:14</span></h3>

<p>Which is newer, Foxit or Adobe Reader? Seems like a poor example.</p>

<h3>aare <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 23:40</span></h3>

<p>Yeah, visual studio and gmail are ones of the most infuriating programs for me also. It is such a pleasure to use textpad editor outside of work when I have the time. It’s hard to image industry chaning though. I think industry will keep producing slow and bloated programs as long as there are no better programming and design paradigms.</p>

<h3>Norman <span style="padding-left: 1em; color: #bbb;">27 Jun 2008, 23:45</span></h3>

<p>re Spanish reda4.org site : there is an english version of the Manual. The software really is worth installing and playing around with :) Compiles to ASM and generates small executables.</p>

<h3>Dan <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 00:20</span></h3>

<p>It seems to me that when people complain about bloat they really mean ‘I don’t need it so no one needs it’.</p>

<p>Ben, the reason your TSR runs under XP is down to a large chunk of compatibility code shipped with every copy of Windows. This is 100% pure bloat for those of us who don’t run legacy DOS apps.</p>

<h3>Andrew Murdoch <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 00:46</span></h3>

<p>The argument of “give developers slow crappy machines so they write faster software” is I think invalid for a couple of reasons.
Firstly, the more times a developer can edit, compile and test an application during development, the faster bugs can be squashed.
Secondly, for some software (in particular games), if the projected release date is 2 years away, a developer should be using the sort of hardware most people will have then, so that they can take advantage of the new capabilities or speed.</p>

<h3>Stephane Grenier <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 02:32</span></h3>

<p>I have two comments in regards to your post:</p>

<ol>
<li><p>I agree that a lot of software today is unresponsive! It’s absolutely amazing how many software shops don’t even run their applications through a code profiler to find the bottlenecks. Just this alone can very significantly increase the performance of many software applications! <strong>If nothing else, at least run your application through a code profiler.</strong></p></li>
<li><p>I really appreciated your comment about running the application on a slower box. Most developers forget that they have really powerful boxes. Running good enough on these boxes is not good enough. Try it on a $300-500 system. That should be the good enough metric.</p></li>
</ol>

<p>And speaking of this, I remember in university where we had to create some kind of graphics driver in assembly. We all worked on our development boxes and had good enough performance. However the prof pulled a good one on us at the last minute and decided to test our drivers on a box that ran at a quarter of the speed. A quick note, he had instructed us that our driver had to run within certain specs, including the slower box speed, however most people ignored it. So those who took shortcuts with good enough performance got hit pretty hard.</p>

<h3>Eric Normand <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 02:51</span></h3>

<p>Yes.  I agree. Too much bloat.</p>

<p>In general, though, I don’t think maintainability and optimization are mutually exclusive.  Our languages and systems just suck at doing both.</p>

<h3>Trey Boudreau <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 03:26</span></h3>

<p>The CGA display you remember fondly contained 80*25 glyphs at 2 bytes per glyph (one each for character and color) for a whopping 4000 bytes of data.  The same screen of data in a modern bit-mapped display with a 10×12 pixel grid at 16 bites per pixel per fixed width character takes 480000 bytes.  And that only represents a fraction of all the pixels on your desktop.  Modern graphics cards have the highest memory bandwidth of any device in your computer for a reason.</p>

<p>Still, I occasionally miss the Brief text editor and Turbo Debugger from MS-DOS days :-)</p>

<h3>capsid <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 03:49</span></h3>

<p>You can’t control the aesthetic of all the application programmers out there, but you can work on a easily installable collection of speed tweaks for a certain hugely popular distribution.  Let’s make an Ubuntu remix that is optimized for snappiness.  Zoombuntu:)  </p>

<p>I was able to cut my boot time down to 15 seconds using an Ubuntu Server installation and the Blackbox desktop, but it lacked a lot of the applets that make my notebook functional (like the wireless manager).  I feel like the key to speed is in perception rather than performance.  I want to see the visual feedback of starting my computer or opening a program right away, even if it’s loading extra components in the background.  </p>

<p>Perception can affect the experience the other way, too.  A program may be loading extraordinarily fast for how large it is, but if it is consuming all of the cpu and IO bandwidth while it does it, it seems slow.</p>

<h3>David Hogarty <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 05:43</span></h3>

<p>Efficiency, Flexibility, and Complexity. You can optimize for two of the three at the expense of growth in the others. Because both efficiency and flexibility are necessary, the only way to get there is to start to tackle the issues of complexity: how can I write code general enough that it can be optimized efficiently for other architectures, and yet ‘instantiate’ it to a specific architecture and take advantage of all optimizations the constraints of that system allow? How can I minimize the pain of adding new data processing streams (e.g. function parameters, I/O devices, compute devices) to an existing solution?</p>

<h3>Gabriel C <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 05:51</span></h3>

<p>You can make your system go faster and less bloated… set your screen resolution and colors to minimum (640×480 x16 colors?), kill or stop all the background process, or better, give the your program direct access to the hardware… 
As long as people are willing to buy new hardware/software so they can plug-n-play their digital camera, browse the 1000 1Mb photos and send a few to a color photo printer they just plugged, have his text processor spell/syntax check and suggest while they write, get direct updates from internet, check for virus in files and emails in the background, have the disk compressed, etc, we’ll have the “slowness” and “bloat”, because it requires layers over layers of indirection…</p>

<h3>StCredZero <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 06:24</span></h3>

<p>It should be possible to set up QEMU or some other virtual machine so that you can compile your application natively but use it on a much slower machine.  This gives you the best of both worlds: the developers have to eat their own cooking on non-uber machines, but they get to have fast compiles and more iterations.</p>

<h3>robvas <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 06:32</span></h3>

<p>Microsoft did the right thing when the ported Office to the Macintosh.  They tested every build on the original Power Mac, a 60MHz 601. Not a bad idea.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 10:59</span></h3>

<p>Dan, fair point that DOS TSR’s still working under XP is an example of bloat — I guess I agree. And aare, I agree about Textpad: that is light and fast. Pity it’s not free, and it’s a pity version 5 is not as good as version 4.</p>

<h3>Brett Morgan <span style="padding-left: 1em; color: #bbb;">28 Jun 2008, 11:04</span></h3>

<p>Yes there is something wrong with GUI programs. I don’t, however, think it can be fixed with a mantra of “do less.”</p>

<p>The simple problem with most software is that everything is done in one thread, and thus the interactivity has to wait for what ever processing is being done. Or worse, parts of the program’s ui become unusuable when you are carrying out a specific action, e.g. MS Word’s application modal file save dialog.</p>

<p>The real answer here is transitioning to MT aware code such that the work gets done on background threads and the foreground UI thread is never held locked.</p>

<h3>Leonard Rosenthol <span style="padding-left: 1em; color: #bbb;">1 Jul 2008, 06:15</span></h3>

<p>I agree with the other posters – that comparing FoxIt Reader to Adobe Reader 8 is not a fare comparison since, as you state later in the article, Adobe Reader does a LOT MORE than FoxIt.  As such, it makes perfect sense that it would take up more disk space.   But disk space is cheap.</p>

<p>Your comments concerning performance and memory usage, however, are well taken and don’t in any way relate to the disk space usage of a given application.  One can be small on disk and have large memory footprint – or vice versa. </p>

<p>To that end, I recommend that you get yourself a copy of Adobe Reader 9 – just released – and compare again.  I think you’ll find a product that is now MUCH FASTER and SMARTER than it’s predecessor…</p>

<h3>AdVerit Comunicación digital <span style="padding-left: 1em; color: #bbb;">6 Jul 2008, 09:47</span></h3>

<p>Please, it is supposed to render a pdf file. Foxit can do everything i need with a lot less resources.</p>

<h3>ngobikannan <span style="padding-left: 1em; color: #bbb;">6 Jul 2008, 11:56</span></h3>

<p>I am actually surprised you even tried installing a newer Adobe reader</p>

<h3>Ч <span style="padding-left: 1em; color: #bbb;">10 Aug 2008, 09:18</span></h3>

<p>“I grant that RAM and clock cycles are cheap these days, and we might as well use ‘em.”
yes, lets use the hardware to do something <em>useful</em>.</p>

<h3>zoc.i.am <span style="padding-left: 1em; color: #bbb;">31 Aug 2008, 10:14</span></h3>

<p>Actually, a “prophet” did come along, and wrote his own instant-GUI operating system: The prophet’s name is Niklaus Wirth, and the OS name was “Oberon”. </p>

<p>It was snappy, and it was SMALL – it used to ship on a 1.44 MB floppy (or was it two?). But still, for one reason or another, the OS never really made it out of the university halls of ETH Zürich.</p>

<h3>Daniel José dos Santos <span style="padding-left: 1em; color: #bbb;">29 Jan 2018, 09:04</span></h3>

<p>One of my dreams is to work with people that have this mindset that you show in this post. I’m tired of bloated and slow modern software. </p>

<p>7-Zip is another very good example of small, simple and great software.</p>

