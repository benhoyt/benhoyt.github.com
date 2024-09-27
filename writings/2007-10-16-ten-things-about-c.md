---
layout: default
title: "Ten things I love && hate about C"
permalink: /writings/ten-things-about-c/
description: "Ten things I love && hate about C"
canonical_url: https://blog.brush.co.nz/2007/10/ten-things-about-c/
---
<h1>Ten things I love && hate about C</h1>
<p class="subtitle">October 2007</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2007/10/ten-things-about-c/)


<p><small><b>Preface:</b> Recently a guy asked <a href="http://freeshells.ch/~revence/no-c.txt">“Why Should I Ever Use C Again?”</a> — I don’t agree with him, but at least he did say in passing that it’s okay to use C if you’re “coding on a thumb-sized computer” or bootstrapping a language. And I’ll add: Or writing device drivers. Or platform-specific kernels. But anyway …</small></p>

<p><a href="http://www.amazon.com/C-Programming-Language-2nd/dp/0131103628/" title="Buy your own copy of K&amp;R"><img style="width:auto" alt="K&amp;R cover" class="right border" height="165" src="/images/brushblog/2007_10_kandr_cover.jpg" width="120"/></a>A few years back I wrote my first web app — in C. I <i>don’t</i> recommend it. For web apps now I’d only use languages beginning with P, particularly P-y. But I was new to the web and to <a href="http://en.wikipedia.org/wiki/Common_Gateway_Interface">CGI</a>, and I’d come from the world of DOS and <a href="http://en.wikipedia.org/wiki/Terminate_and_Stay_Resident">TSRs</a>, where using 10KB of RAM was shock-horror-huge.</p>

<p>Now I’m a web programmer, but only by night. By day I code firmware for embedded micros, so C is still my language of choice. By “micro” I mean processors that go in toasters and the like, with maybe 64KB of code space and 2KB of RAM. So your language choices are pretty much assembler and C. (Or <a href="http://en.wikipedia.org/wiki/Forth_%28programming_language%29">Forth</a> — but that’s another story.)</p>

<p>And I’ve found that the more I use C, the less I dislike it. I wanted to write up a bit of a tribute to the world’s most widespread system-level programming language.</p>

<p>So below are <a href="#kandr">five things I like</a> and <a href="#globals_extern">five things I dislike</a> about C. <span id="more-62"></span>Feel free to add your own in the comments at the bottom.</p>

<h4 id="kandr">1. <i>K&amp;R</i> (love it)</h4>

<p>Kernighan &amp; Ritchie’s <a href="http://www.amazon.com/The-Programming-Language-Brian-Kernighan/dp/0131103628"><i>The C Programming Language</i></a> is easily the best book about C, and I reckon it’s one of the best books about programming. Short, succinct, and full of useful, non-trivial examples. It’s a good read and a good reference.</p>

<p>Even the preface is good. A quote: “C is not a big language, and it is not well served by a big book.” All programming books would be better if they were limited to this book’s length of 270 pages. It’s quite possible the clear conciseness of <i>K&amp;R</i> has a fair bit to do with C’s success.</p>

<p>The only other programming language book I’ve got similar fondness for is <a href="http://books.google.co.nz/books?id=1AlWbXItiCYC"><i>Thinking Forth</i></a> by Leo Brodie. I’m sure there are other good ones — <a href="http://www-mitpress.mit.edu/sicp/">SICP</a>, for example — it’s just that I haven’t read them yet.</p>

<h4 id="concise">2. It’s concise (love it)</h4>

<p>The fact that it’s not a big language is a real bonus. To learn C, you only need to dig its types, flow control, pointer handling, and you’ve pretty much got it. Everything else is a function. The fact that <i>K&amp;R</i> implements <code>qsort()</code> in 11 lines of this low-level, imperative language is testament to its conciseness.</p>

<h4 id="ioccc">3. IOCCC (love it)</h4>

<p>Call me crazy, but if you’re self-motivated, the <a href="http://www0.us.ioccc.org/main.html">International Obfuscated C Code Contest</a> is probably one of the best teachers of computer science out there. And I’m only half kidding. I really think that hackers have risen to the challenge and produced some sweet didactic gems.</p>

<p>One entry I really learned a lot from was <a href="http://fabrice.bellard.free.fr/otcc/">OTCC</a>, Fabrice Bellard’s “Obfuscated Tiny C Compiler”. From it I learned about compiler design. Mainly that C compilers don’t have to be great hulking projects with <a href="http://www.ohloh.net/projects/15">3.4 million lines of code</a>. But I was also inspired to read <a href="http://compilers.iecc.com/crenshaw/">Let’s Build a Compiler</a> and sit down and write a mini C-to-Forth compiler.</p>

<h4 id="declarations">4. Variables declared like they’re used (love it)</h4>

<p>This one’s great for remembering how to declare more complicated things like a pointer to an array of ten integers. Is it <code>int *api[10]</code> or <code>int (*pai)[10]</code>? Well, just define it like you’d use it, and all you have to remember is operator precedence: <code>[]</code> binds tighter than <code>*</code> (which seems to come quite naturally), so yes, you need the parens.</p>

<h4 id="builds_small">5. It builds a small “hello, world” (love it)</h4>

<p>This is particularly good for embedded programming. C doesn’t have a huge run-time overhead. On many embedded processors, a do-nothing app will compile to only 3 or 4 bytes. And a “hello, world” proggy, even under Windows XP, compiles to about 1.5KB (using <a href="http://fabrice.bellard.free.fr/tcc/">Tiny C Compiler</a>, which is great for making small executables).</p>

<p>I think if other languages like Python could emulate this (even for a subset of the language), they could win over much of the embedded world.</p>

<hr/>

<h4 id="globals_extern">6. Globals are extern by default (hate it)</h4>

<p>“But using globals is bad practice!” you say. Not in embedded systems. Let’s say you have a file <code>timer.c</code> that has a global <code>int counter</code>. And in another file, <code>state_machine.c</code>, you have another <code>counter</code>. If you accidentally forget to make them both <code>static</code>, they’re the same variable, and your code is history! No warnings, no nothing …</p>

<p>This seems very odd, especially given that the keyword <code>extern</code> is right there handy. Once you’re familiar with the two different meanings of <code>static</code>, it’s easy to avoid, but still.</p>

<h4 id="two_statics">7. Two different meanings for <code>static</code> (hate it)</h4>

<p>Can somebody explain to me why <code>static</code> has a totally different meaning inside a function and outside of one? Inside a function it means, well, static — “keep this variable across function calls.” But outside a function it changes completely to mean “this variable’s private to this file”. Why not <code>private</code> or <code>intern</code> for the latter?</p>

<h4 id="and_precedence">8. &amp; precedence lower than == (hate it)</h4>

<p>For embedded programming one’s always going <code>if ((x&amp;MASK) == 0)</code>, but you often forget the inner parentheses, because it seems like the precedence of <code>&amp;</code> should be higher than that of <code>==</code>. But it’s not, so you’ve gotta have those extra parens.</p>

<p>However, there’s a <a href="https://www.bell-labs.com/usr/dmr/www/chist.html">good historical reason</a> for this. C was born from B, which only had a single ANDing operator. When Ritchie introduced <code>&amp;&amp;</code>, they wanted to keep old B-ported code working, so they left the precedence of <code>&amp;</code> lower than <code>==</code>.</p>

<h4 id="macros">9. Macros aren’t quite powerful enough (hate it)</h4>

<p>Though recursive <code>#include</code>s are a very neat idea, how do you do a simple preprocessor loop without resorting to brain-teasers? And, closer to something I’ve needed more than once, how do you give your program an int and string version number with only one thing to modify?</p>

<p><code></code></p>

<h1>define VERSION_INT 209</h1>

<h1>define VERSION_STR "2.09"</h1>

<p></p>

<p>With the above you’ve always got to change two things when you update your version number. And the special <code>#</code> and <code>##</code> don’t quite do the trick. The only solutions I can figure out involve more work at runtime.</p>

<h4 id="not_reflective">10. It’s not reflective (hate it)</h4>

<p>Okay, so maybe this is just re-hashing point 9 — if the macro system were a bit more powerful, the language wouldn’t need to be <a href="http://en.wikipedia.org/wiki/Reflection_%28computer_science%29">reflective</a>. And I may be abusing the term. But all I really mean is that with C you can’t write code that writes code.</p>

<p>Why didn’t they make the preprocessor language C itself? This would open up endless possibilities for unrolled loops, powerful macros, and even more IOCCC weirdness. :-)</p>

<hr/>

<p>But I think it’s great how the language fathers have no trouble admitting C’s mistakes. As Dennis Ritchie said:</p>

<blockquote><b>“C is quirky, flawed, and an enormous success.”</b>
</blockquote>

<p>Read his paper <a href="http://cm.bell-labs.com/cm/cs/who/dmr/chist.html"><i>The Development of the C Language</i></a> for more of this — it’s a really good read.</p>

<p>In short, C’s great for what it’s great for.</p>



<h2>Comments</h2>

<h3>version2 <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 00:02</span></h3>

<p>Good show, man. I wrote drivers for quite a while and agree with c’s effectiveness in this area. I used the picc compiler, in fact. Great optimizations for pic develoment.</p>

<h3>Andy <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 00:40</span></h3>

<p>Whilst I prefer C++ to C because I seem hard-wired for OOP, I’ve always been amused by language wars.</p>

<p>Just choose the right tool for the job, Python (or Perl or Ruby) for web development… C for device drivers… Prolog for AI etc. </p>

<p>You never hear plumbers arguing that hammers are better than wrenches.</p>

<p>One more reason to love C: It’s the lowest common denominator – you can always extend your language of choice with C and get access to new and dangerous bits of the OS.</p>

<h3>David <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 01:00</span></h3>

<p>People grumble about static “having two different meanings”, but it really doesn’t: it means “this variable is private to the file/block and persistent”.  The problem is that the default is either auto (another C keyword, indicating a stack-allocated variable) or global (no keyword; extern is already used to indicate that the variable is declared elsewhere) depending on the context.</p>

<h3>jasonp <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 01:24</span></h3>

<p>I’ve often disliked the limited functionality of the C preprocessor. The preprocessor that comes with most assemblers tends to be much more powerful (preprocessor loops, local macro variables, arithmetic on preprocessor variables, etc.). For a nice preprocessor take a look at NASM, the Netwide Assembler. Its preprocessor has many of these features and the assmbler ships as fairly compact and modular C code, so it’s easy to strip out everything but the preprocessor and recompile</p>

<p>Also, if you have ‘#define X 2.09’, then in your code ‘#X’ evaluates to the string “2.09”</p>

<h3>Drew Vogel <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 02:24</span></h3>

<p>Andy:</p>

<p><em>“You never hear plumbers arguing that hammers are better than wrenches.”</em></p>

<p>You <strong>do</strong> hear them complain about how the last guy did it all wrong. The biggest difference between plumbers and programmers is that the plumber can afford to rip out all of the plumbing :)</p>

<h3>Jerry Ablan <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 02:25</span></h3>

<p>You have to get high before you program in Forth. It makes RPN more fluid. ;)</p>

<h3>Paolo Bonzini <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 02:38</span></h3>

<ol>
<li>Two different meanings for static (hate it)</li>
</ol>

<p>There is one meaning: a global variable that is invisible outside the current scope, be it a function or a file.</p>

<h3>Bill Weiss <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 03:34</span></h3>

<p>Solution for the static thing:</p>

<p><code>#define private static</code></p>

<p>:)</p>

<h3>Bill Weiss <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 03:35</span></h3>

<p>… pretend there’s some formatting in there.  A hash before the define, and static should be in tt.  You know. <i>[Fixed, Bill, thanks. –Ben]</i></p>

<h3>John Shirley <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 04:19</span></h3>

<p>Excellent, well balanced post.  Much more even handed than the original <i>“my-blub-is-better-than-your-blub-arrgh-this-language-makes-the- programmer-actually-think”</i> post.  Thanks for the nice riposte :)</p>

<h3>tim <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 06:12</span></h3>

<p>What are these “other programming language book[s]” you’re comparing K&amp;R to?  K&amp;R is pretty boring, as computer books go: just the language, and an uninspiring language at that.</p>

<p>SICP, PAIP, even AIMA are orders of magnitude more fascinating books.  Of course, that’s probably because they’re about more interesting languages: C has no syntactic abstraction, so an array is really just an array.</p>

<p>I’m not sure what “non-trivial examples” you found in K&amp;R.  My copy doesn’t seem to have any.  That’s not a criticism of K&amp;R as a book about C: for such a short book, and in such a low-level language, they really didn’t have room for any.</p>

<h3>Tom A <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 06:50</span></h3>

<p>Re: number 9 (macro preprocessor). I’m not sure it’s a big win, but the preprocessor ends up being a lot more capable than it initially appears. Check out Boost. Preprocessor (admittedly Boost has a C++ focus, but the preprocessor headers are supposed to be C compatible)</p>

<pre><code>
#define VERSION_MAJOR 2<br/>
#define VERSION_MINOR 09<br/>
#define STR(x) #x<br/>
#define JOIN(x,y) x ## y<br/>
/* some compilers need an extra level of indirection */<br/>
#define ISTR(x) STR(x)<br/>
#define IJOIN(x,y) JOIN(x,y)<br/>
#define VERSION_STR (ISTR(VERSION_MAJOR) "." ISTR(VERSION_MINOR))<br/>
#define VERSION_INT IJOIN(VERSION_MAJOR, VERSION_MINOR)<br/>
</code></pre>

<p><i>[Sorry about the formatting, Tom. Fixed. –Ben]</i></p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 08:37</span></h3>

<p>David and Paolo, good point about <code>static</code>. I hadn’t noticed that vars defined <code>static</code> do actually end up having the same meaning in and outside of a function. What confused me (and others) was what David said about the diferent defaults (what <code>static</code> is changing it <em>from</em>) — that makes it sure seem like <code>static</code> itself has two meanings.</p>

<p>Tim, about books, I’m thinking your average 1300-page tome on HTML or Java. About non-trivial examples in <em>K&amp;R</em>: a generic <code>qsort()</code>, a recursive-descent translator, an implementation of streams and of malloc/free. They might be simple once you know them, but if you can write them in your sleep, you’ll easily get hired — these examples aren’t <a href="http://www.codinghorror.com/blog/archives/000781.html" rel="nofollow">FizzBuzz</a>.</p>

<p>Tom, good stuff on the version solution! I was hoping somebody might take up the challenge. :-) I had tried more or less that but without the extra level of indirection. Thanks!</p>

<h3>Captain Obvious <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 09:40</span></h3>

<p>Re: cpp</p>

<p>Want a powerful macro processor?
We all started using m4 years ago.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 09:56</span></h3>

<p>Captain Obvious, fair point about m4 — I’ve heard of it but not used it.</p>

<h3>tim <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 12:25</span></h3>

<p>Ah, now there’s some useful information!  You’re comparing K&amp;R to an “average 1300-page tome on HTML or Java” — though I don’t see how you can use that to conclude that it’s “one of the best books about programming”.</p>

<p>I would call qsort trivial.  (In a modern HLL, I can write it in only a couple lines, about the same as FizzBuzz.)  SICP implements a compiler.  K&amp;R isn’t even in the same league.  Sorry — you need to read more books!  :-)</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Oct 2007, 13:19</span></h3>

<p>Hmmm, Tim, I’m not sure I’d call even <code>qsort</code> trivial, just because it’s a two-liner in Python and Haskell. It took a <a href="http://en.wikipedia.org/wiki/C._A._R._Hoare" rel="nofollow">top computer scientist</a> to come up with it, and that was 15-odd years into the development of computer science.</p>

<p>Even the simple recursive-descent techniques <em>K&amp;R</em> uses in its <code>dcl</code> program that are so “obvious” now took years to come up with. Have a read of Jack Crenshaw’s <a href="http://compilers.iecc.com/crenshaw/" rel="nofollow">Let’s Build a Compiler</a>, specifically the “A little philosophy” section in <a href="http://compilers.iecc.com/crenshaw/tutor4.txt" rel="nofollow">chapter 4</a>.</p>

<p>But you’re right, I do need to read more books. :-)</p>

<h3>Darren <span style="padding-left: 1em; color: #bbb;">18 Oct 2007, 08:09</span></h3>

<p>Your #6 isn’t right. If you declare two variables as global with the same name, the linker should reject it. All but one ought to be extern. Lazy programmers who want to put the definition (not declaration) in the .h file so they don’t need a separate .c file convinced later compiler/linker writers to ignore that rule. But it wasn’t a problem in the original language definition.</p>

<h3>Choom <span style="padding-left: 1em; color: #bbb;">18 Oct 2007, 11:24</span></h3>

<p>Regarding #6, try compiling one module at a time instead of compiling everything at once, like this:</p>

<p><code>cc -c -o foo.o foo.c<br/>
cc -c -o bar.o bar.c<br/>
cc -c -o baz.o baz.c<br/>
cc -o baz foo.o bar.o baz.o</code></p>

<p>Doing the above will result in a linker error in the final build if the same global variable is local to all modules.  When you compile all the sources at the same time you’re basically telling the compiler that they all belong to the same module, which is not the case in your example.</p>

