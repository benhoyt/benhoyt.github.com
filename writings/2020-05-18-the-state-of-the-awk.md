---
layout: default
title: "The state of the AWK"
permalink: /writings/the-state-of-the-awk/
description: "A look at the state of AWK in 2020, as well as new features in Gawk 5.1 (since 4.0)."
canonical_url: https://lwn.net/Articles/820829/
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">May 2020</p>

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
}
</style>


<p>AWK is a text-processing language with a history spanning more than&nbsp;40
years. It has a <a
href="https://pubs.opengroup.org/onlinepubs/9699919799/utilities/awk.html">POSIX
standard</a>, several conforming implementations, and is still surprisingly relevant in 2020 &mdash; 
both for simple text processing tasks and for wrangling "big data".  The
recent
<a
href="https://lists.gnu.org/archive/html/info-gnu/2020-04/msg00007.html">release</a>
of 
GNU Awk&nbsp;5.1 seems like a good reason to survey the AWK landscape, see
what GNU Awk has been up to, and look at where AWK is being used these days.</p>

<p>The language was created at Bell Labs in 1977. Its name comes from the
initials of the original authors: Alfred Aho, Peter Weinberger, and Brian
Kernighan. A Unix tool to the core, AWK is designed to do one thing well:
to filter and transform lines of text. It's commonly used to parse fields
from log files, transform output from other tools, and count occurrences of
words and fields. Aho <a
href="https://www.computerworld.com/article/2535126/the-a-z-of-programming-languages--awk.html">summarized</a>
AWK's functionality succinctly:</p>

<div class="BigQuote">
<p>AWK reads the input a line at a time. A line is scanned for each pattern
in the program, and for each pattern that matches, the associated action is
executed.</p> 
</div>

<p>AWK programs are often one-liners executed directly from the command
line. For example, to calculate the average response time of GET requests
from some hypothetical web server log, you might type:</p>

<pre>
    $ awk '/GET/ { total += $6; n++ } END { print total/n }' server.log 
    0.0186667
</pre>

<p>This means: for all lines matching the regular expression
<tt>/GET/</tt>, add up the response time (the sixth field or&nbsp;<tt>$6</tt>) and count the
line; at the end, print out the arithmetic mean of the response times.</p>


<h4>The various AWK versions</h4>

<p>There are three main versions of AWK in use today, and all of them
conform to the POSIX standard (closely enough, at least, for the vast
majority of use cases). The first is classic <tt>awk</tt>, the version of
AWK described by Aho, Weinberger, and Kernighan in their book <a
href="https://9p.io/cm/cs/awkbook/index.html"><i>The AWK Programming
Language</i></a>. It's sometimes called "new AWK" (<tt>nawk</tt>) or "one
true AWK", and it's now hosted <a
href="https://github.com/onetrueawk/awk">on GitHub</a>. This is the version
pre-installed on many BSD-based systems, including macOS (though the
version that comes with macOS is out of date, and worth upgrading).</p>

<p>The second is <a href="https://www.gnu.org/software/gawk/">GNU Awk
(gawk)</a>, which is by far the most
featureful and actively maintained version. Gawk is usually pre-installed
on Linux systems and is often the default <tt>awk</tt>. It is easy to
install on macOS <a href="https://formulae.brew.sh/formula/gawk">using
Homebrew</a> and <a
href="https://sourceforge.net/projects/ezwinports/">Windows binaries</a>
are available as well. Arnold Robbins has been the primary maintainer of
gawk since 1994, and continues to shepherd the language (he has also
contributed many fixes to the classic <tt>awk</tt> version). Gawk has <a
href="https://www.gnu.org/software/gawk/manual/html_node/Feature-History.html">many
features</a> not present in <tt>awk</tt> or the POSIX standard, including
new functions, networking facilities, a C extension API, a profiler and
debugger, and most recently, namespaces.</p>

<p>The third common version is <a
href="https://invisible-island.net/mawk/"><tt>mawk</tt></a>, written by
Michael Brennan. It is the default <tt>awk</tt> on Ubuntu and Debian Linux,
and is still the fastest version of AWK, with a bytecode compiler and a
more memory-efficient value representation. (Gawk has also had a bytecode
compiler since&nbsp;4.0, so it's now much closer to mawk's speed.)</p>

<p>If you want to use AWK for one-liners and basic text processing, any of
the above are fine variants. If you're thinking of using it for a larger
script or program, Gawk's features make it the sensible choice.</p>

<p>There are also several other implementations of AWK with varying levels
of maturity and maintenance, notably the size-optimized <a
href="https://git.busybox.net/busybox/tree/editors/awk.c">BusyBox
version</a> used in embedded Linux environments, a <a
href="http://jawk.sourceforge.net/">Java rewrite</a> with runtime access to
Java language features, and my own <a
href="https://github.com/benhoyt/goawk">GoAWK</a>, a POSIX-compliant
version written in Go. The three main AWKs and the BusyBox version are
all written in C.</p>


<h4>Gawk changes since 4.0</h4>

<p>It's been almost 10 years since LWN <a
href="https://lwn.net/Articles/450631/">covered</a> the release of gawk
4.0. It would be tempting to say "much has changed since 2011", but the
truth is that things move relatively slowly in the AWK world. I'll describe
the notable features since&nbsp;4.0 here, but for more details you can read the
full <a
href="http://git.savannah.gnu.org/cgit/gawk.git/tree/NEWS.1">4.x</a> and <a
href="http://git.savannah.gnu.org/cgit/gawk.git/tree/NEWS">5.x</a>
changelogs. Gawk&nbsp;5.1.0 came out just over a
month ago on April&nbsp;14.</p>

<p>The biggest user-facing feature is the introduction of namespaces in
5.0. Most modern languages have some concept of namespaces to make it
easier to ship large projects and libraries without name clashes. Gawk&nbsp;5.0
adds namespaces in a backward-compatible way, allowing developers to
create libraries, such as this toy math library:</p>

<pre>
    # area.awk
    @namespace "area"

    BEGIN {
        pi = 3.14159  # namespaced "constant"
    }

    function circle(radius) {
        return pi*radius*radius
    }
</pre>

<p>To refer to variables or functions in the library, use the
<tt>namespace::name</tt> syntax, similar to C++:</p>

<pre>
    $ gawk -f area.awk -e 'BEGIN { print area::pi, area::circle(10) }'
    3.14159 314.159
</pre>

<p>Robbins <a
href="http://www.skeeve.com/awk-sys-prog.html#Key-Reasons-Why-Other-Languages-Have-Gained-Popularity">believes</a>
that AWK's lack of namespaces is one of the key reasons it hasn't caught on
as a larger-scale programming language and that this feature in gawk&nbsp;5.0
may help resolve that.
The other major issue Robbins believes is holding AWK back is the lack
of a good C extension interface.  Gawk's <a
href="https://www.gnu.org/software/gawk/manual/html_node/Dynamic-Extensions.html">dynamic
extension interface</a> was completely revamped in&nbsp;4.1; it now has a
defined API and allows wrapping
existing C and C++ libraries so they can be  easily called from AWK.</p>

<p>The following code snippet from the <a
href="https://www.gnu.org/software/gawk/manual/html_node/Internal-File-Ops.html">example</a>
C-code wrapper 
in the user
manual populates an AWK array (a string-keyed hash table) with
a filename and values from a <tt>stat()</tt> system call:</p>

<pre>
    /* empty out the array */
    clear_array(array);

    /* fill in the array */
    array_set(array, "name", make_const_string(name, strlen(name), &amp;tmp));
    array_set_numeric(array, "dev", sbuf-&gt;st_dev);
    array_set_numeric(array, "ino", sbuf-&gt;st_ino);
    array_set_numeric(array, "mode", sbuf-&gt;st_mode);
</pre>

<p>Another change in the&nbsp;4.2 release (and continued in&nbsp;5.0) was an
overhauled source code pretty-printer. Gawk's pretty-printer enables its
use as a standardized AWK code formatter, similar to Go's <a
href="https://golang.org/cmd/gofmt/"><tt>go fmt</tt></a> tool and Python's
<a href="https://github.com/psf/black">Black</a> formatter. For example,
to pretty-print the 
<tt>area.awk</tt> file from above:</p>
<pre>
    $ gawk --pretty-print -f area.awk
</pre>
which results in the following output:
<pre>
    @namespace "area"

    BEGIN {
        pi = 3.14159    # namespaced "constant"
    }


    function circle(radius)
    {
        return (pi * radius * radius)
    }
</pre>

<p>You may question the tool's choices: why does "<tt>BEGIN {</tt>" not have
a line break before the "<tt>{</tt>" when the <tt>function</tt> does? (It
turns out AWK syntax doesn't allow that.) Why two blank lines before the
function and parentheses around the <tt>return</tt> expression?
But at least it's consistent and may help avoid code-style debates.</p>

<p>Gawk allows a limited amount of <a
href="https://www.gnu.org/software/gawk/manual/html_node/Type-Functions.html">runtime
type inspection</a>, and extended that with the addition of the
<tt>typeof()</tt> function in&nbsp;4.2. <tt>typeof()</tt> returns a string
constant like "<tt>string</tt>", "<tt>number</tt>", or "<tt>array</tt>" depending
on the input type. These functions are important for code that recursively
walks every item of a nested array, for example (which is something that POSIX AWK can't do).</p>

<p>With&nbsp;4.2, gawk also supports <a
href="https://www.gnu.org/software/gawk/manual/html_node/Strong-Regexp-Constants.html">regular
expression constants</a> as a first-class data type using the syntax
<tt>@/foo/</tt>. Previously you could not store a regular expression constant in a
variable; <tt>typeof(@/foo/)</tt> returns the string "<tt>regexp</tt>". In
terms of performance, gawk&nbsp;4.2 brings a significant improvement on 
Linux systems by using <a
href="http://man7.org/linux/man-pages/man3/unlocked_stdio.3.html"><tt>fwrite_unlocked()</tt></a>
when it's available. As gawk is single-threaded, it can use the non-locking
stdio functions, giving a 7-18% increase in raw output speed &mdash; for
example <tt>gawk&nbsp;'{&nbsp;print&nbsp;}'</tt> on a large file.</p>

<p>The <a href="https://www.gnu.org/software/gawk/manual/gawk.html">GNU Awk
User's Guide</a> has always been a thorough reference, but it was
substantially updated in&nbsp;4.1 and again in the&nbsp;5.x releases, including new
examples, summary sections, and exercises, along with some major copy editing.</p>

<p>Last (and also least), a subtle change in&nbsp;4.0 that I found amusing was
the reverted handling of backslash in <tt>sub()</tt> and
<tt>gsub()</tt>. Robbins <a
href="http://git.savannah.gnu.org/cgit/gawk.git/tree/NEWS.1#n367">writes</a>:</p>

<div class="BigQuote">
<p>The default handling of backslash in sub() and gsub() has been reverted to
the behavior of 3.1. It was silly to think I could break compatibility that
way, even for standards compliance.</p> 
</div>

<p>The <a
href="https://www.gnu.org/software/gawk/manual/html_node/String-Functions.html#index-sub_0028_0029-function-1"><tt>sub</tt>
and <tt>gsub</tt> functions</a> are core regular expression substitution functions, and
even a small "fix" to the <a
href="https://www.gnu.org/software/gawk/manual/html_node/Gory-Details.html">complicated
handling of backslash</a> broke people's code:</p>

<div class="BigQuote">
When version&nbsp;4.0.0 was released, the gawk maintainer made the POSIX
rules the default, breaking well over a decade’s worth of backward
compatibility. Needless to say, this was a bad idea, and as of version
4.0.1, gawk resumed its historical behavior, and only follows the POSIX
rules when <tt>--posix</tt> is given.
</div>

<p>Robbins may have had a small slip in judgment with the original change,
but it's obvious he takes backward compatibility seriously. Especially for
a popular tool like gawk, sometimes it is better to continue breaking the
specification than change how something has always worked.</p>


<h4>Is AWK still relevant?</h4>

<p>Asking if AWK is still relevant is a bit like asking if air is still
relevant: you may not see it, but it's all around you. Many Linux
administrators and DevOps engineers use it to transform data or diagnose
issues via log files. A version of AWK is installed on almost all
Unix-based machines. In addition to ad-hoc usage, many large open-source projects use AWK
somewhere in their build or documentation tooling. To name just a few
examples: the Linux kernel uses it in the x86 tooling to <a
href="https://github.com/torvalds/linux/blob/b9bbe6ed63b2b9f2c9ee5cbd0f2c946a2723f4ce/arch/x86/tools/chkobjdump.awk">check</a>
and <a
href="https://github.com/torvalds/linux/blob/b9bbe6ed63b2b9f2c9ee5cbd0f2c946a2723f4ce/arch/x86/tools/objdump_reformat.awk">reformat</a>
objdump files, Neovim uses it to <a
href="https://github.com/neovim/neovim/blob/a91ce497b4f4d6c68e3009e5219d6b2ae0f63f7f/runtime/doc/makehtml.awk">generate
documentation</a>, and FFmpeg uses it for <a
href="https://github.com/FFmpeg/FFmpeg/search?q=awk">building and
testing.</a></p>

<p>AWK build scripts are surprisingly hard to kill, even when people want
to: in 2018 LWN <a href="https://lwn.net/Articles/760702/">wrote</a> about
GCC contributors wanting to replace AWK with Python in the scripts that
generate its option-parsing code. There was some support for this proposal
at the time, but apparently no one volunteered to do the actual porting,
and the AWK scripts <a
href="https://github.com/gcc-mirror/gcc/blob/03d549090e3551eb3c4a41a5d63a76cff7112c7b/gcc/opt-functions.awk">live
on</a>.</p>

<p>Robbins argues in his <a
href="http://www.skeeve.com/awk-sys-prog.html">2018 paper</a> for the use
of AWK (specifically gawk) as a "systems programming language", in this
context meaning a language for writing larger tools and programs. He
outlines the reasons he thinks it has not caught on, but Kernighan
is "<a href="http://www.skeeve.com/awk-sys-prog.html#Counterpoints">not
100% convinced</a>" that the lack of an extension mechanism is the main reason
AWK isn't widely used for larger programs.  He suggested that it might be
due to the lack of built-in support for access to system calls and the like.
But none of that has stopped several
people from building larger tools: Robbins' own <a
href="https://github.com/arnoldrobbins/texiwebjr">TexiWeb Jr.</a> literate
programming tool (1300 lines of AWK), Werner Stoop's <a
href="https://github.com/wernsey/d.awk">d.awk</a> tool that generates
documentation from Markdown comments in source code (800 lines), and <a
href="https://github.com/soimort/translate-shell">Translate Shell</a>, a
6000-line AWK tool that provides a fairly powerful command-line interface
to cloud-based translation APIs.</p>

<p>Several developers in the last few years have written about using AWK in
their "big data" toolkit as a much simpler (and sometimes faster) tool
than heavy distributed computing systems such as Spark and Hadoop. Nick
Strayer <a
href="https://livefreeordichotomize.com/2019/06/04/using_awk_and_r_to_parse_25tb/">wrote</a>
about using 
AWK and R to parse 25 terabytes of data across multiple cores. Other
big data examples are the tantalizingly-titled <a
href="https://adamdrake.com/command-line-tools-can-be-235x-faster-than-your-hadoop-cluster.html">article</a> by Adam Drake, "Command-line
Tools can be 235x Faster than your Hadoop Cluster", and Brendan
O'Connor's "<a
href="https://brenocon.com/blog/2009/09/dont-mawk-awk-the-fastest-and-most-elegant-big-data-munging-language/">Don’t
MAWK AWK – the fastest and most elegant big data munging language!</a>"</p>

<p>Between ad-hoc text munging, build tooling, "systems programming", and
big data processing &mdash; not to mention <a
href="https://github.com/TheMozg/awk-raycaster">text-mode first person
shooters</a> &mdash; it seems that AWK is alive and well in 2020.</p>

<p>
[Thanks to Arnold Robbins for reviewing a draft of this article.]