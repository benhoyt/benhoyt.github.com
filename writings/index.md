---
layout: default
title: Technical Writing
permalink: /writings/
rss_url: /writings/rss.xml
---
<div style="float: right; font-size: 80%;"><a href="/writings/rss.xml">RSS feed</a></div>

# {{ page.title }}

Below are the programming-related articles I’ve written (see also my [**non-technical writings**](/writings/non-tech/)). The list includes the guest contributions I've written for LWN.net, and tech blog articles for several of the companies I’ve worked for.


## 2020

* [Intro to Go](/writings/go-intro/) is a brief introduction to Go for programmers who haven't used Go before: Why use it? The standard library. And the language itself. (June)
* [ZZT in Go](/writings/zzt-in-go/) describes my port of Adrian Siekierka's "Reconstruction of ZZT" to Go, done in a semi-automated way using a Pascal-to-Go converter. (May)
* [Testing in Go: philosophy and tools](https://lwn.net/Articles/821358/) describes the minimalist philosophy of testing in Go and the built-in testing tools. (May, LWN.net)
* [The state of the AWK](https://lwn.net/Articles/820829/) surveys the AWK landscape, looks at new features in GNU Awk, and discusses why AWK is still relevant in 2020. (May, LWN.net)
* [What's coming in Go 1.15](https://lwn.net/Articles/820217/) is an overview of what's coming in the Go 1.15 final release in August 2020. (May, LWN.net)
* [Don't sanitize input](/writings/dont-sanitize-do-escape/) shows why you shouldn't try to sanitize user input; instead, escape output correctly. (February)
* [SEO for Software Engineers](/writings/seo-for-software-engineers/) goes over the basics of Search Engine Optimization, written for software developers. (February, Compass.com)


## 2019

* [Fast Cloudfront log queries](https://medium.com/compass-true-north/fast-cloudfront-log-queries-using-aws-athena-and-serverless-ef117393c5a6) shows how to use AWS Lambda to partition your Cloudfront logs for faster querying via Athena. (December, Compass.com)
* [Learning Elm](/writings/learning-elm/) describes how I ported a medium-sized web frontend from React to Elm and had fun with a pure functional language in the process. (October)
* [Replacing Google Analytics with GoAccess](/writings/replacing-google-analytics/) describes how I replaced Google tracking with simple log-based analytics on my personal website. (April)


## 2018

* [GoAWK](/writings/goawk/) is an AWK interpreter written in Go, and this article describes how I wrote it, tested it, and measured and improved its performance. (November)
* [LoxLox](/writings/loxlox/) is an interpreter for *Crafting Interpreters'* Lox programming language written in Lox! (October)
* [Writing good commit messages](/writings/writing-good-commit-messages/) looks at why quality commit messages are important and how to write them. (September, Compass.com)


## 2017

* [Littlelang](/writings/littlelang/) is a dynamically-typed programming language I designed and wrote an interpreter for in Go (and in littlelang itself!). (December)
* [Learning Go](/writings/learning-go/) describes how I learnt the basics of Go (its good parts as well as a few quirks) by porting a medium-sized web backend from Python. (November)
* [Pentomino puzzle solver](/writings/python-pentomino/) uses Python code generation to find all 2339 tilings of the 12 free pentominoes on a 6x10 board. Based on my dad&rsquo;s Forth version. (July)
* [pyast64](/writings/pyast64/) is a toy (but working) compiler that turns Python syntax into x86-64 assembly using Python&rsquo;s built-in AST module. (June)
* [pygit](/writings/pygit/) implements just enough of a Git client (in 500 lines of Python) to create a repo, commit, and push itself to GitHub. (April)
* [Two kinds of speed](/writings/language-speed/) responds to dynamic-typing dislike with some reasons I think dynamically typed languages like Python are still a good idea. (April)
* [Duplicate image detection with perceptual hashing in Python](/writings/duplicate-image-detection/) describes a simple algorithm to detect duplicate or very similar images. (March, Jetsetter.com)
* [Developing GiftyWeddings.com](/writings/gifty/) explains how I got started with my wedding gift registry website and also describes the 2016 revamp I gave the site. (January)


## 2016
* [Contributing os.scandir() to Python](/writings/scandir/) describes my experience contributing a medium-sized feature to the Python 3.5 standard library. (August)


## 2015

* [Using Ansible to restore developer sanity](/writings/using-ansible-to-restore-developer-sanity/) talks about how we went from a deployment including 28 manual steps to a single Ansible command. (July, Oyster.com)


## 2013

* [Saving 9 GB of RAM with Python’s \_\_slots\_\_](/writings/save-ram-with-python-slots/) describes the huge memory savings we got using `__slots__` on a single class. (November, Oyster.com)
* [Yes, my credit card number *does* have spaces!](http://blog.brush.co.nz/2013/07/card-number/) rants about payment forms that don’t allow you to type the spaces in your credit card number. (July, Brush.co.nz)
* [OpenSSL hangs CPU with Python <= 2.7.3 on Windows](/writings/openssl-python-windows/) details a serious bug in an older version of OpenSSL that causes O(N<sup>2</sup>) behaviour. (April, Oyster.com)
* [An arm wrestle with Python’s garbage collector](/writings/pythons-garbage-collector/) describes how we eliminated 4.5 second stop-the-world GC pauses. (January, Oyster.com)
* [Masterminds of Programming](http://blog.brush.co.nz/2013/01/masterminds-of-programming/) reviews an excellent book that interviews the creators of 17 important programming languages. (January, Brush.co.nz)


## 2012

* [C#'s async/await compared to protothreads in C++](http://blog.brush.co.nz/2012/11/async-await-protothreads-cpp/) looks at how two very different async constructs unroll to state machines in a similar way. (November, Brush.co.nz)


## 2011

* [CherryPy, ctypes, and being explicit](/writings/cherrypy-ctypes-and-being-explicit/) details a bug in CherryPy on Windows due to lack of `ctypes` argument types. (October, Oyster.com)
* [How our photo search engine really works](/writings/how-our-photo-search-engine-really-works/) describes how I wrote Oyster's photo search engine. (July, Oyster.com)
* [Should you use C++ for an embedded project?](http://blog.brush.co.nz/2011/01/cpp-embedded/) asks some hard questions about C versus C++ in small embedded systems. (January, Brush.co.nz)


## 2010

* [C++ for C programmers, part 2 of 2](http://blog.brush.co.nz/2010/08/cpp-2/) introduces the object-oriented features of C++, for C programmers. (August, Brush.co.nz)
* [C++ for C programmers, part 1 of 2](http://blog.brush.co.nz/2010/05/cpp-1/) introduces the non-OO features of C++, for C programmers. (May, Brush.co.nz)
* [Why I'm not moving to Linux just yet](http://blog.brush.co.nz/2010/04/not-linux-yet/) gave the reasons I wasn’t about to switch to Linux in 2010, notably poor font rendering and inconsistent UI. (April, Brush.co.nz)


## 2009

* [Go Forth and WikiReadit](http://blog.brush.co.nz/2009/12/wikireader/) asks Christopher Hall, one of the main software developers of the WikiReader, why he chose Forth for testing and sub-apps. (December, Brush.co.nz)
* [Code generation with X-Macros in C](http://blog.brush.co.nz/2009/08/xmacros/) describes X Macros, a little-known but very useful way to use the C preprocessor to initialize code and data. (August, Brush.co.nz)
* [Blast from the demoscene past](http://blog.brush.co.nz/2009/06/scene/) recalls the demoscene and two reasons that kind of coding still matters today. (June, Brush.co.nz)
* [Knuth, goto, Python, and OOP](http://blog.brush.co.nz/2009/04/knuth/) shows how Donald Knuth predicted modules, Python-like use of indentation, and object-oriented programming. (April, Brush.co.nz)
* [Cracking an INI file with a jackhammer](http://blog.brush.co.nz/2009/02/inih/) looks at some bloated INI file parsers in C and C++, then introduces my own, `inih`. (February, Brush.co.nz)
* [RAII, AC/DC, and the "with" statement](http://blog.brush.co.nz/2009/02/raii-acdc/) explains RAII in C++, and why it’s a terrible acronym. (February, Brush.co.nz)


## 2008

* [Helvetica: can a font be a film?](http://blog.brush.co.nz/2008/09/helvetica/) talks about Arial versus Helvetica, and about the film *Helvetica*. (September, Brush.co.nz)
* [Protothreads and C++](http://blog.brush.co.nz/2008/07/protothreads/) introduces my port of Adam Dunkels’ protothreads to C++. (July, Brush.co.nz)
* [Thank you, Adobe Reader 9!](http://blog.brush.co.nz/2008/07/adobe-reader-9/) is satire about how bloated Adobe Reader had become, even in 2008. (July, Brush.co.nz)
* [Can modern software be snappy?](http://blog.brush.co.nz/2008/06/snappy-software/) discusses how software is slower and more bloated than ever, despite increasingly powerful computers. (June, Brush.co.nz)
* [SOAP won't make you clean](http://blog.brush.co.nz/2008/02/soap-is-dirty/) talks about horribly complex SOAP APIs. (February, Brush.co.nz)
* [Link rot, soft 404s, and DecentURL](http://blog.brush.co.nz/2008/01/soft404s/) describes a method for detecting "soft 404s", not-found pages which don't return HTTP 404. (January, Brush.co.nz)
* [Ten quirky things about Python](http://blog.brush.co.nz/2008/01/ten-python-quirkies/) lists, um, ten quirky things about Python. (January, Brush.co.nz)


## 2007

* [Recursive decent parsing [sic]](http://blog.brush.co.nz/2007/11/recursive-decent/) shows how to turn a simple BNF grammar into code. (November, Brush.co.nz)
* [Ten things I love && hate about C](http://blog.brush.co.nz/2007/10/ten-things-about-c/) has a pretty self-explanatory title. (October, Brush.co.nz)
* [nobraces: Python indentation for C](http://blog.brush.co.nz/2007/09/nobraces/) is a fun program that allows you to use Python-like indentation in C. (September, Brush.co.nz)
* [Learning to write from Mr Green](http://blog.brush.co.nz/2007/09/learning-to-write/) talks about clear writing versus business jargon. (September, Brush.co.nz)
* [The Case for case sensitivity](http://blog.brush.co.nz/2007/07/the-case-for-case-sensitivity/) counters Jeff Atwood's diatribe against case sensitivity in programming languages. (July, Brush.co.nz)
* [How did you learn to program?](http://blog.brush.co.nz/2007/06/how-did-you-learn-to-program/) describes how I got into programming as a teenager. (June, Brush.co.nz)


## Copyright

Unless it says otherwise in the individual document, the works above are &copy;&nbsp;Ben&nbsp;Hoyt under a [Creative Commons BY-NC-ND](http://creativecommons.org/licenses/by-nc-nd/3.0/) license, which basically means you can copy and share them freely, as long as you link back to [benhoyt.com](https://benhoyt.com/), don&rsquo;t make money with them, and don&rsquo;t alter the content. Enjoy!
