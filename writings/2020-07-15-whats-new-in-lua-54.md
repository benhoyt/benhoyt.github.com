---
layout: default
title: "What's new in Lua 5.4"
permalink: /writings/whats-new-in-lua-54/
description: "An overview of the new features in Lua 5.4."
canonical_url: https://lwn.net/Articles/826134/
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">July 2020</p>

> [Original article on LWN.net]({{ page.canonical_url }})

<style>
DIV.BigQuote {
    font-style: normal;
    font-weight: normal;
    color: darkred;
    background-color: white;
    margin-left: 1cm;
    margin-right: 1cm;
}
pre {
    font-size: 90%;
    word-spacing: 0;
}
span {
    color: darkred;
}
</style>


<p><a href="https://www.lua.org/">Lua</a> version 5.4 was released at the
end of June; it is the fifteenth major version of the lightweight scripting
language since its creation in 1993. <a
href="https://www.lua.org/manual/5.4/readme.html#changes">New in 5.4</a> is
a <a href="http://www.lua.org/manual/5.4/manual.html#2.5.2">generational
mode</a> for the garbage collector, which performs better for programs with
lots of short-lived allocations. The language now supports "attributes" on
local variables, allowing developers to mark variables as constant
(<tt>const</tt>) or resources as closeable (<tt>close</tt>). There were
also significant performance improvements over 5.3 along with a host of
minor changes.</p>

<p>Lua is a programming language optimized for embedding inside other
applications, with notable users such as Redis and Adobe Lightroom.
It has been used as a scripting language for <a
href="https://en.wikipedia.org/wiki/Category:Lua-scripted_video_games">many
computer games</a>, including big names such as World of
Warcraft and Angry Birds; Lua was the most-used scripting language in a <a
href="http://www.satori.org/2009/03/the-engine-survey-general-results/">2009
survey of the game industry</a>. Part of the reason Lua is good for embedding is
because it is small: in these days of multi-megabyte downloads for even the
simplest applications, the entire Lua 5.4 distribution (source plus docs)
is a 349KB archive. To build a Lua interpreter with the default
configuration, a developer can type <tt>make</tt> and wait about five
seconds for compilation &mdash; the result is a self-contained 200-300KB
binary.</p>

<p><a href="https://www.lua.org/versions.html">Major versions</a> of Lua
are released every few years, not on any particular release cycle. The <a
href="https://www.lua.org/manual/5.3/readme.html#changes">previous major
version</a>, 5.3, was released over five years ago, in January 2015, with
the addition of a separate integer type (previously Lua used only
floating-point numbers), bitwise operators, a basic UTF-8 library, and many
minor features.</p>

<h4>Language changes</h4>

<p>One of the interesting new features in Lua 5.4 is the addition of <a
href="https://www.lua.org/manual/5.4/manual.html#3.3.7">local variable
"attributes"</a>. When declaring a local (block-scoped) variable, a
developer can add <tt>&lt;const&gt;</tt> or <tt>&lt;close&gt;</tt> after a
variable name to give it that attribute. The <tt>const</tt> attribute is
straightforward: similar to <tt>const</tt> in C, it means that the
specified variable cannot be reassigned after the initialization in its
declaration. The <tt>const</tt> attribute does not make a data structure
immutable: a developer is not prevented from changing entries in a table
stored in a <tt>const</tt> variable, but the variable name cannot be assigned
again. The <tt>const</tt> attribute provides a small amount of compile-time
safety, as the compiler will give an error if a constant is accidentally
reassigned:</p>

<pre>
    do
        local x &lt;const&gt; = 42
        x = x+1
    end
    -- ERROR: attempt to assign to const variable 'x'
</pre>

<p>Perhaps more useful (though with similarly unusual syntax) is the
<tt>close</tt> attribute. This tells Lua to call the object's
<tt>__close()</tt> "<a
href="https://www.lua.org/manual/5.4/manual.html#2.4">metamethod</a>" when
the variable goes out of scope. Similar to <a
href="https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization">RAII</a>
in C++ or the <a
href="https://docs.python.org/3/reference/compound_stmts.html#with"><tt>with</tt>
statement</a> in Python, it is a way to ensure that memory is freed, files are
closed, or other resources are shut down in a deterministic way. For
example, the file object returned by the built-in <tt>io.open()</tt> function
can be used with <tt>&lt;close&gt;</tt>:</p>

<pre>
    do
        local f &lt;close&gt; = io.open("/etc/fstab", "r")
        -- read from file 'f'
    end
    -- file is automatically closed here
</pre>

<p>The <tt>&lt;close&gt;</tt> attribute can also be used with user-defined objects:</p>

<pre>
    function new_thing()
        local thing = {}
        setmetatable(thing, {
            __close = function()
                          print("thing closed")
                      end
        })
        return thing
    end

    do
        local x &lt;close&gt; = new_thing()
        print("use thing")
    end
    -- "thing closed" is printed here after "use thing"
</pre>

<p>Previously, developers would have to use the <tt>__gc()</tt> metamethod for
this purpose, but that is only called when the object is garbage collected
some time later, not deterministically at the end of the block.</p>

<h4>Generational GC</h4>

<p>Version 5.4 also brings a new generational
garbage collection (GC) mode, which performs better for certain kinds of
programs where objects usually have a short lifetime. A generational GC
&mdash; based on the observation that "most objects die young" &mdash;
scans "young" objects frequently and frees them if they are not referenced,
but scans older
objects (those that are still referenced after one or more GC passes) less
frequently. Interestingly, Roberto Ierusalimschy (one of the creators of
Lua) <a 
href="http://lua-users.org/lists/lua-l/2017-10/msg00113.html">noted in
2017</a> that Lua previously had a generational GC:</p>

<div class="BigQuote">
<p>Lua has an incremental garbage collector since 5.1. It was the
generational collector that was introduced in 5.2 as an experiment and
then removed in 5.3. It will come again in 5.4, this time probably to
stay.</p>
</div>

<p>Ierusalimschy gave a talk in 2019 (<a
href="https://www.lua.org/wshop18/Ierusalimschy.pdf">PDF slides</a> and <a
href="https://www.youtube.com/watch?v=wGizKsOJQuE">YouTube video</a>) that
goes into more detail about how incremental GC works, as well as why the
5.2 generational GC didn't perform that well, and what the Lua team replaced
it with. In 5.2's version, objects only had to survive a single GC cycle
(collector pass) before becoming "old", but in 5.4 they have to survive two
GC cycles, which is a more accurate model for real-world Lua programs. The
two-cycle approach is more complicated to implement but gives better GC
performance for many programs &mdash; though not all. Ierusalimschy notes
that programs which build large data structures won't
benefit. Possibly for that reason, the Lua team didn't change the default:
in 5.4 the default is still to use the incremental collector; a
developer needs to add "<tt>collectgarbage("generational")</tt>" to their
program in order to turn on
the generational GC.</p>

<p>On the lua-l mailing list, Gé Weijers <a
href="http://lua-users.org/lists/lua-l/2019-06/msg00169.html">described</a>
how the generational GC, with its "minor collections" (frequent GC passes
to collect young objects) ties into the new <tt>&lt;close&gt;</tt> feature
(which used to be called "<tt>toclose</tt>"):</p>

<div class="BigQuote">
<p>The garbage collector in 5.4 implements a generational mode. If an
object survives the minor collections it may take a very, very long time
before its __gc metamethod gets called after is becomes inaccessible,
especially if your program mostly creates short lived objects. This makes
__gc less useful as a poor man's RAII replacement.</p>

<p>The new "toclose" feature is much more useful to release resources and
unlock locks in a timely matter.</p>
</div>

<h4>Faster</h4>

<p>One of the unsung features in 5.4, is a significantly faster
interpreter, though the release notes have overlooked it. In a test I did
on my 64-bit macOS machine using Gabriel de 
Quadros Ligneul's <a
href="https://github.com/gligneul/Lua-Benchmarks">Lua Benchmarks</a> suite,
I found that version 5.4 was an average of 40% faster than version 5.3
across 11 benchmarks included in the suite:</p>

<img src="/images/lua-54-benchmark.png"
alt="[Lua benchmarks]" title="Lua benchmarks">

<p>Similar gains are shown in Elmar Klausmeier's <a
href="https://eklausmeier.wordpress.com/2020/05/14/performance-comparison-pallene-vs-lua-5-1-5-2-5-3-5-4-vs-c/">performance
comparison</a>. Admittedly, both of these are rather artificial benchmarks
&mdash; when using Lua in something like a game engine,
performance-sensitive code like graphics or matrix multiplication will no
doubt be written in C. Still, an improvement of this magnitude for
number-centric code (which most of these benchmarks are) is not to be
scoffed at. Dibyendu Majumdar <a
href="http://lua-users.org/lists/lua-l/2018-03/msg00404.html">described</a>
some of the reasons for these improvements on the lua-l mailing list back
in 2018:
5.4 added new and
optimized bytecode instructions for numeric operations that Lua's
parser can use when it can infer that the types involved are numbers. For
example, <tt>GETI</tt> and <tt>SETI</tt> are two new instructions that are used for
table lookups when the index is a constant integer.
</p>

<p>Those who need much higher performance can use Mike Pall's <a
href="https://luajit.org/">LuaJIT</a>, a just-in-time compiler for Lua 5.1
that is <a href="https://luajit.org/performance_arm.html">significantly
faster</a> than the stock Lua interpreter. However, LuaJIT hasn't added any
of Lua's new features since version 5.1 (which was released in 2006). Doing so would be <a
href="https://news.ycombinator.com/item?id=9985074">quite an
undertaking</a> due to many breaking changes, including new scoping rules
in 5.2 and the new integer type in 5.3. For this reason, Pall
has been a <a
href="https://www.freelists.org/post/luajit/Port-bitop-to-53,1">vocal
critic</a> of the backward-incompatible changes that the Lua team makes.</p>

<p>This does seem to be a real problem, and not only with obscure edge
cases: two of the benchmarks in the  Lua Benchmarks suite failed in
5.4 with a "C stack overflow" error (though they work fine in 5.3), so I had to
remove them before running it. The <tt><a
href="https://github.com/gligneul/Lua-Benchmarks/blob/master/ack.lua">ack</a></tt>
and <tt><a
href="https://github.com/gligneul/Lua-Benchmarks/blob/master/fixpoint-fact.lua">fixpoint-fact</a></tt>
benchmarks fail, presumably due to different handling of recursive tail
calls in 5.4. Most of the incompatibilities in 5.4 are <a
href="https://www.lua.org/manual/5.4/manual.html#8">documented</a>, but
 the length of that list may still cause a fair bit of pain for
those trying to upgrade large Lua scripts. My guess is that this is why
tools that need long-term stability, like Redis and World of Warcraft, lock in a specific older
version of Lua (in the case of both of those, version 5.1).  It seems like
there's something of a split in the community, 
with some who stick to 5.1 because it has a JIT compiler and because the changes
since then are relatively minor.</p>

<p>Incompatibilities between Lua versions may also contribute to the
problem of Lua not having a unified standard library, which LWN <a
href="https://lwn.net/Articles/812122/">wrote about</a> back in
February. If a library author has to do a bunch of work to upgrade when a
new Lua version comes out, they may be less likely to keep it up to date.
That makes it more likely that someone will create a fork that works on the new
Lua version or simply write a new library.</p>

<h4>Smaller changes</h4>

<p>In addition to the larger changes, Lua 5.4 adds many smaller features,
including a new random number generator using the <a
href="https://en.wikipedia.org/wiki/Xorshift#xoshiro256**">xoshiro256**</a>
algorithm instead of using the underlying C library's <tt>rand()</tt>
function.  There is now a simple <a
href="https://www.lua.org/manual/5.4/manual.html#pdf-warn">warning
system</a> used when there's an error in a finalizer or <tt>__close()</tt>
method.  Also added is the ability for Lua values with "<a
href="https://www.lua.org/manual/5.4/manual.html#2.1">userdata</a>" to have
multiple user values (userdata is a pointer to a memory block created with
the Lua C API, so this feature allows objects created by C extensions to
have multiple memory blocks associated with them).</p>

<p>There were some minor changes in semantics as well: <a
href="https://github.com/pallene-lang/pallene/issues/170">slightly
different handling</a> of edge cases with wrap-around in <tt>for</tt>
loops and <a
href="http://lua-users.org/lists/lua-l/2018-01/msg00020.html">adjustment</a>
of string-to-number coercion for integers (for example, <tt>"10"+1</tt> is
the integer <tt>11</tt> in 5.4, but the floating-point number <tt>11.0</tt>
in 5.3).</p>

<p>Overall, Lua seems like a good language for its domain (embedding into
larger systems or 
applications); the release of 5.4 shows that it is receiving continual
improvements from the core team. Lua has <a
href="https://www.lua.org/faq.html#1.4">no clear roadmap</a>, so it's hard
to know at this early stage what changes are being planned for 5.5, or when
it is likely to be released (Lua developer Pierre Chapuis even <a
href="https://www.quora.com/What-is-the-future-of-Lua/answer/Pierre-Chapuis">speculates</a>
the next version may be "<span>a very impacting change</span>" with a 6.0
version number). In any event, the new features in 5.4 will probably be
fairly minor for most users, but the performance improvements will prove to
be a nice
win.</p>
