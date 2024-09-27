---
layout: default
title: "Why I’m not moving to Linux just yet"
permalink: /writings/not-linux-yet/
description: "Why I’m not moving to Linux just yet"
canonical_url: https://blog.brush.co.nz/2010/04/not-linux-yet/
---
<h1>Why I’m not moving to Linux just yet</h1>
<p class="subtitle">April 2010</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2010/04/not-linux-yet/)


<p>Linux has come a long way from when I first tried it about 10 years ago. Just not quite far enough, at least in certain respects. Call me a heretic, but I’m sticking with Windows for now (on my PC anyway — servers are another matter).</p>

<p>Preface: I’m not <a href="http://en.wikipedia.org/wiki/Richard_Stallman">RMS</a>, so I don’t shudder at the thought of proprietary software. And I’m <a href="http://www.codinghorror.com/blog/2008/04/we-dont-use-software-that-costs-money-here.html">quite willing</a> to pay a reasonable price for good software.</p>

<p>But here’s why I’m not switching to Linux just yet:</p>

<p><img style="width:auto" alt="Comparison of fonts in Linux and Windows XP" class="right" height="49" src="/images/brushblog/2010_04_linux-windows-fonts.png" width="284"/></p>

<ul>
<li><strong>Font rendering is average.</strong> I’m fairly picky about typography, but font rendering in Linux just isn’t as good as in Windows, especially the hinting. I know there’s various technical and legal reasons for this, but compare the weights and clarity of the ‘N’, ‘W’, ‘A’ and ‘e’ in the shot on the right — that bugs me. (For reference, I’m comparing Ubuntu 9.10 to Windows XP, and yes, I do have the MS web fonts installed.)</li>
<li>The default <b>UI is significantly slower</b> than the XP’s UI. This is noticeable in system menus and dialogs, but you notice it even more in certain cross-platform apps such as Firefox (e.g., PageUp/PageDn in a reddit thread with lots of comments).</li>
<li><b>Program UIs aren’t consistent</b>, much less so than in the Windows world. I was pleasantly surprised at the consistency of Ubuntu’s built-in offerings, but as soon as you go beyond that, you’re in each-hacker-to-his-own-UI territory.</li>
<li>Relatedly, <b>programmer power is split</b> between Gnome, KDE, Xfce, and whatever other desktop environments you care to name. Religious debates aside, it means quality open source hackerness is being split to make three (or more) okay environments rather than one really good one.</li>
<li>Tools are often <b>much less refined</b> than their Windows counterparts (open source or otherwise). For instance, <a href="http://tortoisesvn.tigris.org/">TortoiseSVN</a> under Windows is really nice, but <a href="http://rabbitvcs.org/">the equivalent</a> on Linux is years behind. Skype under Windows is great, but the UI for Linux Skype is klunky.</li>
<li><b>Some minor things.</b> For example, loud PC speaker beeps everywhere, when your sin was merely pressing Down when you’re at the bottom of the file in gedit. Oh yes, and the first thing Ubuntu told me just after I’d installed their latest version was “there are 130MB of automatic updates ready”. Note to Ubuntu devs: check out <a href="http://www.daemonology.net/bsdiff/">bsdiff</a>.</li>
</ul>

<p>But I don’t want to be all moans and groans. Like I said, it’s come a long way, especially in the last few years. And I think the <a href="http://www.ubuntu.com/">Ubuntu</a> people have done a great job of packaging a decent, friendly OS that’s easy enough to use for The Average User. Here’s some really positive stuff about Ubuntu:</p>

<ul>
<li>The Ubuntu <b>install was superb</b>. Everything just worked, and that’s a huge change from even a few years ago. Even wireless networking just worked!</li>
<li>Despite mentioning UI inconsistency between programs, I was impressed with <b>how good most of the built-in apps were</b>. Good work on that, <a href="http://www.gnome.org/">Gnome</a> and Ubuntu.</li>
</ul>

<p>And to end on a software engineering (read: hackish) note, I’m going to make a crazy suggestion about improving fonts: I wonder if you could make Windows-rendered bitmap versions of (say) Verdana or Trebuchet MS and then use those in Linux?</p>



<h2>Comments</h2>

<h3>Bryan Hoyt <span style="padding-left: 1em; color: #bbb;">26 Apr 2010, 12:32</span></h3>

<p>A bit of a counterpoint … here are some things that I really care about, which would probably keep me from ever switching back:</p>

<ul>
<li>It’s open-source. Software with a future — if Microsoft goes down in smoke or makes a program backwards incompatible, or I lose my job &amp; can’t afford yearly upgrades, I can still open the important documents I worked on 5 years ago without having to track down a binary copy of some obsolete program. Sure, there’s still the possibility of an open-source program disappearing altogether, but it’s on much thicker ice.</li>
<li>Again, because it’s open-source, I can at least dream of contributing to it. Even if I’m not a programmer, I could see my wallpaper, theme, or help document included in Ubuntu one day.</li>
<li>Again, because it’s open-source, I can find out how things really work under the hood, if I really need to.</li>
<li>Unless you want to install a very unusual program, or the latest cutting edge release, installing &amp; uninstalling software is so smooth it’s fun — unlike windows where every package has it’s own custom installer (see <a href="http://blog.brush.co.nz/2008/07/adobe-reader-9/" rel="nofollow">Adobe 9’s madness</a>), and may or may not be uninstallable. Nowadays, even proprietary software like Skype comes with easy one-click-install packages for Linux.</li>
<li>Very many of the GUI applets &amp; utilities are written in Python &amp; are easy to script if they don’t <em>quite</em> do what you want — if you have a little programming under your belt</li>
<li>Community — people actually care about the software they use. I can post bugs, and have some real hope that I’ll be listened to &amp; the bug will be fixed (more so than with microsoft). I can post feature ideas on <a href="http://brainstorm.ubuntu.com/" rel="nofollow">brainstorm.ubuntu.com</a>, and know that real Ubuntu developers actually read &amp; think about those ideas — it’s not perfect, but it’s something.</li>
<li>Performance (especially startup performance) doesn’t seem to mysteriously degrade over 3 years of (mis)use, like it does with Windows. Among other things, this is because in Windows, every new gadget you buy, DVD you play, software you install, or email you open, wants to install some useless applet to your notification area. Linux software is much more committed to using the tools the OS provides.</li>
<li>Meaningful, interesting, and useful upgrades every 6 months (for Ubuntu). Each upgrade says clearly what new features it provides before you download it, and it’s easy to try without installing it, so I don’t waste time installing Windows Vista only to find it’s no better than XP, and much more annoying.</li>
<li>The <a href="https://launchpad.net/hundredpapercuts" rel="nofollow">100 papercuts</a> project, dedicated to fixing easy-to-fix minor annoyances</li>
<li>Almost every developers tool you’ll ever need, installed (or in the easy-to-install-from repositories) by default. It’s very unpleasant to install developer tools (that is, good quality open-source developer tools) on windows — this is one case where windows often requires a lot of building from source. And guess what? Windows doesn’t come with a C compiler already installed to make it easy.</li>
</ul>

<h3>Jack <span style="padding-left: 1em; color: #bbb;">26 Apr 2010, 13:14</span></h3>

<p>“the first thing Ubuntu told me just after I’d installed their latest version was “there are 130MB of automatic updates ready”.”</p>

<p>It’s a fact of life that there are always going to be updates available for your OS, whether for XP, Vista, Windows 7, Mac OSX, Ubuntu, Debian, etc.</p>

<p>The thing about ‘linux updates’ is that they aren’t for the Linux OS alone, unlike Windows XXX updates. The updates available include updates for applications as well as updates for the OS.</p>

<h3>deaky <span style="padding-left: 1em; color: #bbb;">26 Apr 2010, 14:36</span></h3>

<p>Most of the time these posts come along, it’s to remind us how hard it is to will yourself to become comfortable with a new tool. I too was more comfortable in XP, and changing to Linux took me a lot of willpower because of these perceived “rough edges”.</p>

<p>But you know what? Once I took the plunge and started to re-work my approach, it stuck with me. Not every old dog like me wants to learn these new tricks, but now I’m so comfortable in Linux that I can’t work in Visual Studio or XCode without a constant stream of resentment. My chosen software is consistent looking and works in a snappy way that’s conducive to how I work.. and I can’t replicate it on Windows or OSX either.</p>

<p>I applaud you for being willing to at least try something unfamiliar, but really it won’t solve anything to expect Linux to be identical to Windows, right down to the smallest font and UI. If that’s the bar you are setting, then why are you switching in the first place? Why fix something that’s not broken?</p>

<p>Ultimately this list honestly just reads like another laundry list of “comfort zone items”, aside from perhaps the font “issue” (which has oddly never bothered me, despite my living and breathing in code in Linux most of my time) and the “time-split” argument about Desktop Environments (which I won’t get into, since I don’t see it as particularly relevant to the discussion).</p>

<p>Still, it might be good to make suggestions to Ubuntu (and others) on the minor/UI things.. they might actually change them if enough people ask. And in ten years, you might see the fruits of your labor when you get your next “let’s try Linux again” temptation ;)</p>

<h3>SteveC <span style="padding-left: 1em; color: #bbb;">26 Apr 2010, 14:37</span></h3>

<p>“Program UIs aren’t consistent…etc.”</p>

<p>Good.  Stay away.  We do not want your kind anyway.  Your kind wrecks everything, making everything stupid for the benefit of the moron who can’t learn.   Stay far far away for as long as possible, preferably, until dead.  Really.  </p>

<p>Pissed off at this reply?  Good.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">26 Apr 2010, 14:37</span></h3>

<p>These are helpful comments from the other side of the fence, guys — thanks. I’m referring to Bryan, Jack, and especially deaky.</p>

<p>SteveC, not so much. :-) It’s not about dumbing things down, it’s about consistency between apps and controls — don’t you like that?</p>

<h3>deaky <span style="padding-left: 1em; color: #bbb;">26 Apr 2010, 15:38</span></h3>

<p>@SteveC, we certainly DO want them (well, at least people willing to “seriously” try Linux). Linux has it’s own way of doing things, but that doesn’t mean we can’t improve on them. You might feel like trolling, but I sure don’t.. not all people on one side of the fence are closed-minded jerkoffs, even on the Internet.</p>

<p>Sure.. criticism, even the constructive variety, gets repetitive after a while. But that’s no reason to not try to coax people to donate some of their time to helping us code, design, or document things. Not everyone has the time to spend a few hours learning about Linux the hard way, so we have to encourage them to find the time somehow.. not drive them away because we think they aren’t trying as hard as we did.</p>

<h3>Chad <span style="padding-left: 1em; color: #bbb;">27 Apr 2010, 02:45</span></h3>

<p>I’m a Ubuntu user at home and a Windows XP user at work. I love the Ubuntu experience at home and doubt I will ever go back to Windows. A couple of other points in favor of linux. </p>

<ul>
<li><p>No Adware/Spyware/Viruses and related “defender” applications. Windows users spend way too much time dealing with these issues. On linux, you spend zero time on these issues. It’s extremely refreshing.</p></li>
<li><p>More innovative desktop paradigms. For example, Gnome (and other desktops) give you the option of multiple-desktop views that are easy to switch between. This allows you to easily partition different types of work. Gnome also allows for more customizable paneling so you are not tied to the start menu like you are in Windows.</p></li>
<li><p>The cross-platform apps argument goes both ways. I agree Firefox isn’t quite as nice on Linux as on Windows (it has come a long way, though). However, have you ever tried to use Vim or Emacs on Windows? Definitely not as well integrated as on Linux.</p></li>
</ul>

<h3>Antoine Toulme <span style="padding-left: 1em; color: #bbb;">27 Apr 2010, 03:15</span></h3>

<p>I think you can install Windows fonts on Linux. It’s fairly easy, there is a deb that takes care of the process.</p>

<p>If you don’t mind spending money for good software, buy a Mac. I never looked back.</p>

<h3>fontpicky <span style="padding-left: 1em; color: #bbb;">27 Apr 2010, 03:24</span></h3>

<p>Have you played with the font hinting settings ? (last tab of gnome-appearance-properties aka. System→Prefs→Appearance, then [details…] for fine tuning)</p>

<p>You may find settings for suitable to your preferences (I like my fonts with nice shape at the expense of blurriness (ala osx), others prefer extremely hinted fonts, or greyscale smoothing instead of subpixel, you can have them all).</p>

<h3>sean <span style="padding-left: 1em; color: #bbb;">1 Jul 2010, 00:02</span></h3>

<p>well such a good topic it was.right now windows was OK.but Linux have to improve  the things.i hope it will done in future.</p>

<h3>Ron Hyatt <span style="padding-left: 1em; color: #bbb;">17 Feb 2011, 05:46</span></h3>

<p>After a year of making do with linux in a networked environment, we’re upgrading hardware, and saying goodbye to “sometimes it connects to the network, sometimes it doesn’t” Ubuntu.  Hello Win 7, hello consistent interface
Free software isn’t free;  unless your time is worth zero, the costs of linux are exponentially higher than a 129.00 copy of windows.</p>

<h3>Jessica Miller <span style="padding-left: 1em; color: #bbb;">7 Sep 2011, 14:53</span></h3>

<p>Still not the easier graphic user interface, and tough navigational options makes the Linux flavors place behind windows. But some valid features like “no adware or spamware”, that’s true! since less targeted by hackers.</p>

