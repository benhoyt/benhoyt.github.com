---
layout: default
title: "Jim Lawless interviews Ben Hoyt on *Stray Pointers*"
permalink: /writings/stray-pointers-interview/
description: "This is a transcription of Jim Lawless's interview with Ben Hoyt on his Stray Pointers podcast. We discuss Forth, C, CGI, Python, Go, and AWK."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">January 2024</p>


> This is a lightly edited, *um*-removed transcription of the conversation I had with Jim Lawless, host of the varied and interesting [Stray Pointers](https://straypointers.com/) podcast. It was recorded on the 15th of January (U.S. time). We discuss Forth, C, CGI, Python, Go, and AWK.
>
> You can listen to it on the [episode's web page](https://sites.libsyn.com/481983/discussing-programming-languages-with-ben-hoyt) or on [YouTube](https://www.youtube.com/watch?v=6ZJYsPhmkg0).


**Jim:** Tonight I'd like to welcome engineering manager and software engineer Ben Hoyt. Ben, welcome to the show!

**Ben:** Well, thanks a lot.

**Jim:** Hey Ben, I had taken some note of your accomplishments when I saw that you were the tech editor or a tech reviewer of the [new version of *The AWK Programming Language* book](https://awk.dev/), and I kind of went from there and I found that you have a rather interesting history with programming languages. So I'd like to discuss your background in programming -- kind of how you got started, what languages you first used.

**Ben:** Yeah, it goes a ways back. I started when I was a kid in the, let's see, late '80s, early '90s. The first computer I remember was a [Sega SC-3000](https://segaretro.org/SC-3000) console, which was a little keyboard computer all-in-one thing, and it had [BASIC](https://en.wikipedia.org/wiki/BASIC) installed on it. And I believe my dad who was a -- he's still around but he's retired now -- he was a minister by profession and a hobbyist programmer, a [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) programmer by night.

So he had done some dabbling with this computer, and I think got Forth running on it and a bunch of other things, and so we were exposed to that stuff. Mostly at that point I just played games and Pac-Man and things on it, but you know, there were computer magazines lying around and they had those BASIC programs in the back with some silly little BASIC game, and you had to type it all in from the back of the magazine. So I did a few of those, and they never worked because you made one error and the whole thing just falls flat. But that sort of got me into it I think, as well as Dad's interest.

**Jim:** I am particularly curious about your interest in Forth. You ended up writing an article with Hans Bezemer for [*Forth Dimensions*](https://www.forth.org/fd/contents.html) magazine while you were still just a teenager -- is that correct?

**Ben:** Yeah, that's right. And I think that's my first bit of published technical writing. I've since gone on to quite enjoy technical writing; I have a blog. But that was probably premature, you know it wasn't very well peer-reviewed and I mean it was good for what it was. The article was on lookup tables in Forth and how great they were, and I sort of co-wrote the article with him.

**Jim:** How did you happen to meet up with Hans, because he's kind of semi-famous in Forth circles now for his [4tH compiler](https://thebeez.home.xs4all.nl/4tH/) -- the digit 4 T-H.

**Ben:** Yeah, that's right, and I think he was at that time. He's been around a while. I've essentially never spoken to him since, but we somehow connected on comp.lang.forth or one of the newsgroups way back when, and I said I was doing some stuff on lookup tables and thought they were the bees knees. And he said, I like them too; how about we write an article for *Forth Dimensions*? I forget whether he suggested that -- I think he probably did -- that we co-write it.

So that was a nice opportunity, and so I wrote up some code and then kind of wrote up my findings about how much faster they were than other techniques. I think I played a bit fast and loose with -- if you hold your fingers the right way and smile the right way -- then they're faster, but most of the time they weren't, and I sort went with that. That's why I said it was maybe a bit premature. I wasn't -- you know, it was shiny, it was a shiny thing, and I wanted to do these lookup tables. And so they were the answer, they were the hammer that answered all questions.

**Jim:** Sure. So like any good Forther you implemented your own Forth. Can you tell me a little bit about that?

**Ben:** Yes. So Dad was heavily into Forth and had written his own Forth compiler or compilers. And so I started getting into programming seriously, and my first two languages were x86 assembly and Forth. And then I used 8086 assembly to write my own Forth in the DOS days. The great thing about Forth is that it's tiny. You can write a fully-bootstrapping compiler in a small amount of code, maybe a couple of thousand lines of code. And there's a little kernel that's written in assembly -- your *primitives* they call them, the basic operations that make up the Forth kernel. And then on top of that you write the rest in Forth itself. And so my first one was using, I think it was called the [A86 assembler](https://eji.com/a86/), if you're familiar with that, which was a neat tool.

**Jim:** Yeah, it was a shareware assembler that was pretty popular.

**Ben:** Yeah, that's right. And I think I only ever used the free version, because I was a teenager and couldn't pay for stuff. But that was a really good little assembler. So the first version of my Forth was written using A86, the kernel, and then Forth on top of that. And then a couple of versions later I figured out how to -- what they call meta-compiling in the Forth community, so building Forth with Forth, building your Forth compiler with Forth. And for that you pretty much need an assembler written in Forth, so I think I pulled one from the net and kind of hacked it, sort of almost like re-typed it in to understand it. That was how I learned a lot of things back then.

**Jim:** Bill Ragsdale has a famous one for 6502 in Forth that he published in [*Dr Dobbs*](https://en.wikipedia.org/wiki/Dr._Dobb%27s_Journal) in the early '80s. Was that the model you used or was there one that lent itself to x86?

**Ben:** No, there was a specific x86 one. I don't remember the name of it. Let me see if it's here in a code comment ... I probably didn't even reference my source on this one in the code comments by the looks. So no, it was based on an x86 assembler, I can't remember which one.

**Jim:** Okay, so after you built these Forth systems, what did you build in Forth? What sort of software did you write in Forth?

**Ben:** That's the great thing about Forth: you don't write any software in it, you just write Forth compilers in it. [Laughs.] What did I write? Some little games and graphics stuff. Kind of in parallel with my Forth messing around I was into the [demoscene](https://en.wikipedia.org/wiki/Demoscene), which for listeners who aren't familiar, it was kind of a subculture of programmers that were into writing their own -- showing off with their own little graphics demos and music demos and things. And there were different competitions like a 4K demo -- how much code can you fit in 4K that does some fancy graphics. So I was a little bit into that scene in New Zealand via [BBSs](https://en.wikipedia.org/wiki/Bulletin_board_system) and things. I'd learned on BBSs, and that was graphics and gamey type stuff, and so I did a little bit of that in Forth.

And then the other thing I did in Forth was to write my own -- this was a few years later -- my own 32-bit operating system for the 386, so it was a Forth OS. Very light -- when I say OS it's like extremely minimalist keyboard driver and disk I/O and screen driver, that was about it.

Forth really shaped my thinking and probably still does. You know, I don't use it anymore but it really shapes your thinking. It's kind of one of those languages like [Lisp](https://en.wikipedia.org/wiki/Lisp_(programming_language)) that is mind-bending and very cool in the -- philosophically speaking. And it really shaped my thinking, so I was always into stuff that was small and fast and light, you could understand top to bottom, you know, right down to the kernel.

But I got into [Turbo Pascal](https://en.wikipedia.org/wiki/Turbo_Pascal) as part of my demoscene stuff -- that was used by a lot of "sceners". Some [C](https://en.wikipedia.org/wiki/C_(programming_language)) -- dabbling in C -- but it was always a bit arcane for me, at that point anyway. At probably around that time I finished high school and went to uni and studied electrical engineering. It was a funny story about -- it's kind of a weird decision they had at the electrical engineering course at uni: you could take a programming course at the start of the three-year program, and if you passed that programming course -- a little course in C, a little test in C, write some C, do this, answer these questions -- and if you passed that little test you didn't have to take any other programming courses for the rest of the rest of the programme. And I did that -- I passed the test, and it was a mistake, because, you know, I could program but I didn't know software engineering and kind of bigger-picture stuff. So it was only really after university on the job that I picked up C for real and I learned how to structure larger programs and do software engineering, kind of on-the-job learning.  C was my first real language.

**Jim:** Now you were an electrical engineer at the time?

**Ben:** I studied electrical engineering but in my first job I kind of gravitated towards the coding and that was what they needed at the time, so I've been there ever since and have kind of dropped the electrical side of the -- yeah, so I haven't used my degree.

**Jim:** Is this embedded C or was this for mainstream applications?

**Ben:** Yeah, good question. Embedded was maybe half of my first job, where I did little bootloaders for small micros or little device drivers for tiny microcontrollers. And that makes me think of something that's come up more recently where people talk about "embedded Linux", and I'm thinking: that not embedded! You're talking about a 2 gigahertz processor with with a gigabyte of RAM! So *embedded* in the sense that I'm referring to, that I did, was 2 kilobytes of RAM on a tiny 16-bit micro or 8-bit micro. The MSP430 was one of the chips that the company used, and then after that it was getting into the ARM7, so some 32-bit stuff there after a while.

**Jim:** Now were you on a team at the time?

**Ben:** It was a very small company, and the team, such as it was, was one other very very good electrical engineer and firmware developer who was my first mentor and a really good guy -- Gary was his name -- and he was a bit of a mentor and helped me through kind of learning the real software engineering aspects of programming.

**Jim:** And you were able to get that with a two-developer team? I mean, version control and sharing source and build pipelines and all that sort of thing?

**Ben:** That came later. He taught me some of the software engineering and computer science fundamentals, or I learned some of that by exposure there. At the time he didn't really believe in version control, and so I didn't learn that. So that wasn't a thing until later -- just for the record I do believe in it now.

**Jim:** It's a good thing.

**Ben:** It's a great thing! I use [Git](https://en.wikipedia.org/wiki/Git) for everything. So version control and [CI](https://en.wikipedia.org/wiki/Continuous_integration) and all that came much later in my career. So here it was about programming fundamentals and structuring things. So I used C for some embedded work, but then it was the only real professional tool that I knew, and so I had to write a web backend for this [weather system](https://live.harvest.com/) we were working on. It would have to render the web page and draw these pretty graphs, output some GIF files, and C was the only language I knew, so I wrote those as C-based CGI scripts. Which is a terrible, terrible choice for CGI scripts and web stuff, but it did the job. And I'm sure the people after me when I left cursed me, but that solved the problem at hand for quite a number of years.

**Jim:** What were the next programming languages and techniques and things that you learned?

**Ben:** So from there I did a startup with two of my brothers. We called it [microPledge](http://micropledge.brush.co.nz/) -- and I can go into that, but I'll focus on the programming side of it -- I learned Python through that. I was interested in Python before that, I was thinking, ah, this would be really much better than C to do web applications in, and sure enough, it is. So I learned Python through doing that startup with my brothers.

One of my brothers was was a solid Python developer by that point already, and so I learned Python, I learned testing, I learned version control -- all of that was part of that startup experience. The startup itself failed, but it was a success in terms of teaching, giving me some career skills Python and software engineering-wise. So Python was the language, and I still use it to this day -- it's my main language in my job right now. So that was a really good experience way back when.

**Jim:** Now you had mentioned that you had contributed to [`os.scandir`](https://docs.python.org/3/library/os.html#os.scandir) in Python?

**Ben:** Yeah, that was several years later -- let me just look at the timeline for that. I wrote about it in 2016 but it had started several years before that -- okay, 2012. I was trying to find a way to walk a recursive directory structure, and I was on Windows at the time -- Python on Windows. And I noticed that Windows Explorer, you could right-click and get the file size of a recursive directory, it would get that really quickly, you can see it scanning but it would be really fast. And you did that in Python using [`os.walk`](https://docs.python.org/3/library/os.html#os.walk) and -- significantly slower. And I started looking into why is this? Surely Python can be as fast as whatever Windows Explorer is doing.

But it turns out, because of the design of `os.walk` and how it was implemented, it was doing a whole bunch of extra system calls -- essentially an [`os.stat`](https://docs.python.org/3/library/os.html#os.stat) call on every file in addition to `FindFirst` and `FindNext` calls that Windows has to get the file names. You don't need to do those additional `stat` calls. So Python was doing the calls and then throwing away half the information, and then doing the additional calls, and so `scandir` allows you to recurse through directories and get the information you need without throwing half of it away.

**Jim:** Now this was portable to all platforms though, yes?

**Ben:** Yes. So it uses different OS calls on Windows and Linux, but the same idea is present. Windows gives you a bit more from the `FindFirst` and `FindNext`: it gives you all the file attributes from `FindFirst` and `FindNext`. Linux doesn't give you the size and stuff, it just gives you the file type -- whether it's a directory or file. But even that on Linux still saves you an `os.stat` call to determine -- oh, is it a directory, yep, recurse in, no it's not, don't recurse. So it was significantly faster even on Windows, but Linux got a speed boost as well. And on networked file systems it's faster yet, because as you can imagine, a reduced number of network calls is even better.

**Jim:** Then did `os.walk`, was that deprecated then?

**Ben:** No. `os.walk` was re-implemented *using* `scandir`. So `scandir` is kind of the lower-level tool, and the whole idea was to speed up `os.walk`. So we were able to re-implement `os.walk`, pretty much similar structure, but rewritten using `scandir` instead of `listdir` plus `os.stat` calls. And so we didn't have to change the signature of `os.walk` at all, and people using it in their scripts just got the performance benefit without knowing about `scandir`. So that stuck in my mind as a really cool idea: that you can completely change the guts of something -- it's sort of obvious in retrospect -- but you can completely change the implementation, everyone gets the speed gains for free. And there were a lot of scripts that were using `os.walk`, so a lot of people benefited.

**Jim:** So you had mentioned that you had written some CGI programs, you had formed a startup with your brothers and were doing some web work in Python then, so I assume that you had to assimilate some other technologies to be able to build functioning websites: HTML, JavaScript, databases, that sort of thing?

**Ben:** Yes, a fair bit of that. So databases and HTML I learned -- well, I guess HTML I'd learned in the C job that I did -- but certainly [SQL](https://en.wikipedia.org/wiki/SQL) databases were new to me when I joined the startup with my brothers. And they're a bit mind-bending the first time you run into, you know, the relational model, and it's quite different a way of thinking. And so it took me a while to get the hang of that, but really powerful stuff, and have used SQL DBs ever since then. So definitely databases, some exposure to JavaScript. It was early on when JavaScript was kind of an add-on rather than the thing all of your websites were written in. Which I still don't like today how people go to JavaScript first, when they could use HTML for a lot of things.

**Jim:** You talk a bit about that in an essay that you wrote called ["the small web"](/writings/the-small-web-is-beautiful/).

**Ben:** Very much so. And that kind of hearkens back to what I mentioned before: I've always liked things that are fast and light and small. And now with the web you have pages that are bloated and big and slow, and you have people that care and have, you know, reduced the sizes of images, or reduced the amount of JavaScript that's slowing things down or whatever it is -- I love that stuff. And there's a bit of a movement with it now: the "small web" is kind of a loose term for it, the "indie web" is another term, where people are rolling their own websites and doing more by hand and caring more about getting back to the basics.

**Jim:** It's not just the web though. You have applications written in Electron that are now desktop applications built on thick web technologies, so they're bringing all the bloat to the desktop.

**Ben:** Yes, definitely. I know there's -- I can see the value of reusing all of that tech. I think it's partly a packaging problem, and I've seen some work on, okay, we're not going to pull in Electron, we're going to use the OS's native browser technology, or the browser that's already on your machine, but it's going to be a desktop app using that. And I forget what those tools are called, but that seems a better direction if you want to go that way.

**Jim:** Your technical skill set then evolved a bit more. What were the next technologies that you had learned?

**Ben:** Probably, I mean, jumping ahead a little bit, there was [Postgres](https://www.postgresql.org/) and [JSON](https://www.json.org/json-en.html) and all those sort of web technologies, but I was still using Python for most of it, for many years. But then around -- let's see, when did that happen, 2017 is what my blog says -- 2017 I learned Go, Google's [Go programming language](https://go.dev/). And I learned it for a personal project, but pretty quickly after that my next job was, they used Go extensively and so it was very useful professionally and has been ever since.

**Jim:** What was the reason you you picked up Go? There's so many different languages to learn out there -- what was it about Go?

**Ben:** I liked the look of it. I liked, you know, it's got some of these old [Bell Labs](https://en.wikipedia.org/wiki/Bell_Labs) guys behind it. And maybe I'd seen that [*The Go Programming Language*](https://www.gopl.io/) book was written by Brian Kernighan, and this guy called Alan Donovan who's still on the Go team at Google. But Brian Kernighan's name was on there, and two of the guys who created Go were Bell Labs people. The three guys who who designed Go were Ken Thompson, Rob Pike, and Robert Griesemer, so two out of three of those I believe were old [Unix](https://en.wikipedia.org/wiki/Unix) and Bell Labs folks.

That wasn't why it caught my attention originally, you know, I'd seen it around on [Hacker News](https://news.ycombinator.com/) and stuff, and I just like the design philosophy. That it was simple syntax, a kind of [Keep It Simple, Stupid](https://en.wikipedia.org/wiki/KISS_principle) attitude to language design, and yet the tooling even back then was really professional, really good. And the Go folks are quite upfront about that: there's nothing new in the language. There are a few unique concepts, but there's nothing sort of revolutionary or groundbreaking in the language. It's the tooling and the way it's all put together and the quality of the libraries that are the biggest selling point. Speed of the compiler. The fact that you can just type `go test` and it'll run all your tests automatically. You can type `go build` and cross compile just by setting an environment variable -- that kind of thing.

**Jim:** And you said you found work in Go. Did you seek out a job using Go, or was that just a happy coincidence?

**Ben:** It was a happy coincidence, but I probably chose it in part in the end because of their use of Go. And to some extent they chose me, like it was a Go-based interview, and I remember doing a Go problem, and so they they appreciated my Go skills.

**Jim:** Later you used Go to build an interpreter and translator for the [AWK](https://en.wikipedia.org/wiki/AWK) programming language. Where did you first encounter AWK?

**Ben:** Where did I first encounter AWK? I've known about the existence of AWK for a long time. It's an old tool, '70s, but I'd never really used it -- you know, partly because my history was in DOS and Windows which are not Linux and Unix. So AWK wasn't really there, but I had known about it for a while, and then I started developing on Macs, which are Unix-based and then Linux proper, and started seeing more about AWK.

But what really got me going was reading the first couple of chapters of [*The AWK Programming Language*](https://en.wikipedia.org/wiki/The_AWK_Programming_Language) by Brian Kernighan and the A.W.K. guys: Al Aho, Peter Weinberger, and Brian Kernighan, the three creators of AWK. And so they've written this book together. I think it was primarily Brian's writing -- that's my impression anyway -- and I started reading that book, and it's the same style as [*The C Programming Language*](https://en.wikipedia.org/wiki/The_C_Programming_Language), the K&R book: terse, packed-in.

So by the end of chapter 2 you know all of AWK, they've taught you all of AWK, and the rest of the chapters are going into detail and writing a little compiler in AWK, and writing a little database system in AWK -- it's pretty cool stuff, what you can do with AWK. So it expanded AWK from this arcane one-liner syntax that you see to, oh, this is actually quite a simple concept: it reads every line, it splits it into fields, and it does your action if the filter matches. So it's a simple concept, but it's a full programming language underneath. And so that just got my gears turning.

And I was doing a bunch of fiddling with parsing and programming language interpretation at the time, and I put the two together, and I thought I could write a little subset of this in Go. And so I did -- I started writing a very minimalist AWK version which just took a single filter and a single action, and I kind of started adding more and more to that until one day I realized, ah, maybe I should just make this a full POSIX implementation. And that was when I was in New York -- my wife and I and the family lived in New York for about 10 years -- and I had this hour-long bus/subway commute into work and back every day. So I was sitting on the bus for 30 or 40 minutes in the mornings and hacked away on my [GoAWK](https://github.com/benhoyt/goawk) project. So it was really written on a New Jersey Transit bus going into New York



**Jim:** What led to your inclusion on the [new version of *The AWK Programming Language*](https://awk.dev/), the second edition?

**Ben:** Yeah, that was -- I think my first correspondence with Brian Kernighan was I had seen an interview with Kernighan where he mentioned AWK and and how he was updating his -- the ["one true AWK"](https://github.com/onetrueawk/awk) as they call it -- his version of AWK to include support for [CSV (Commma-Separated Value)](https://en.wikipedia.org/wiki/Comma-separated_values) files. And that was also something I was keen to add to GoAWK. Or maybe I had added it at that point? I forget the timeline. I did add it to GoAWK, I forget the exact timeline, but I saw this interview and I thought, wow, I'm doing that stuff.

So I started looking at Brian's code, Kernighan's code, and I thought, this is great, he's doing the same thing. And then I found some performance issues, that I thought were performance issues -- I think are actually legitimate performance issues -- with how he's handling [UTF-8](https://en.wikipedia.org/wiki/UTF-8). That was the other thing he was doing: CSV and adding UTF-8 or [Unicode](https://en.wikipedia.org/wiki/Unicode) support to AWK after all these years. And just as a side note, AWK actually supports Unicode just fine if you're processing UTF-8, in the sense that UTF-8 is an 8-bit encoding of Unicode, and so as long as you're not doing character-by-character processing of Unicode characters, everything works just fine. So most AWK scripts work fine already even with older versions of AWK, but there's certain features that need sort of character-by-character processing, so that's what he was adding.

And so if you get the length of a string, with Unicode character-by-character you want the length of -- number of Unicode characters in the string rather than the number of bytes. And the performance problem was that the `strlen` function -- the `length` function in AWK -- becomes an [order-N](https://en.wikipedia.org/wiki/Time_complexity#Linear_time) operation, a linear operation in the length of the string, because it's got to count through the bytes and decode the UTF-8 to figure out how many characters are in there.

And so the `length` operation on a string changes from an order-1, super fast constant time operation to a linear time operation in the length of the string. And most of the time that's fine because strings are short, but if you're doing stuff like processing JSON files with AWK, or crazy things that you probably shouldn't do with AWK but some people do -- long strings -- then if you're doing repeated length operations it can quickly become an N-squared problem, because you were doing `length` in a loop, and suddenly you've got an N-squared, sort of accidentally N-squared issue. And so, long story short, I flagged this.

I had changed GoAWK to be sort of Unicode-aware in the same way, and I'd made that change to make `length` an order-N operation, and [somebody who was using GoAWK said](https://github.com/benhoyt/goawk/issues/93), "Aaah, this breaks my scripts because it makes my little JSON processor take 25 minutes on a medium-sized JSON file!" because of this exponential behavior. So I had reverted that change in GoAWK and said, no, this is too hard, I'm going back to bytes. And so because I'd made that mistake in GoAWK already, I then reached out to Kernighan and said, "Look, I ran into this performance issue in GoAWK, and you're probably going to kill the performance of certain types of AWK usage like processing JSON." And he acknowledged that, that that was an issue; he decided against reverting it, he said, "I want to keep this behavior, I don't think it'll affect too many scripts." He's probably right -- it's not going to affect most real-world usage, but that is a little performance trap there.

And so that's how I started talking to Kernighan about AWK stuff, and a couple of years later I guess he'd seen my name on GoAWK and appreciated the project and so when he was redoing his book, the second edition of *The AWK Programming Language*, he reached out to me via email and said, "Hey, do you want to review this book and be one of the technical reviewers?"

**Jim:** That had to be a great feeling.

**Ben:** Yeah, it was, it was really neat. And, you know, it's a bit of a proud moment to have my name in the technical reviewers for a Kernighan book.

**Jim:** Absolutely. So what's on the horizon for Ben Hoyt?

**Ben:** Well, I'm currently working at [Canonical](https://canonical.com/), and they use a lot of Go and Python. I was actually hired to Canonical through the GoAWK project as well. You know, it was just a side project for me, but someone at Canonical, fairly high up at Canonical, reached out and said, "Hey, I'm using your GoAWK project for some little side thing I'm doing at Canonical. It's pretty cool. By the way, are you looking for work?"

And at the time I *was* kind of looking, keeping an eye out for work, so that's how I got to work at Canonical. You know, I haven't used GoAWK professionally, it's not being used here at Canonical in a real way, but it got me the job. So that's what I do now: I work at Canonical on cloud and networking and infrastructure stuff, primarily in Python at the moment, but they use Go extensively, so some of the projects I work on are Go as well. So I use both my main languages.

**Jim:** Any interest in [Rust](https://www.rust-lang.org/) or [Zig](https://ziglang.org/), or any of those languages that are sort of gaining popularity?

**Ben:** I have kept my eye on Rust, and I like the promise -- I like the promise but I hate the syntax. You know, the promise of safety kind of by definition, or safety by the type system, and how it keeps track of ownership and things like that. But I haven't learned it, so I'm not going to comment. It seems to have a really steep learning curve, and people acknowledge that who've learned Rust, like it's got a really steep learning curve and a fair bit of syntax and so it probably -- it doesn't attract me all that much, but kudos to people who are starting to use it.

Zig, however, somehow that really fits my mental model well, from what I've seen of it. So I'm quite attracted to Zig. From what I've seen, Zig is a better C, and Rust is kind of a better C++, is loosely how I think about it. And so I like Zig, I like what I've seen of Zig -- haven't used it yet -- but the explicitness and how memory allocations are all made explicit. It uses some features from Go, that they've kind of pulled from Go as well. I like the looks of Zig and want to go there, I'd like to learn it.

**Jim:** Any other worlds to conquer?

**Ben:** Let's see -- I have a little side project, which is a website called [GiftyWeddings.com](https://giftyweddings.com/), and it's a wedding registry website, just a fun little side project that I've been running for a while. That is partly -- it gets me a few dollars a month, you know, it's pocket change in terms of how much money it earns -- but I mainly use it as a test bed for trying new languages and tools. So every so often I'll rewrite the backend or rewrite the frontend and try a new tool. So that's been a neat -- that's how I learned Go, that was my side project for which I learned Go.

I've been looking at [htmx](https://htmx.org/), if you've heard of that library or toolkit? It seems to be gaining a fair bit of popularity, and I kind of like how it works -- you know, keep your existing backend tools and keep HTML and sort of extend it, rather than "let's replace it with all this JavaScript". Now it still uses JavaScript, but it's kind of a very different model that -- yeah, I like the looks of htmx. So I want to try that, I might try it on my Gifty Weddings project.

**Jim:** Very good. Well Ben, thank you for your time tonight. It was great talking with you.
