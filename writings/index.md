---
layout: default
title: Stuff I’ve Written
permalink: /writings/
---
# {{ page.title }}

Below are some of the more interesting bits and pieces I’ve written. They’re separated into programming-related [technical writing](#technical-writing) and [non-technical articles](#non-technical-articles).

I’ve also written [tech blog articles](#tech-blog-articles) for several of the companies I’ve worked for.


## Technical writing

* [GoAWK](/writings/goawk/) is an AWK interpreter written in Go, and this article describes how I wrote it, tested it, and measured and improved its performance. (Nov&nbsp;2018)
* [LoxLox](/writings/loxlox/) is an interpreter for *Crafting Interpreters'* Lox programming language written in Lox! (Oct&nbsp;2018)
* [Littlelang](/writings/littlelang/) is a dynamically-typed programming language I designed and wrote an interpreter for in Go (and in littlelang itself!). (Dec&nbsp;2017)
* [Learning Go](/writings/learning-go/) describes how I learnt the basics of Go (its good parts as well as a few quirks) by porting a medium-sized web backend from Python. (Nov&nbsp;2017)
* [Pentomino puzzle solver](/writings/python-pentomino/) uses Python code generation to find all 2339 tilings of the 12 free pentominoes on a 6x10 board. Based on my dad&rsquo;s Forth version. (Jul&nbsp;2017)
* [pyast64](/writings/pyast64/) is a toy (but working) compiler that turns Python syntax into x86-64 assembly using Python&rsquo;s built-in AST module. (Jun&nbsp;2017)
* [pygit](/writings/pygit/) implements just enough of a Git client (in 500 lines of Python) to create a repo, commit, and push itself to GitHub. (Apr&nbsp;2017)
* [Two kinds of speed](/writings/language-speed/) responds to dynamic-typing dislike with some reasons I think dynamically typed languages like Python are still a good idea. (Apr&nbsp;2017)
* [Developing GiftyWeddings.com](/writings/gifty/) explains how I got started with my wedding gift registry website and also describes the 2016 revamp I gave the site. (Jan&nbsp;2017)
* [Contributing os.scandir() to Python](/writings/scandir/) describes my experience contributing a medium-sized feature to the Python 3.5 standard library. (Aug&nbsp;2016)


## Non-technical articles

* [Hacker Christianity](http://aliensintheapple.com/2013/12/22/hacker-christianity/), some thoughts on the intersection between Christianity and hacker culture, as well as a retelling of the Christian story in hacker terms. (Dec&nbsp;2013)
* [Plain English Westminster](/writings/pew/) is a version of the Westminster Confession of Faith for us in the <span class="sc">pew</span>. (Nov&nbsp;2013)
* [Quotes and notes on *The Autobiography of Benjamin Franklin*.](http://aliensintheapple.com/2011/12/23/the-autobiography-of-benjamin-franklin/) (Dec&nbsp;2011)
* [Book review of *The Biblical Mandate for Caring for Creation*](http://aliensintheapple.com/2011/12/02/caring-for-creation/), a book by Dick Tripp and published by my friend Matthew Bartlett. (Dec&nbsp;2011)
* [Luth3r hacks iChurch](http://aliensintheapple.wordpress.com/2011/08/30/luth3r-hacks-ichurch-makes-bible-open-source/) describes how the iconoclast hacker Mart1n Luth3r hacked iChurch and proceeded to make the Bible open source. (Aug&nbsp;2011)
* [The One True BDFL](http://aliensintheapple.wordpress.com/2011/02/14/the-one-true-bdfl/): If your favourite programming language has a creator and a Benevolent Dictator For Life (BDFL), why shouldn&rsquo;t life itself? (Feb&nbsp;2011)
* [A brief history of Hoyt](http://aliensintheapple.wordpress.com/2010/09/08/a-brief-history-of-hoyt/) looks at where my family name came from. (Sep&nbsp;2010)
* [Workers unite, farmers fight!](/prism-magazine/issue5/history1.html) I wrote for [Prism Magazine](/prism-magazine/) to give a brief overview of the 1913 waterfront strikes in Wellington and how they almost turned into civil war in New Zealand. (Jan&nbsp;2007)
* [Welcome to Sudan](/writings/welcome-to-sudan/), a story I wrote after visiting Franci in Khartoum, Sudan for two weeks. (Dec&nbsp;2004)
* [Preaching and Politics](/writings/preaching-and-politics/), an article I wrote for the *Wairarapa Times Age* in response to a local athiest&rsquo;s written attack on an 11-year-old friend&rsquo;s letter to the editor. (Sep&nbsp;2004)
* [Rugby vs Golf](/prism-magazine/issue2/satire.html) presents very serious rational and theological reasons for the superiority of the less holey sport. (Aug&nbsp;2003)
* [The New Perspective on Sam](/prism-magazine/articles/npsam.html) is something of a satire I wrote when the &ldquo;New Perspective on Paul&rdquo; was a hot topic at church. It was also published in the Feb&nbsp;2003 issue of [*Stimulus*](http://www.laidlaw.ac.nz/stimulus). (Oct&nbsp;2002)
* [Prince of Peace](/writings/prince-of-peace/), a poem I wrote in my last year of high school. (Sep&nbsp;1999)


## Tech blog articles

### Compass.com

* [Writing Good Commit Messages](https://medium.com/compass-true-north/writing-good-commit-messages-fc33af9d6321) looks at why quality commit messages are important and how to write them. (Sep&nbsp;2018)

### Jetsetter.com

* [Duplicate image detection with perceptual hashing in Python](/writings/duplicate-image-detection/) describes a simple algorithm to detect duplicate or very similar images. (Mar&nbsp;2017)

### Oyster.com

* [Using Ansible to restore developer sanity](/writings/using-ansible-to-restore-developer-sanity/) talks about how we went from a deployment including 28 manual steps to a single Ansible command. (Jul&nbsp;2015)
* [Saving 9 GB of RAM with Python’s \_\_slots\_\_](/writings/save-ram-with-python-slots/) describes the huge memory savings we got using `__slots__` on a single class. (Nov&nbsp;2013)
* [OpenSSL hangs CPU with Python <= 2.7.3 on Windows](/writings/openssl-python-windows/) details a serious bug in an older version of OpenSSL that causes O(N<sup>2</sup>) behaviour. (Apr&nbsp;2013)
* [An arm wrestle with Python’s garbage collector](/writings/pythons-garbage-collector/) describes how we eliminated 4.5 second stop-the-world GC pauses. (Jan&nbsp;2013)
* [CherryPy, ctypes, and being explicit](/writings/cherrypy-ctypes-and-being-explicit/) details a bug in CherryPy on Windows due to lack of `ctypes` argument types. (Oct&nbsp;2011)
* [How our photo search engine really works](http://tech.oyster.com/how-our-photo-search-engine-really-works/) describes how I wrote Oyster's photo search engine. (Jul&nbsp;2011)

### Brush Technology

* [Yes, my credit card number *does* have spaces!](http://blog.brush.co.nz/2013/07/card-number/) rants about payment forms that don’t allow you to type the spaces in your credit card number. (Jul&nbsp;2013)
* [Masterminds of Programming](http://blog.brush.co.nz/2013/01/masterminds-of-programming/) reviews an excellent book that interviews the creators of 17 important programming languages. (Jan&nbsp;2013)
* [C#'s async/await compared to protothreads in C++](http://blog.brush.co.nz/2012/11/async-await-protothreads-cpp/) looks at how two very different async constructs unroll to state machines in a similar way. (Nov&nbsp;2012)
* [Should you use C++ for an embedded project?](http://blog.brush.co.nz/2011/01/cpp-embedded/) asks some hard questions about C versus C++ in small embedded systems. (Jan&nbsp;2011)
* [C++ for C programmers, part 2 of 2](http://blog.brush.co.nz/2010/08/cpp-2/) introduces the object-oriented features of C++, for C programmers. (Aug&nbsp;2010)
* [C++ for C programmers, part 1 of 2](http://blog.brush.co.nz/2010/05/cpp-1/) introduces the non-OO features of C++, for C programmers. (May&nbsp;2010)
* [Why I'm not moving to Linux just yet](http://blog.brush.co.nz/2010/04/not-linux-yet/) gives some reasons why I wasn’t about to switch to Linux (in 2010), notably poor font rendering and inconsistent UI. (Apr&nbsp;2010)
* [Go Forth and WikiReadit](http://blog.brush.co.nz/2009/12/wikireader/) asks Christopher Hall, one of the main software developers of the WikiReader, why he chose Forth for testing and sub-apps. (Dec&nbsp;2009)
* [Code generation with X-Macros in C](http://blog.brush.co.nz/2009/08/xmacros/) describes X Macros, a little-known but very useful way to use the C preprocessor to initialize code and data. (Aug&nbsp;2009)
* [Blast from the demoscene past](http://blog.brush.co.nz/2009/06/scene/) recalls the demoscene and two reasons that kind of coding still matters today. (Jun&nbsp;2009)
* [Knuth, goto, Python, and OOP](http://blog.brush.co.nz/2009/04/knuth/) shows how Donald Knuth predicted modules, Python-like use of indentation for blocks, and object-oriented programming. (Apr&nbsp;2009)
* [Cracking an INI file with a jackhammer](http://blog.brush.co.nz/2009/02/inih/) looks at some bloated INI file parsers in C and C++, then introduces my own, `inih`. (Feb&nbsp;2009)
* [RAII, AC/DC, and the "with" statement](http://blog.brush.co.nz/2009/02/raii-acdc/) explains RAII in C++, and why it’s a terrible acronym. (Feb&nbsp;2009)
* [Helvetica: can a font be a film?](http://blog.brush.co.nz/2008/09/helvetica/) talks about Arial versus Helvetica, and about the film *Helvetica*. (Sep&nbsp;2008)
* [Protothreads and C++](http://blog.brush.co.nz/2008/07/protothreads/) introduces my port of Adam Dunkels’ protothreads to C++. (Jul&nbsp;2008)
* [Thank you, Adobe Reader 9!](http://blog.brush.co.nz/2008/07/adobe-reader-9/) is satire about how bloated Adobe Reader had become, even in 2008. (Jul&nbsp;2008)
* [Can modern software be snappy?](http://blog.brush.co.nz/2008/06/snappy-software/) discusses how software is slower and more bloated than ever, despite increasingly powerful computers. (Jun&nbsp;2008)
* [SOAP won't make you clean](http://blog.brush.co.nz/2008/02/soap-is-dirty/) talks about horribly complex SOAP APIs. (Feb&nbsp;2008)
* [Link rot, soft 404s, and DecentURL](http://blog.brush.co.nz/2008/01/soft404s/) describes a method for detecting "soft 404s", not-found pages which don't return HTTP 404. (Jan&nbsp;2008)
* [Ten quirky things about Python](http://blog.brush.co.nz/2008/01/ten-python-quirkies/) lists, um, ten quirky things about Python. (Jan&nbsp;2008)
* [Recursive decent parsing [sic]](http://blog.brush.co.nz/2007/11/recursive-decent/) shows how to turn a simple BNF grammar into code. (Nov&nbsp;2007)
* [Ten things I love && hate about C](http://blog.brush.co.nz/2007/10/ten-things-about-c/) has a pretty self-explanatory title. (Oct&nbsp;2007)
* [nobraces: Python indentation for C](http://blog.brush.co.nz/2007/09/nobraces/) is a fun program that allows you to use Python-like indentation in C. (Sep&nbsp;2007)
* [Learning to write from Mr Green](http://blog.brush.co.nz/2007/09/learning-to-write/) talks about clear writing versus business jargon. (Sep&nbsp;2007)
* [The Case for case sensitivity](http://blog.brush.co.nz/2007/07/the-case-for-case-sensitivity/) counters Jeff Atwood's diatribe against case sensitivity in programming languages. (Jul&nbsp;2007)
* [How did you learn to program?](http://blog.brush.co.nz/2007/06/how-did-you-learn-to-program/) describes how I got into programming as a teenager. (Jun&nbsp;2007)


## Copyright

Unless it says otherwise in the individual document, the works above are &copy;&nbsp;Ben&nbsp;Hoyt under a [Creative Commons BY-NC-ND](http://creativecommons.org/licenses/by-nc-nd/3.0/) license, which basically means you can copy and share them freely, as long as you link back to [benhoyt.com](http://benhoyt.com/), don&rsquo;t make money with them, and don&rsquo;t alter the content. Enjoy!
