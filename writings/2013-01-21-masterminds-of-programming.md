---
layout: default
title: "Masterminds of Programming"
permalink: /writings/masterminds-of-programming/
description: "Masterminds of Programming"
canonical_url: https://blog.brush.co.nz/2013/01/masterminds-of-programming/
---
<h1>Masterminds of Programming</h1>
<p class="subtitle">January 2013</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2013/01/masterminds-of-programming/)


<p><a href="http://www.amazon.com/Masterminds-Programming-Conversations-Creators-Languages/dp/0596515170"><img style="width:auto" alt="Masterminds of Programming book cover" class="right" height="300" src="/images/brushblog/Masterminds-of-Programming-book-cover-228x300.png" width="228"/></a></p>

<p>My wife gave me a real geek book for Christmas: <a href="http://www.amazon.com/Masterminds-Programming-Conversations-Creators-Languages/dp/0596515170"><em>Masterminds of Programming</em></a> by two guys named Federico Biancuzzi and Shane Warden. In it they interview the creators of 17 well-known or historically important programming languages.</p>

<h3>Overview</h3>

<p>The book was a very good read, partly because not all the questions were about the languages themselves. The interviewers seemed very knowledgeable, and were able to spring-board from discussing the details of a language to talking about other software concepts that were important to its creator. Like software engineering practices, computer science education, software bloat, debugging, etc.
The languages that everyone’s heard of and used are of course in there: C++, Java, C#, Python, Objective-C, Perl, and BASIC. There are a few missing — for example, the Japanese creator of Ruby <a href="http://broadcast.oreilly.com/2009/09/chapter-by-chapter-coverage-of.html#comment-2367331">didn’t feel comfortable being interviewed in English</a>, and the publishers considered translation too expensive.</p>

<p>But what I really liked were interviews about some of the domain-specific languages, such as SQL, AWK, and PostScript. As well as some of the languages that were further off the beaten track, like APL, Haskell, ML, Eiffel, Lua, and Forth. The one thing I didn’t go for was the 60 pages with the UML folks. That could have been cut, or at least condensed — half of it (somewhat ironically) was them talking about how UML had gotten too big.</p>

<p>If you’re a programmer, definitely go and <a href="http://www.amazon.com/Masterminds-Programming-Conversations-Creators-Languages/dp/0596515170">buy the book</a> (the authors paid me 0x0000 to say that). But in the meantime, below are a few more specific notes and quotes from the individual interviews.</p>

<p><b>This review got rather long.</b> From here on, it’s less of a real review, and more my “quotes and notes” on the individual chapters. I hope you’ll find it interesting, but for best results, click to go to the languages you’re interested in: <a href="#cpp">C++</a>, <a href="#python">Python</a>, <a href="#apl">APL</a>, <a href="#forth">Forth</a>, <a href="#basic">BASIC</a>, <a href="#awk">AWK</a>, <a href="#lua">Lua</a>, <a href="#haskell">Haskell</a>, <a href="#ml">ML</a>, <a href="#sql">SQL</a>, <a href="#objectivec">Objective-C</a>, <a href="#java">Java</a>, <a href="#csharp">C#</a>, <a href="#uml">UML</a>, <a href="#perl">Perl</a>, <a href="#postscript">PostScript</a>, <a href="#eiffel">Eiffel</a>.</p>

<h3 id="cpp">C++, Bjarne Stroustrup</h3>

<p><a href="http://en.wikipedia.org/wiki/C%2B%2B">C++</a> might be one of the least exciting languages on the planet, but the interview wasn’t too bad.</p>

<p>I knew <a href="/writings/raii-acdc/">RAII</a> was big in C++, and Stroustrup plugged it two or three times in this fairly short interview. Another thing I found interesting was his comment that “C++ is not and was never meant to be just an object-oriented programming language … the idea was and is to support multiple programming styles”. Stroustrup’s very big on generic programming with templates, and he badgered Java and C# for adding generics so late in their respective games.</p>

<p>He does note that “the successes at community building around C++ have been too few and too limited, given the size of the community … why hasn’t there been a central repository for C++ libraries since 1986 or so?” A very good thought for budding language designers today. A PyPI or a CPAN for C++ <em>would have been</em> a very good idea.</p>

<p>As usual, though, he sees C++ a little too much as the solution for everything (for example, “I have never seen a program that could be written better in C than in C++”). I think in the long run this works against him.</p>

<h3 id="python">Python, Guido van Rossum</h3>

<p>One thing <a href="http://en.wikipedia.org/wiki/Python_(programming_language)">Python’s</a> creator talks about is how folks are always asking to add new features to the languages, but to avoid it becoming a huge hodge-podge, you’ve got to do an awful lot of pushing back. “Telling people you can already do that and here is how is a first line of defense,” he says, going on to describe stages two, three, and four before he considers a feature worth including into the core. In fact, this is something that came up many times in the book. To keep things sane and simple, you’ve got to stick to your vision, and say no a lot.</p>

<p>Relatedly, Guido notes, “If a user [rather than a Python developer] proposes a new feature, it is rarely a success, since without a thorough understanding of the implementation (and of language design and implementation in general) it is nearly impossible to properly propose a new feature. We like to ask users to explain their problems without having a specific solution in mind, and then the developers will propose solutions and discuss the merits of different alternatives with the users.”</p>

<p>After just reading Stroustrup’s fairly involved approach to testing, Guido’s approach seemed almost primitive — though much more in line with Python’s philosophy, I think: “When writing your basic pure algorithmic code, unit tests are usually great, but when writing code that is highly interactive or interfaces to legacy APIs, I often end up doing a lot of manual testing, assisted by command-line history in the shell or page-reload in the browser.” I know the feeling — when developing a web app, you usually don’t have the luxury of building full-fledged testing systems.</p>

<p>One piece of great advice is that early on when you only have a few users, fix things drastically as soon as you notice a problem. He relates an anecdote about <a href="http://en.wikipedia.org/wiki/Make_(software)">Make</a>: “Stuart Feldman, the original author of “Make” in Unix v7, was asked to change the dependence of the Makefile syntax on hard tab characters. His response was something along the lines that he agreed tab was a problem, but that it was too late to fix since there were already a dozen or so users.”</p>

<h3 id="apl">APL, Adin Falkoff</h3>

<p><a href="http://en.wikipedia.org/wiki/APL_(programming_language)">APL</a> is almost certainly the strangest-looking real language you’ll come across. It uses lots of mathematical symbols instead of ASCII-based keywords, partly for conciseness, partly to make it more in line with maths usage. For example, here’s a one-liner implementation of the <a href="http://catpad.net/michael/apl/">Game of Life in APL</a>:</p>

<p><img style="width:auto" alt="Conway's Game of Life in APL" src="http://catpad.net/michael/APLLife.gif"/></p>

<p>Yes, Falkoff admits, it takes a while to get the hang of the notation. The weird thing is, this is in 1964, years before Unicode, and originally you had to program APL using a <a href="http://en.wikipedia.org/wiki/File:APL-keybd2.svg">special keyboard</a>.</p>

<p>Anyway, despite that, it’s a very interesting language in that it’s array-oriented. So when parallel computing and <a href="http://en.wikipedia.org/wiki/SIMD">Single Instruction, Multiple Data</a> came along, APL folks updated their compilers, and all existing APL programs were magically faster without any tweaking. Try that with C’s semantics.</p>

<h3 id="forth">Forth, Chuck Moore</h3>

<p><a href="http://en.wikipedia.org/wiki/Forth_(programming_language)">Forth</a> is a small and very nifty language that holds a <a href="https://github.com/benhoyt/third#readme">special place in my heart</a>. :-) It’s quirky and minimalistic, though, and so is it’s creator.</p>

<p>He’s an extremist, but also sometimes half right. For example, “Operating systems are dauntingly complex and totally unnecessary. It’s a brilliant thing Bill Gates has done in selling the world on the notion of operating systems. It’s probably the greatest con the world has ever seen.” And further on, “Compilers are probably the worst code ever written. They are written by someone who has never written a compiler before and will never do so again.”</p>

<p>Despite the extremism in the quotes above, there’s a lot folks could learn from Forth’s KISS approach, and a lot of good insight Moore has to share.</p>

<h3 id="basic">BASIC, Tom Kurtz</h3>

<p>I felt the <a href="http://en.wikipedia.org/wiki/BASIC">BASIC</a> interview wasn’t the greatest. Sometimes it seemed Kurtz didn’t really know what he was talking about, for instance this paragraph, “I found Visual Basic relatively easy to use. I doubt that anyone outside of Microsoft would define VB as an object-oriented language. As a matter of fact, True BASIC is just as much object-oriented as VB, perhaps more so. True BASIC included modules, which are collections of subroutines and data; they provide the single most important feature of OOP, namely data encapsulation.” Modules are great, but OO? What about instantiation?</p>

<p>Some of his anecdotes about the constraints implementing the original <a href="http://en.wikipedia.org/wiki/Dartmouth_BASIC">Dartmouth BASIC</a> were interesting, though: “The language was deliberately made simple for the first go-round so that a single-pass parsing was possible. It other words, variable names are very limited. A letter or a letter followed by a digit, and array names, one- and two-dimensional arrays were always single letters followed by a left parenthesis. The parsing was trivial. There was no table lookup and furthermore, what we did was to adopt a simple strategy that a single letter followed by a digit, gives you what, 26 times 11 variable names. We preallocated space, fixed space for the locations for the values of those variables, if and when they had values.”</p>

<h3 id="awk">AWK, Al Aho, Brian Kernighan, and Peter Weinberger</h3>

<p>I guess <a href="http://en.wikipedia.org/wiki/AWK">AWK</a> was popular a little before my (scripting) time, but it’s definitely a language with a neat little philosophy: make text processing simple and concise. The three creators are honest about some of the design trade-offs they made early on that might not have been the best. For example, there was tension between keeping AWK a text processing language, and adding more and more general-purpose programming features.</p>

<p>Apparently Aho didn’t write the most readable code, saying, “Brian Kernighan once took a look at the pattern-matching module that I had written and his only addition to that module was putting a comment in ancient Italian: ‘abandon all hope, ye who enter here’. As a consequence … I was the one that always had to make the bug fixes to that module.”</p>

<p>Another interesting Aho quote, this time about hardware: “Software does become more useful as hardware improves, but it also becomes more complex — I don’t know which side is winning.”</p>

<p>This Kernighan comment on bloated software designs echoes what Chuck Moore said about OSs: “Modern operating systems certainly have this problem; it seems to take longer and longer for my machines to boot, even though, thanks to Moore’s Law, they are noticeably faster than the previous ones. All that software is slowing me down.”</p>

<p>I agree with Weinberger that text files are underrated: “Text files are a big win. It requires no special tools to look at them, and all those Unix commands are there to help. If that’s not enough, it’s easy to transform them and load them into some other program. They are a universal type of input to all sorts of software. Further, they are independent of CPU byte order.”</p>

<p>There’s a lot more these three say about computer science education (being educators themselves), programming vs mathematics, and the like. But you’ll have to read the book.</p>

<h3 id="lua">Lua, Roberto Ierosalimschy and Luiz Henrique de Figueiredo</h3>

<p><a href="http://www.lua.org/about.html">Lua</a> fascinates me: a modern, garbage-collected and dynamically typed scripting languages that fits in about 200KB. Not to mention the minimalist design, with “tables” being Lua’s only container data type. Oh, and the interview was very good too. :-)</p>

<p>As an embedded programmer,  I was fascinated by a comment of Roberto’s — he mentions Lua’s use of C doubles as the single numeric type in Lua, but “even using double is not a reasonable choice for embedded systems, so we can compiler the interpreter with an alternative numerical type, such as long.”</p>

<p>Speaking of concurrency, he notes that in the <a href="http://www.lua.org/doc/hopl.pdf">HOPL paper about the evolution of Lua</a> they wrote, “We still think that no one can write correct programs in a language where <code>a=a+1</code> is not deterministic.” I’ve been bitten by multi-threading woes several times, and that’s a great way to put!</p>

<p>They note they “made many small [mistakes] along the way.” But in contrast to Make’s hard tab issue, “we had the chance to correct them as Lua evolved. Of course this annoyed some users, because of the incompatibilities between versions, but now Lua is quite stable.”</p>

<p>Roberto also had a fairly extreme, but very thought provoking quote on comments: “I usually consider that if something needs comments, it is not well written. For me, a comment is almost a note like ‘I should try to rewrite this code later.’ I think clear code is much more readable than commented code.”</p>

<p>I really like these guys’ “keep it as simple as possible, but no simpler” philosophy. Most languages (C++, Java, C#, Python) just keep on adding features and features. But to Lua they’ve now “added if not all, most of the features we wanted.” Reminds me of Knuth’s TeX only allowing bugfixes now, and its version number converging to pi — there’s a point at which the feature set just needs to be frozen.</p>

<h3 id="haskell">Haskell, Simon Peyton Jones, John Hughes, and Paul Hudak</h3>

<p>I’ve heard a lot about <a href="http://en.wikipedia.org/wiki/Haskell_(programming_language)">Haskell</a>, of course, but mainly I’ve thought, “this is trendy, it must be a waste of time.” And maybe there’s truth to that, but this interview really made me want to learn it. John’s comments about file I/O made me wonder how one does I/O in a purely functional language…</p>

<p>It’s a fascinating language, and if Wikipedia is anything to go by, it’s influenced a boatload of other languages and language features. List comprehensions (and their lazy equivalent, generator expressions), which are one of my favourite features of Python, were not exactly invented by Haskell, but were certainly popularized by it.</p>

<p>There’s a lot more in this interview (on formalism in language specification, education, etc), but again, I’m afraid you’ll have to read the book.</p>

<h3 id="ml">ML, Robin Milner</h3>

<p>Sorry <a href="http://en.wikipedia.org/wiki/ML_(programming_language)">ML</a>, I know you came first in history, but Haskell came before you in this book, so you were much less interesting. Seriously though, although ML looks like an interesting language, this chapter didn’t grab me too much. There was a lot of discussion on formalism, models, and theoretical stuff (which aren’t really my cup of tea).</p>

<p>What was interesting (and maybe this is why all the formalism) is that ML was designed “for theorem proving. It turned out that theorem proving was such a demanding sort of task that [ML] became a general-purpose language.”</p>

<h3 id="sql">SQL, Don Chamberlin</h3>

<p>One often forgets how old <a href="http://en.wikipedia.org/wiki/SQL">SQL</a> is: almost 40 years now. But still incredibly useful, and — despite the NoSQL people — used by most large-scale websites as well as much desktop and enterprise software. So the interview’s discussion of the history of SQL was a good read.</p>

<p>One of the interesting things was they wanted SQL to be used by users, not just developers. “Computer, query this and that table for X, Y, and Z please.” That didn’t quite work out, of course, and SQL is really only used by developers (and with ORMs and suchlike, much of that is not hand-coded). But it was a laudable goal.</p>

<p>The other interesting point was the reasons they wanted SQL to be declarative, rather than procedural. One of the main reasons was optimizability: “If the user tells the system in detailed steps what algorithm to use to process a query, the the optimizer has no flexibility to make changes, like choosing an alternative access path or choosing a better join order. A declarative language is much more optimizer-friendly than a lower-level procedural language.” Many of the other database query languages of the day were more procedural, and nobody’s heard of them today.</p>

<h3 id="objectivec">Objective-C, Tom Love and Brad Cox</h3>

<p>When I started writing <a href="https://itunes.apple.com/us/app/oyster.com-hotel-reviews-photos/id499564162">Oyster.com’s iPad app</a>, I of course had to learn <a href="http://en.wikipedia.org/wiki/Objective-C">Objective-C</a>. At first (like most developers) I was put off by [all [the [square brackets]]] and the longNamesThatTryToDocumentThemselves. But after you get into it, you realize that’s just syntax and style, and the core of Objective-C is actually quite elegant — adding <a href="http://en.wikipedia.org/wiki/Smalltalk">Smalltalk</a>-style OO to C in a low-impact way.</p>

<p>It’s been popularized by Apple for Mac and iOS development, of course, and also been expanded heavily by them, but it really hasn’t strayed from its roots. As Tom Love said, it’s “still Objective-C through and through. It stays alive.”</p>

<p>Tom gives some reasoning behind the ugly syntax: “The square brackets are an indication of a message sent in Objective-C. The original idea was that once you built up a set of libraries of classes, then you’re going to spend most of your time actually operating inside the square brackets … It was a deliberate decision to design a language that essentially had two levels — once you had built up enough capability, you could operate at the higher level … Had we chosen a very C-like syntax, I’m not sure anybody would know the name of the language anymore and it wouldn’t likely still be in use anywhere.”</p>

<p>Tom Love has gone on to be involved with some huge systems and codebases (millions of lines of code), and shares some experience and war stories about those. One of the more off-the-wall ideas he mentions to help would-be project managers get experience is to have a “project simulator” (like a flight simulator): “There is a problem of being able to live long enough to do 100 projects, but if you could simulate some of the decisions and experiences so that you could build your resume based on simulated projects as contrasted to real projects, that would also be another way to solve the problem.”</p>

<p>When asked, “Why emulate Smalltalk?”, Brad Cox says that “it hit me as an epiphany over all of 15 minutes. Like a load of bricks. What had annoyed me so much about trying to build large projects in C was no encapsulation anywhere…”</p>

<p>Comparing Objective-C to C++, he pulls out an integrated circuit metaphor, “Bjarne [C++] was targeting an ambitious language: a complex software fabrication line with an emphasis on gate-level fabrication. I was targeting something much simpler: a software soldering iron capable of assembling software ICs fabricated in plain C.”</p>

<p>One extreme idea (to me) that Brad mentions is in his discussion of why Objective-C forbids multiple inheritance. “The historical reason is that Objective-C was a direct descendant of Smalltalk, which doesn’t support inheritance, either. If I revisited that decision today, I might even go so far as to remove single inheritance as well. Inheritance just isn’t all that important. Encapsulation is OOP’s lasting contribution.”</p>

<p>Unfortunately for me, the rest of the interview was fairly boring, as Brad is interested in all the things I’m not — putting together large business systems with <a href="http://en.wikipedia.org/wiki/Service-oriented_architecture">SOA</a>, <a href="http://en.wikipedia.org/wiki/Java_Business_Integration">JBI</a>, <a href="http://en.wikipedia.org/wiki/Service_Component_Architecture">SCA</a>, and other <a href="http://en.wikipedia.org/wiki/Three-letter_acronym">TLAs</a>. I’m sure there are real problems those things are trying to solve, but the higher and higher levels of abstraction just put me to sleep.</p>

<h3 id="java">Java, James Gosling</h3>

<p>Like the C++ interview, the <a href="http://en.wikipedia.org/wiki/Java_(programming_language)">Java</a> interview was a lot more interesting than the language is.</p>

<p>I know that in theory JIT compilers can do a better job than more static compilers: “When <a href="http://en.wikipedia.org/wiki/HotSpot">HotSpot</a> runs, it knows exactly what chipset you’re running on. It knows exactly how the cache works. It knows exactly how the memory hierarchy works. It knows exactly how all the pipeline interlocks work in the CPU … It optimizes for precisely what machine you’re running on. Then the other half of it is that it actually sees the application as it’s running. It’s able to have statistics that know which things are important. It’s able to inline things that a C compiler could never do.” Those are cool concepts, but I was left wondering: how well do they actually work in practice? For what cases does well-written Java actually run faster than well-written C? (One might choose Java for many other reasons than performance, of course.)</p>

<p>James obviously has a few hard feelings towards C#: “C# basically took everything, although they oddly decided to take away the security and reliability stuff by adding all these sort of unsafe pointers, which strikes me as grotesquely stupid.”</p>

<p>And, interestingly, he has almost opposite views on documentation to Roberto Ierosalimschy from Lua: “The more, the better.” That’s a bit of a stretch — small is beautiful, and there’s a reason people like the conciseness of <a href="http://en.wikipedia.org/wiki/The_C_Programming_Language">K&amp;R</a>.</p>

<h3 id="csharp">C#, Anders Hejlsberg</h3>

<p>Gosling may be right that <a href="http://en.wikipedia.org/wiki/C_Sharp_(programming_language)">C#</a> is very similar to (and something of a copy of) Java, but it’s also a much cleaner language in many ways. Different enough to be a separate language? I don’t know, but now C# and Java have diverged enough to consider them quite separately. Besides, all languages are influenced by existing languages to a lesser or greater extent, so why fuss?</p>

<p>In any case, Anders was the guy behind the <a href="http://en.wikipedia.org/wiki/Turbo_Pascal">Turbo Pascal</a> compiler, which was a really fast IDE and compiler back in the 1980’s. That alone makes him worth listening to, in my opinion.</p>

<p>What he said about the design of <a href="http://en.wikipedia.org/wiki/Language_Integrated_Query">LINQ</a> with regard to C# language features was thought-provoking: “If you break down the work we did with LINQ, it’s actually about six or seven language features like extension methods and lambdas and type inference and so forth. You can then put them together and create a new kind of API. In particular, you can create these query engines implemented as APIs if you will, but the language features themselves are quite useful for all sorts of other things. People are using extension methods for all sorts of other interesting stuff. Local variable type inference is a very nice feature to have, and so forth.”</p>

<p>Surprisingly (with Visual Studio at his fingertips), Anders’ approach to debugging was surprisingly similar to Guido van Rossum’s: “My primary debugging tool is Console.Writeline. To be honest I think that’s true of a lot of programmers. For the more complicated cases, I’ll use a debugger … But quite often you can quickly get to the bottom of it just with some simple little probes.”</p>

<h3 id="uml">UML, Ivar Jacobson, Grady Booch, and James Rumbaugh</h3>

<p>As I mentioned, the <a href="http://en.wikipedia.org/wiki/Unified_Modeling_Language">UML</a> interview was too big, but a good portion of it was the creators talking about how UML itself had grown too big. Not just one or two of them — all three of them said this. :-)</p>

<p>I’m still not quite sure what exactly UML is: a visual programming language, a specified way of diagramming different aspects of a system, or something else? This book is about programming languages, after all — so how do you write a “Hello, World” program in UML? Ah, <a href="http://www.seasar.org/en/tutorial/uml/helloworld/index.html">like this</a>, that makes me very enthusiastic…</p>

<p>Seriously, though, I think their critique of UML as something that had been taken over by design-by-committee made a lot of sense. A couple of them referred to something they called “Essential UML”, which is the 20% of UML that’s actually useful for developers.</p>

<p>Ivar notes how trendy buzzwords can make old ideas seem revolutionary: “The ‘agile’ movement has reminded us that people matter first and foremost when developing software. This is not really new … in bringing these things back to focus, much is lost or obscured by new terms for old things, creating the illusion of something completely new.” In the same vein, he says that “the software industry is the most fashion-conscious industry I know of”. Too true.</p>

<p>Grady Booch gave some good advice about <em>reading</em> code: “A question I often ask academics is, ‘How many of you have reading courses in software?’ I’ve had two people that have said yes. If you’re an English Lit major, you read the works of the masters. If you want to be an architect in the civil space, then you look at Vitruvius and Frank Lloyd Wright … We don’t do this in software. We don’t look at the works of the masters.” This actually made me go looking at the <a href="http://www.lua.org/source/5.2/">Lua source code</a>, which is very tidy and wonderfully cross-referenced — really a good project to learn from.</p>

<h3 id="perl">Perl, Larry Wall</h3>

<p>I’ve never liked the look of <a href="http://en.wikipedia.org/wiki/Perl">Perl</a>, but Wall’s approach to language design is as fascinating as he is. He originally studied linguistics in order to be a missionary with <a href="http://www.wycliffe.org/">Wycliffe Bible Translators</a> and translate the Bible into unwritten languages, but for health reasons had to pull out of that. Instead, he used his linguistics background to shape his programming language. Some of the “fundamental principles of human language” that have “had a profound influence on the design of Perl over the years” are:</p>

<ul>
<li>Expressiveness is more important than learnability.</li>
<li>A language can be useful even before you have learned the whole language.</li>
<li>There are often several good ways to say roughly the same thing.</li>
<li>Shortcuts abound; common expressions should be shorter than uncommon expressions.</li>
<li>Languages make use of pronouns when the topic of conversation is apparent.</li>
<li>Healthy culture is more important than specific technology to a language’s success.</li>
<li>It’s OK to speak with an accent as long as you can make yourself understood.</li>
</ul>

<p>There are many others he lists, but those are some that piqued my interest. Larry’s a big fan of the human element in computer languages, noting that “many language designers tend to assume that computer programming is an activity more akin to an axiomatic mathematical proof than to a best-effort attempt at cross-cultural communication.”</p>

<p>He discusses at length some of the warts in previous versions of Perl, that they’re trying to remedy with Perl version 6. One of the interesting ones was the (not so) regular expression syntax: “When Unix culture first invented their regular-expression syntax, there were just a very few metacharacters, so they were easy to remember. As people added more and more features to their pattern matches, they either used up more ASCII symbols as metacharacters, or they used longer sequences that had previously been illegal, in order to preserve backward compatibility. Not surprisingly, the result was a mess … In Perl 6, as we were refactoring the syntax of pattern matching we realized that the majority of the ASCII symbols were already metacharacters anyway, so we reserved all of the nonalphanumerics as metacharacters to simplify the cognitive load on the programmer. There’s no longer a list of metacharacters, and the syntax is much, much cleaner.”</p>

<p>Larry’s not a pushy fellow. His subtle humour and humility are evident throughout the interview. For example, “It has been a rare privelege in the Perl space to actually have a successful experiment called Perl 5 that would allow us try a different experiment that is called Perl 6.” And on management, “I figured out in the early stage of Perl 5 that I needed to learn to delegate. The big problem with that, alas, is that I haven’t a management bone in my body. I don’t know how to delegate, so I even delegated the delegating, which seems to have worked out quite well.”</p>

<h3 id="postscript">PostScript, Charles Geschke and John Warnock</h3>

<p>My experience with Forth makes me very interested in <a href="http://en.wikipedia.org/wiki/PostScript">PostScript</a>, even though it’s a domain-specific printer control language, and wasn’t directly inspired by Forth. It’s stack-based and <a href="http://en.wikipedia.org/wiki/Reverse_Polish_notation">RPN</a>, like Forth, but it’s also dynamically typed, has more powerful built-in data structures than Forth, and is garbage collected.</p>

<p>One thing I wasn’t fully aware of is how closely related PostScript is to <a href="http://en.wikipedia.org/wiki/Portable_Document_Format">PDF</a>. PDF is basically a “static data structure” version of PostScript — all the Turing-complete stuff like control flow and logic is removed, but the fonts, layout and measurements are done exactly the same way as PostScript.</p>

<p>Some of the constraints they relate about implementing PostScript back in the early days are fascinating. The original LaserWriter had the “largest amount of software ever codified in a ROM” — half a megabyte. “Basically we put in the mechanism to allow us to patch around bugs, because if you had tens of thousands or hundreds of thousands of printers out there, you couldn’t afford to send out a new set of ROMs every month.” One of the methods they used for the patching was PostScript’s late binding, and its ability to redefine any operators, even things like the “add” instruction.</p>

<p>John Warnock mentions that “the little-known fact that Adobe has never communicated to anybody is that every one of our applications has fundamental interfaces into JavaScript. You can script InDesign. You can script Photoshop. You can script Illustrator with JavaScript. I write JavaScript programs to drive Photoshop all the time. As I say, it’s a very little-known fact, but the scripting interfaces are very complete. They give you real access, in the case of InDesign, into the object model if anybody ever wants to go there.” I wonder why they don’t advertise this scriptability more, or is he kind of being humble here?</p>

<p>I didn’t realize till half way through that the interviewees (creators of PostScript) were the co-founders of Adobe and are still the co-chairmen of the company. The fact that their ability extends both to technical and business … well, I guess there are quite a few software company CEOs that started as programmers, but I admire that.</p>

<p>Weird trivia: In May 1992, Charles Geschke was approached by two men who kidnapped him at gunpoint. The long (and fascinating) story was told five years later when the Geschkes were ready to talk about it. Read it in four parts here: <a href="http://www.losaltosonline.com/index.php?option=com_content&amp;task=view&amp;id=18583&amp;Itemid=46">part one</a>, <a href="http://www.losaltosonline.com/index.php?option=com_content&amp;task=view&amp;id=18584&amp;Itemid=46">part two</a>, <a href="http://www.losaltosonline.com/index.php?option=com_content&amp;task=view&amp;id=18582&amp;Itemid=46">part three</a>, and <a href="http://www.losaltosonline.com/index.php?option=com_content&amp;task=view&amp;id=18585&amp;Itemid=46">part four</a>.</p>

<h3 id="eiffel">Eiffel, Bertrand Meyer</h3>

<p><a href="http://en.wikipedia.org/wiki/Eiffel_(programming_language)">Eiffel</a>, you’re last and not least. Eiffel is <em>quite</em> different from Java or C#, though it influenced features in those languages. It incorporates several features that most developers (read: I) hadn’t heard of.</p>

<p><a href="http://en.wikipedia.org/wiki/Design_by_contract">Design by Contract™</a>, which Microsoft calls <a href="http://research.microsoft.com/en-us/projects/contracts/">Code Contracts</a>, is a big part of Eiffel. I’m sure I’m oversimplifying, but to me they look like a cross between regular asserts and unit tests, but included at the language level (with all the benefits that brings). Bertrand Meyer can’t understand how people can live without it: “I just do not see how anyone can write two lines of code without this. Asking why one uses Design by Contract is like asking people to justify Arabic numerals. It’s those using Roman numerals for multiplication who should justify themselves.”</p>

<p>He does have a few other slightly extreme ideas, though. Here’s his thoughts on C: “C is a reasonably good language for compilers to generate, but the idea that human beings should program in it is completely absurd.” Hmmm … I suspect I’d have a hard time using Eiffel on an <a href="http://www.ti.com/product/msp430f110">MSP430 micro</a> with 128 bytes of RAM.</p>

<p>It appears that Eiffel has a whole ecosystem, <a href="http://www.eiffel.com/products/studio/screenshots.html">a neat-looking IDE</a>, <a href="http://en.wikipedia.org/wiki/Eiffel_Software">company</a>, and way of life built around it. One of the few languages I know of that’s also a successful company in its own right. It’d be like if <a href="http://www.activestate.com/activepython">ActiveState</a> was called “PythonSoft” and run by Guido van Rossum.</p>

<h3>The end</h3>

<p>That’s all folks. I know this falls in the category of “sorry about the long letter, I didn’t have time to write a short one”. If you’ve gotten this far, congratulations! Please send me an email and I’ll let you join my fan club as member 001.</p>

<p>Seriously though, if you have any comments, <b>the box is right there below.</b></p>



<h2>Comments</h2>

<h3>Narsimham Chelluri <span style="padding-left: 1em; color: #bbb;">21 Jan 2013, 17:57</span></h3>

<p>Great article. I like the way you handled the various topics, and it was helpful that I see things similarly to you (e.g., ” There was a lot of discussion on formalism, models, and theoretical stuff (which aren’t really my cup of tea).”). I like building stuff and think of coding as craftsmanship.</p>

<p>I’m thinking of picking up the book.</p>

<h3>Joao <span style="padding-left: 1em; color: #bbb;">21 Jan 2013, 21:03</span></h3>

<p>Hey. I also enjoyed the write-up. So many personalities, old heroes. Too bad Matz didn’t make the list, though. Being a user of Ruby, for a long time I thought Guido was too arrogant, but I recently watched a video of Guido on Youtube that made me to sympathize more with him.</p>

<p>I’m quite fond of RegEx as I learned it in Ruby. Thanks to Larry Wall for helping to make it popular.</p>

<p>PDF/PostScript also fascinated me at some point. I even wrote a little library for generating some PDF but it didn’t make it. It’s good to learn about them some more.</p>

<p>Cheers. Keep it up.</p>

<h3>Pat <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 03:03</span></h3>

<p>I’m with Anders console.writeline or similar usually does it for me.</p>

<h3>MrSax <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 03:36</span></h3>

<p>Anders was also the brain behind Borland’s Delphi.  Microsoft hired him to write C# – which is very similar to Delphi.  I continue use a 12 year old copy of Delphi to write Windows apps.  What can I say, it works.</p>

<h3>Mahakali <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 04:24</span></h3>

<p>I think that by definition, something that predates something else cannot be referred to as a clone. Eiffel is older than C# and Java.</p>

<h3>VViking <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 04:49</span></h3>

<p>Sub ‘Lua’: “As an embedded programmer, one comment…”</p>

<p>I don’t understand. How can a comment be an embedded programmer? Or did you mean “As an embedded programmer, I was fascinated…” ?</p>

<p>Sorry, but on Reflection it threw an AmbiguousMatchException.</p>

<h3>Dan Sutton <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 05:52</span></h3>

<p>What happened to Dijkstra – Algol 60? If it wasn’t for Dijkstra, none of the others would’ve had jobs – he was the giant on whose shoulders they all sat!!</p>

<h3>Salvador Retamoza <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 06:14</span></h3>

<blockquote>
<p>What happened to Dijkstra – Algol 60? … – Dan Sutton
  I guess interviewing death people is not in the author’s skill set ;)</p>
</blockquote>

<h3>David Fredericks <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 06:23</span></h3>

<p>Very well done review.  Thanks.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">23 Jan 2013, 08:59</span></h3>

<p>Thanks for the comments, guys.</p>

<p>@Mahakali: you’re dead right, thanks. I’ve updated the wording slightly.</p>

<p>@VViking: ha, very nice. I called Reflection.FixAmbiguity(use<em>commentor</em>suggestion=true).</p>

<p>@Dan: yep, unfortunately Dijkstra died in 2002.</p>

<h3>Matthias <span style="padding-left: 1em; color: #bbb;">25 Jan 2013, 06:46</span></h3>

<p>I did not read all parts of it, but I like your article very much! Very good written (of course I’m german and can say lot about this, but I understood everything – so it’s fine)!</p>

