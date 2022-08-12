---
layout: default
title: Technical Writing
permalink: /writings/
rss_url: /writings/rss.xml
---
<div style="float: right; font-size: 80%;">
<a href="/writings/rss.xml">RSS feed</a>
</div>

# {{ page.title }}

Below are the programming-related articles I’ve written (see also my [**non-technical writings**](/writings/non-tech/)). The list includes the guest contributions I've written for LWN.net, and tech blog articles for several of the companies I’ve worked for.

{% include sponsor.html %}


<h2 id="y2022">2022</h2>

* [Rob Pike's simple C regex matcher in Go](/writings/rob-pike-regex/) looks at my translation of Pike's elegant regex matcher from C to Go. (August)
* [Tools I use to build my website](/writings/tools-i-use-to-build-my-website/) describes how I build `benhoyt.com` with GitHub Pages, Jekyll, a simple HTML+CSS layout, Sublime Text, and Sublime Merge. (August)
* [Modernizing AWK by adding CSV support](/writings/goawk-csv/) discusses why and how I added proper CSV support to GoAWK, my POSIX-compatible AWK interpreter. (May)
* [Prig](/writings/prig/) is for Processing Records In Go. It's a text processing tool like AWK, but it uses Go as the scripting language. (February)
* [Go version performance](/writings/go-version-performance/) charts how much the performance of Go has improved from version 1.2 through to 1.18 -- in its compiler, runtime, and libraries. (February)
* [Optimizing GoAWK](/writings/goawk-compiler-vm/) describes how I made GoAWK faster by switching from tree-walking to a bytecode compiler with a virtual machine interpreter. (February)


<h2 id="y2021">2021</h2>

* [AWKGo, an AWK-to-Go compiler](/writings/awkgo/) describes a simple compiler that translates a subset of the AWK text processing language into Go source code. (November)
* [Improving the Go RESTful API tutorial](/writings/web-service-stdlib/) describes my re-implementation of the code from an official Go tutorial, making it more robust and maintainable. (November)
* [Simple Lists](/writings/simple-lists/) describes a tiny to-do list app I wrote the old-school way: server-side Go that renders HTML, and no JavaScript. (October)
* [Structural pattern matching in Python 3.10](/writings/python-pattern-matching/) is a critical but informative look at this new feature, with real-world code examples. (September)
* [Mugo](/writings/mugo/) is a toy, single-pass compiler for a tiny subset of Go -- just enough to compile itself. It compiles to x86-64 assembly on Linux. (April)
* [How to implement a hash table](/writings/hash-table-in-c/) explains how to implement a simple hash table data structure, with code and examples in the C programming language. (March)
* [Performance comparison](/writings/count-words/) of counting and sorting word frequencies in various languages: Python, Go, C++, C, AWK, Forth, Rust, and others. (March)
* [The small web is beautiful](/writings/the-small-web-is-beautiful/): a vision for the "small web", small software, and small architectures. Also, a bonus rant about microservices. (March)
* [Coming in Go 1.16: ReadDir and DirEntry](/writings/go-readdir/): A look at the new `os.ReadDir` function coming in Go 1.16, with a comparison to `os.scandir` in Python. (January)


<h2 id="y2020">2020</h2>

* [Fuzzing in Go](https://lwn.net/Articles/829242/) is an overview of fuzz testing and the go-fuzz tool, as well as a look at the recent draft design for including fuzz testing in the `go` tool. (August, LWN.net)
* [Searching code with Sourcegraph](https://lwn.net/Articles/828748/) looks at Sourcegraph, a code search and code intelligence tool. (August, LWN.net)
* [Different approaches to HTTP routing in Go](/writings/go-routing/) compares routing techniques, including five custom approaches and three using third-party routing libraries. (July)
* [Go filesystems and file embedding](https://lwn.net/Articles/827215/) presents the draft designs for a filesystem interface and a standard way to embed files in a Go binary. (July, LWN.net)
* [The sad, slow-motion death of Do Not Track](https://lwn.net/Articles/826575/) talks about the valiant but almost-dead 10-year effort to prevent tracking with the "`DNT: 1`" header. (July, LWN.net)
* [What's new in Lua 5.4](https://lwn.net/Articles/826134/) covers exactly that. (July, LWN.net)
* [An overview of Hugo](https://lwn.net/Articles/825507/), a flexible static website generator written in Go and optimized for speed. (July, LWN.net)
* [Generics for Go](https://lwn.net/Articles/824716/) gives some background, the current state, and potential timeline for including generics in the Go programming language. (July, LWN.net)
* [More alternatives to Google Analytics](https://lwn.net/Articles/824294/) looks at some heavier replacements for Google Analytics, as well as the GoAccess log-based analytics tool. (June, LWN.net)
* [Lightweight Google Analytics alternatives](https://lwn.net/Articles/822568/) discusses what Google Analytics tracks, and presents two lightweight alternatives: GoatCounter and Plausible. (June, LWN.net)
* [Intro to Go](/writings/go-intro/) is a brief introduction to Go for programmers who haven't used Go before: Why use it? The standard library. And the language itself. (June)
* [ZZT in Go](/writings/zzt-in-go/) describes my port of Adrian Siekierka's "Reconstruction of ZZT" to Go, done in a semi-automated way using a Pascal-to-Go converter. (May)
* [Testing in Go: philosophy and tools](https://lwn.net/Articles/821358/) describes the minimalist philosophy of testing in Go and the built-in testing tools. (May, LWN.net)
* [The state of the AWK](https://lwn.net/Articles/820829/) surveys the AWK landscape, looks at new features in GNU Awk, and discusses why AWK is still relevant in 2020. (May, LWN.net)
* [What's coming in Go 1.15](https://lwn.net/Articles/820217/) is an overview of what's coming in the Go 1.15 final release in August 2020. (May, LWN.net)
* [Don't sanitize input](/writings/dont-sanitize-do-escape/) shows why you shouldn't try to sanitize user input; instead, escape output correctly. (February)
* [SEO for Software Engineers](/writings/seo-for-software-engineers/) goes over the basics of Search Engine Optimization, written for software developers. (February, Compass.com)


<h2 id="y2019">2019</h2>

* [Fast Cloudfront log queries](https://medium.com/compass-true-north/fast-cloudfront-log-queries-using-aws-athena-and-serverless-ef117393c5a6) shows how to use AWS Lambda to partition your Cloudfront logs for faster querying via Athena. (December, Compass.com)
* [Learning Elm](/writings/learning-elm/) describes how I ported a medium-sized web frontend from React to Elm and had fun with a pure functional language in the process. (October)
* [Replacing Google Analytics with GoAccess](/writings/replacing-google-analytics/) describes how I replaced Google tracking with simple log-based analytics on my personal website. (April)


<h2 id="y2018">2018</h2>

* [GoAWK](/writings/goawk/) is an AWK interpreter written in Go, and this article describes how I wrote it, tested it, and measured and improved its performance. (November)
* [LoxLox](/writings/loxlox/) is an interpreter for *Crafting Interpreters'* Lox programming language written in Lox! (October)
* [Writing good commit messages](/writings/writing-good-commit-messages/) looks at why quality commit messages are important and how to write them. (September, Compass.com)


<h2 id="y2017">2017</h2>

* [Littlelang](/writings/littlelang/) is a dynamically-typed programming language I designed and wrote an interpreter for in Go (and in littlelang itself!). (December)
* [Learning Go](/writings/learning-go/) describes how I learnt the basics of Go (its good parts as well as a few quirks) by porting a medium-sized web backend from Python. (November)
* [Pentomino puzzle solver](/writings/python-pentomino/) uses Python code generation to find all 2339 tilings of the 12 free pentominoes on a 6x10 board. Based on my dad&rsquo;s Forth version. (July)
* [pyast64](/writings/pyast64/) is a toy (but working) compiler that turns Python syntax into x86-64 assembly using Python&rsquo;s built-in AST module. (June)
* [pygit](/writings/pygit/) implements just enough of a Git client (in 500 lines of Python) to create a repo, commit, and push itself to GitHub. (April)
* [Two kinds of speed](/writings/language-speed/) responds to dynamic-typing dislike with some reasons I think dynamically typed languages like Python are still a good idea. (April)
* [Duplicate image detection with perceptual hashing in Python](/writings/duplicate-image-detection/) describes a simple algorithm to detect duplicate or very similar images. (March, Jetsetter.com)
* [Developing GiftyWeddings.com](/writings/gifty/) explains how I got started with my wedding gift registry website and also describes the 2016 revamp I gave the site. (January)


<h2 id="y2016">2016</h2>

* [Contributing os.scandir() to Python](/writings/scandir/) describes my experience contributing a medium-sized feature to the Python 3.5 standard library. (August)


<h2 id="y2015">2015</h2>

* [Using Ansible to restore developer sanity](/writings/using-ansible-to-restore-developer-sanity/) talks about how we went from a deployment including 28 manual steps to a single Ansible command. (July, Oyster.com)


<h2 id="y2013">2013</h2>

* [Saving 9 GB of RAM with Python’s \_\_slots\_\_](/writings/save-ram-with-python-slots/) describes the huge memory savings we got using `__slots__` on a single class. (November, Oyster.com)
* [Yes, my credit card number *does* have spaces!](http://blog.brush.co.nz/2013/07/card-number/) rants about payment forms that don’t allow you to type the spaces in your credit card number. (July, Brush.co.nz)
* [OpenSSL hangs CPU with Python <= 2.7.3 on Windows](/writings/openssl-python-windows/) details a serious bug in an older version of OpenSSL that causes O(N<sup>2</sup>) behaviour. (April, Oyster.com)
* [An arm wrestle with Python’s garbage collector](/writings/pythons-garbage-collector/) describes how we eliminated 4.5 second stop-the-world GC pauses. (January, Oyster.com)
* [Masterminds of Programming](http://blog.brush.co.nz/2013/01/masterminds-of-programming/) reviews an excellent book that interviews the creators of 17 important programming languages. (January, Brush.co.nz)


<h2 id="y2012">2012</h2>

* [C#'s async/await compared to protothreads in C++](http://blog.brush.co.nz/2012/11/async-await-protothreads-cpp/) looks at how two very different async constructs unroll to state machines in a similar way. (November, Brush.co.nz)


<h2 id="y2011">2011</h2>

* [CherryPy, ctypes, and being explicit](/writings/cherrypy-ctypes-and-being-explicit/) details a bug in CherryPy on Windows due to lack of `ctypes` argument types. (October, Oyster.com)
* [How our photo search engine really works](/writings/how-our-photo-search-engine-really-works/) describes how I wrote Oyster's photo search engine. (July, Oyster.com)
* [Should you use C++ for an embedded project?](http://blog.brush.co.nz/2011/01/cpp-embedded/) asks some hard questions about C versus C++ in small embedded systems. (January, Brush.co.nz)


<h2 id="y2010">2010</h2>

* [C++ for C programmers, part 2 of 2](http://blog.brush.co.nz/2010/08/cpp-2/) introduces the object-oriented features of C++, for C programmers. (August, Brush.co.nz)
* [C++ for C programmers, part 1 of 2](http://blog.brush.co.nz/2010/05/cpp-1/) introduces the non-OO features of C++, for C programmers. (May, Brush.co.nz)
* [Why I'm not moving to Linux just yet](http://blog.brush.co.nz/2010/04/not-linux-yet/) gave the reasons I wasn’t about to switch to Linux in 2010, notably poor font rendering and inconsistent UI. (April, Brush.co.nz)


<h2 id="y2009">2009</h2>

* [Go Forth and WikiReadit](http://blog.brush.co.nz/2009/12/wikireader/) asks Christopher Hall, one of the main software developers of the WikiReader, why he chose Forth for testing and sub-apps. (December, Brush.co.nz)
* [Code generation with X-Macros in C](http://blog.brush.co.nz/2009/08/xmacros/) describes X Macros, a little-known but very useful way to use the C preprocessor to initialize code and data. (August, Brush.co.nz)
* [Blast from the demoscene past](http://blog.brush.co.nz/2009/06/scene/) recalls the demoscene and two reasons that kind of coding still matters today. (June, Brush.co.nz)
* [Knuth, goto, Python, and OOP](http://blog.brush.co.nz/2009/04/knuth/) shows how Donald Knuth predicted modules, Python-like use of indentation, and object-oriented programming. (April, Brush.co.nz)
* [Cracking an INI file with a jackhammer](http://blog.brush.co.nz/2009/02/inih/) looks at some bloated INI file parsers in C and C++, then introduces my own, `inih`. (February, Brush.co.nz)
* [RAII, AC/DC, and the "with" statement](http://blog.brush.co.nz/2009/02/raii-acdc/) explains RAII in C++, and why it’s a terrible acronym. (February, Brush.co.nz)


<h2 id="y2008">2008</h2>

* [Helvetica: can a font be a film?](http://blog.brush.co.nz/2008/09/helvetica/) talks about Arial versus Helvetica, and about the film *Helvetica*. (September, Brush.co.nz)
* [Protothreads and C++](http://blog.brush.co.nz/2008/07/protothreads/) introduces my port of Adam Dunkels’ protothreads to C++. (July, Brush.co.nz)
* [Thank you, Adobe Reader 9!](http://blog.brush.co.nz/2008/07/adobe-reader-9/) is satire about how bloated Adobe Reader had become, even in 2008. (July, Brush.co.nz)
* [Can modern software be snappy?](http://blog.brush.co.nz/2008/06/snappy-software/) discusses how software is slower and more bloated than ever, despite increasingly powerful computers. (June, Brush.co.nz)
* [SOAP won't make you clean](http://blog.brush.co.nz/2008/02/soap-is-dirty/) talks about horribly complex SOAP APIs. (February, Brush.co.nz)
* [Link rot, soft 404s, and DecentURL](http://blog.brush.co.nz/2008/01/soft404s/) describes a method for detecting "soft 404s", not-found pages which don't return HTTP 404. (January, Brush.co.nz)
* [Ten quirky things about Python](http://blog.brush.co.nz/2008/01/ten-python-quirkies/) lists, um, ten quirky things about Python. (January, Brush.co.nz)


<h2 id="y2007">2007</h2>

* [Recursive decent parsing [sic]](http://blog.brush.co.nz/2007/11/recursive-decent/) shows how to turn a simple BNF grammar into code. (November, Brush.co.nz)
* [Ten things I love && hate about C](http://blog.brush.co.nz/2007/10/ten-things-about-c/) has a pretty self-explanatory title. (October, Brush.co.nz)
* [nobraces: Python indentation for C](http://blog.brush.co.nz/2007/09/nobraces/) is a fun program that allows you to use Python-like indentation in C. (September, Brush.co.nz)
* [Learning to write from Mr Green](http://blog.brush.co.nz/2007/09/learning-to-write/) talks about clear writing versus business jargon. (September, Brush.co.nz)
* [The Case for case sensitivity](http://blog.brush.co.nz/2007/07/the-case-for-case-sensitivity/) counters Jeff Atwood's diatribe against case sensitivity in programming languages. (July, Brush.co.nz)
* [How did you learn to program?](http://blog.brush.co.nz/2007/06/how-did-you-learn-to-program/) describes how I got into programming as a teenager. (June, Brush.co.nz)


## Copyright

Unless it says otherwise in the individual document, the works above are &copy;&nbsp;Ben&nbsp;Hoyt under a [Creative Commons BY-NC-ND](http://creativecommons.org/licenses/by-nc-nd/3.0/) license, which basically means you can copy and share them freely, as long as you link back to [benhoyt.com](https://benhoyt.com/), don&rsquo;t make money with them, and don&rsquo;t alter the content. Enjoy!
