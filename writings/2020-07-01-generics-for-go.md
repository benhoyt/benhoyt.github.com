---
layout: default
title: "Generics for Go"
permalink: /writings/generics-for-go/
description: "Generics for Go: some background, the current state, and potential timeline for including generics in the Go programming language."
canonical_url: https://lwn.net/Articles/824716/
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


<p>The <a href="https://golang.org/">Go programming language</a> came out
in 2009, with a 1.0 release in March 2012. Even before the 1.0 release,
some developers criticized the language as being too simplistic, partly due
to its lack of user-defined <a
href="https://en.wikipedia.org/wiki/Generic_programming">generic
types</a>. Despite this lack, in recent years Go has been 
widely used, with an <a
href="https://research.swtch.com/gophercount">estimated</a> 1-2 million
developers worldwide. Over the years there have been several proposals to
add some form of generics to the language, but the <a
href="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md">recent
proposal</a> written by core developers Ian Lance Taylor and Robert
Griesemer looks likely to be included in a future version of Go.</p>


<h4>Background</h4>

<p>Go is a statically-typed language, meaning that  types are specified in the
source code (or inferred from it) and checked by the compiler. The compiler
produces optimized machine code, so CPU-intensive code is significantly
more efficient than languages like Python or Ruby, which have bytecode
compilers and use virtual machines for execution.</p>

<p>Generics, also known as "parameterized types" or "parametric
polymorphism", are a way to write code or build data structures
that will work for any data type; the code or data structure can be 
instantiated to process each different data type, without having to
duplicate code. They're useful when writing generalized algorithms like
sorting and searching, as well as type-independent data structures like
trees, thread-safe maps, and so on. For example, a developer might write a
generic <tt>min()</tt> function that works on all integer types and
floating point types, or create a binary tree that can associate a key type
to a value type (and work with strings, integers, or user-defined
types). With generics, you can write this kind of code without any
duplication, and the compiler will still statically check the types.</p>

<p>Like
the first versions of Java, Go doesn't ship with user-defined generics. As
the Go FAQ <a href="https://golang.org/doc/faq#generics">notes</a>,
generics "<span>may well be added at some point</span>"; it also describes
how leaving them out was an intentional trade-off:</p>

<div class="BigQuote">
<p>Generics are convenient but they come at a cost
in complexity in the type system and run-time. We haven't yet found a
design that gives value proportionate to the complexity, although we
continue to think about it. Meanwhile, Go's built-in maps and slices, plus
the ability to use the empty interface to construct containers (with
explicit unboxing) mean in many cases it is possible to write code that
does what generics would enable, if less smoothly.</p>
</div>

<p>Part of the reason actual users of the language don't complain loudly
about this lack is that Go does include generics for the built-in container
types, specifically slices (Go's growable array type), maps (hash tables),
and channels (thread-safe communication queues). For example, a developer
writing blog software might write a function to fetch a list of articles or
a mapping of author ID to author information:</p>

<pre>
    // takes ID, returns "slice of Article" (compiler checks types)
    func GetLatestArticles(num int) []Article {
        ...
    }

    // takes "slice of int" of IDs, returns "map of int IDs to Author"
    func GetAuthors(authorIDs []int) map[int]Author {
        ...
    }
</pre>

<p>Built-in functions like <tt><a
href="https://golang.org/pkg/builtin/#len">len()</a></tt> and <tt><a
href="https://golang.org/pkg/builtin/#append">append()</a></tt> work on
these container types, though there's no way for a developer to define
their own equivalents of those generic built-in functions. As many Go
developers will attest, having built-in versions of growable arrays and
maps that are parameterized by type goes a long way, even without
user-defined generic types.</p>

<p>In addition, Go has support for interfaces and closures, two features
that are often used instead of generics, or to work around their lack. For
example, sorting in Go is done using the <tt><a
href="https://golang.org/pkg/sort/#Interface">sort.Interface</a></tt> type,
which is an interface requiring three methods:</p>

<pre>
    type Interface interface {
        Len() int           // length of this collection
        Less(i, j int) bool // true if i'th element &lt; j'th element
        Swap(i, j int)      // swap i'th and j'th elements
    }
</pre>

<p>If a user-defined collection implements this interface, it is sortable
using the standard library's <tt><a
href="https://golang.org/pkg/sort/#Sort">sort.Sort()</a></tt>
function. Since Go 1.8, developers can use <tt><a
href="https://golang.org/pkg/sort/#Slice">sort.Slice()</a></tt> and pass in
a "less-than closure" rather than implementing the full sorting interface,
for example:</p>

<pre>
    people := []struct {
        Name string
        Age  int
    }{
        {"Gopher", 7},
        {"Alice", 55},
        {"Vera", 24},
        {"Bob", 75},
    }
    
    sort.Slice(
        people,
        func(i, j int) bool { // i and j are the two slice indices
            return people[i].Name &lt; people[j].Name
        },
    )
</pre>

<p>There are other ways to work around Go's lack of generics, such as
creating container types that use <tt>interface{}</tt> (the "empty
interface"). This effectively <a
href="https://en.wikipedia.org/wiki/Object_type_(object-oriented_programming)#Boxing">boxes</a>
every value inserted into the collection, and requires run-time type
assertions, so it is neither particularly efficient nor type-safe. However,
it works and is pragmatic; even some standard library types like <tt><a
href="https://golang.org/pkg/sync/#Map">sync.Map</a></tt> use this
approach.</p>

<p>Some developers go so far as to argue generics shouldn't be added to Go at
all, since they will bring too much complexity. For example, Greg
Hall <a href="https://dzone.com/articles/go-doesnt-need-generics">hopes</a>
"<span>that Go never has generics, or if it does, the designers find some
way to avoid the complexity and difficulties I have seen in both Java
generics and C++ templates</span>".</p>

<p>The Go team takes the complexity issue seriously. As core developer
Russ Cox states in his 2009 article "<a
href="https://research.swtch.com/generic">The Generic Dilemma</a>":</p>

<div class="BigQuote">
<p>It seems like there are three basic approaches to generics:</p>
<ol>
    <li>(The C approach.) Leave them out. This slows programmers. But it
    adds no complexity to the language.</li> 
    <li>(The C++ approach.) Compile-time specialization or macro
    expansion. This slows compilation. It generates a lot of code, much of
    it redundant, and needs a good linker to eliminate duplicate
    copies. [...]</li> 
    <li>(The Java approach.) Box everything implicitly. This slows
    execution. [...]</li>
</ol>
<p>The generic dilemma is this: <i>do you want slow programmers, slow
compilers and bloated binaries, or slow execution times?</i></p> 
</div>

<p>Still, many Go developers are asking for generics, and there has been a
<a
href="https://docs.google.com/document/d/1vrAy9gMpMoS3uaVphB32uVXX4pi-HnNjkMEgyAHX4N4/edit">huge
amount of discussion</a> over the years on the best way to add them in a
Go-like way. Several developers have provided thoughtful rationale in "<a
href="https://github.com/golang/go/wiki/ExperienceReports#generics">experience
reports</a>" from their own usage of Go.</p>

<p>Taylor's official Go blog entry "<a
href="https://blog.golang.org/why-generics">Why Generics?</a>" details what
adding generics will bring to Go, and lists the guidelines the Go team is
following when adding them. Notably, it wants to "<span>preserve clarity
and simplicity of Go</span>":</p> 

<div class="BigQuote">
<p>Most importantly, Go today is a simple language. Go programs are usually
clear and easy to understand. A major part of our long process of exploring
this space has been trying to understand how to add generics while
preserving that clarity and simplicity. We need to find mechanisms that fit
well into the existing language, without turning it into something quite
different.</p>

<p>These guidelines should apply to any generics implementation in
Go. That's the most important message I want to leave you with today:
generics can bring a significant benefit to the language, but they are only
worth doing if Go still feels like Go.</p> 
</div>


<h4>The recent proposal</h4>

<p>Taylor, in particular, has been prolific on the subject of adding
generics to Go, having written no
fewer than six proposals. The first four, written from 2010 through 2013,
are listed at the bottom of his document, "<a
href="https://go.googlesource.com/proposal/+/master/design/15292-generics.md">Go
should have generics</a>".  About them, he notes: "<span>all are
flawed in various ways</span>".</p> 

<p>In July 2019 he posted the "Why Generics?" blog article mentioned above,
which links to the <a
href="https://go.googlesource.com/proposal/+/master/design/go2draft-contracts.md">lengthy
2019 proposal</a> written by Taylor and Griesemer for a version of generics
based on "contracts".</p> 

<p>Almost a year later, in June 2020, Taylor and Griesemer published a <a
href="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md">revised
and simplified proposal</a> that avoids adding contracts. In Taylor's <a
href="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md#what-happened-to-contracts">words</a>:</p>

<div class="BigQuote">
<p>An earlier draft design of generics implemented constraints using a new
language construct called contracts. Type lists appeared only in contracts,
rather than on interface types. However, many people had a hard time
understanding the difference between contracts and interface types. It also
turned out that contracts could be represented as a set of corresponding
interfaces; thus there was no loss in expressive power without
contracts. We decided to simplify the approach to use only interface
types.</p> 
</div>

<p>The removal of contracts comes in part based on work by Philip Wadler
and his collaborators in their May 2020 paper, "<a
href="https://arxiv.org/pdf/2005.11710.pdf">Featherweight Go [PDF]</a>" (<a
href="https://www.youtube.com/watch?v=Dq0WFigax_c">video
presentation</a>). Wadler is a type theorist who has contributed to the
design of Haskell, and was involved in adding generics to Java back in
2004. Rob Pike, one of Go's creators, had asked Wadler if he would
"<span>be interested in helping us get polymorphism right (and/or figuring
out what 'right' means) for some future version of Go</span>"; this
paper is the response to Pike's request.</p> 

<p>The 2020 proposal suggests adding optional type parameters to functions
and types, allowing generic algorithms and generic container types,
respectively. Here is an example of what a generic function looks like
under this proposal:</p> 

<pre>
    // Stringify calls the String method on each element of s,
    // and returns the results.
    func Stringify(type T Stringer)(slice []T) []string {
        var ret []string
        for _, v := range slice {
            ret = append(ret, v.String())
        }
        return ret
    }

    // Stringer is a type constraint that requires the type argument to have
    // a String method and permits the generic function to call String.
    // The String method should return a string representation of the value.
    type Stringer interface {
        String() string
    }
</pre>

<p>The type parameter is <tt>T</tt> (an arbitrary name), specified in the
extra set of parentheses after the function name, along with the
<tt>Stringer</tt> constraint: <tt>type T Stringer</tt>. The actual
arguments to the function are in the second set of parentheses, <tt>slice
[]T</tt>. Writing functions like this is not currently possible in Go; it
<a href="https://golang.org/doc/faq#convert_slice_of_interface">does not
allow</a> passing a slice of a concrete type to a function that accepts a
slice of an interface type (e.g., <tt>Stringer</tt>).</p>

<p>In addition to generic functions, the new proposal also supports
parameterization of types, to support type-safe collections such as binary
trees, graph data structures, and so on. Here is what a generic
<tt>Vector</tt> type might look like:</p> 

<pre>
    // Vector is a name for a slice of any element type.
    type Vector(type T) []T

    // Push adds a value to the end of a vector.
    func (v *Vector(T)) Push(x T) {
        *v = append(*v, x)
    }

    // v is a Vector of Authors
    var v Vector(Author)
    v.Push(Author{Name: "Ben Hoyt"})
</pre>

<p>Because Go doesn't support operator overloading or define operators in
terms of methods, there's no way to use interface constraints to specify
that a type must support the <tt>&lt;</tt> operator (as an example). In the
proposal, this is done using a new feature called "type lists", an example
of which is shown below:</p> 

<pre>
    // Ordered is a type constraint that matches any ordered type.
    // An ordered type is one that supports the &lt;, &lt;=, &gt;, and &gt;= operators.
    type Ordered interface {
        type int, int8, int16, int32, int64,
            uint, uint8, uint16, uint32, uint64, uintptr,
            float32, float64,
            string
    }
</pre>

<p>In practice, a <tt>constraints</tt> package would probably be added to
the standard library which pre-defined common constraints like
<tt>Ordered</tt>. Type lists allow developers to write generic functions
that use built-in operators:</p> 

<pre>
    // Smallest returns the smallest element in a slice of "Ordered" values.
    func Smallest(type T Ordered)(s []T) T {
        r := s[0]
        for _, v := range s[1:] {
            if v &lt; r { // works due to the "Ordered" constraint
                r = v
            }
        }
        return r
    }
</pre>

<p>The one constraint that can't be written as a type list is for the
<tt>==</tt> and <tt>!=</tt> operators, because Go allows comparing structs,
arrays, and interface types for equality. To solve this, the proposal
suggests adding a built-in <tt>comparable</tt> constraint to allow equality
operators. This would be useful, for example, in a function that finds the
index of a value in a slice or array:</p> 

<pre>
    // Index returns the index of x in s, or -1 if not found.
    func Index(type T comparable)(s []T, x T) int {
        for i, v := range s {
            // v and x are type T, which has the comparable
            // constraint, so we can use == here.
            if v == x {
                return i
            }
        }
        return -1
    }
</pre>

<p>Taylor and Griesemer have developed an experimentation tool (on the <a
href="https://go.googlesource.com/go/+/refs/heads/dev.go2go">go2go</a>
branch) that converts the Go code as specified in this proposal to
normal Go code, allowing developers to compile and run generic code
today. There's even a version of the Go playground that lets people share
and run code written under this proposal online &mdash; for example, here
is a <a href="https://go2goplay.golang.org/p/JpJ3UNHFudD">working
example</a> of the <tt>Stringify</tt> function above.</p> 

<p>The Go team is asking developers to try to solve their own problems with
the generics experimentation tool and send detailed feedback in response to
the following questions:</p> 

<div class="BigQuote">
<p>First, does generic code make sense? Does it feel like Go? What
surprises do people encounter? Are the error messages useful?</p>

<p>Second, we know that many people have said that Go needs generics, but
we don't necessarily know exactly what that means. Does this draft design
address the problem in a useful way? If there is a problem that makes you
think "I could solve this if Go had generics," can you solve the problem
when using this tool?</p> 
</div>


<h4>Discussion</h4>

<p>There has been a lot of public discussion about generics on the main <a
href="https://groups.google.com/forum/#!forum/golang-nuts">golang-nuts</a>
mailing list since the latest proposal was published, as well as on <a
href="https://news.ycombinator.com/item?id=23543131">Hacker News</a> and <a
href="https://www.reddit.com/r/golang/comments/haaz5w/the_next_step_for_generics_the_go_blog/">reddit.com/r/golang</a>
threads.</p> 

<p>As Pike <a href="https://youtu.be/RIvL2ONhFBI?t=1989">said [YouTube]</a> last
year, "syntax is not the problem, at least not yet", however,
many of the threads on the mailing list have been immediately critical of
the syntax. Admittedly, the syntax is unusual, and it adds another set of
(round) parentheses to Go, which is already known for having lots of
parentheses (for example, Go's method definitions use one set for the
method's receiver type, and another for the method's arguments). The
proposal tries to preempt the syntax bikeshedding with an <a
href="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md#why-not-use-the-syntax-like-c_and-java">explanation</a>
of why they chose parentheses instead of angle brackets:</p> 

<div class="BigQuote">
<p>When parsing code within a function, such as <tt>v := F&lt;T&gt;</tt>,
at the point of seeing the <tt>&lt;</tt> it's ambiguous whether we are
seeing a type instantiation or an expression using the <tt>&lt;</tt>
operator. Resolving that requires effectively unbounded lookahead. In
general we strive to keep the Go parser efficient.</p> 
</div>

<p>Most responders on the mailing list are proposing the use of angle
brackets like C++, Java, and C#, for example, using <tt>List&lt;T&gt;</tt>
instead of <tt>List(T)</tt>. Taylor is much more interested in whether the
semantics of the new proposal make sense, but has been patiently replying
to each of these syntax threads with something like the following:</p> 

<div class="BigQuote">
<p>Let's see what real code looks like with the suggested syntax, before
we worry about alternatives. Thanks.</p> 
</div>

<p>This has happened so many times that one mailing list contributor, Tyler
Compton, compiled a <a
href="https://groups.google.com/g/golang-nuts/c/uQDrcHDwT_w/m/Y-Myzuw_AQAJ">helpful
list</a> of all the syntax-related threads.</p> 

<p>Generics will help eliminate types and functions repeated for multiple
types, for example <tt>sort.Ints</tt>, <tt>sort.Float64s</tt>, and
<tt>sort.Strings</tt> in the <a
href="https://golang.org/pkg/sort/">sort</a> package. In a <a
href="https://news.ycombinator.com/item?id=23544977">comment</a> on Hacker
News, Kyle Conroy showed "<span>a four-line replacement for the various
<tt><a
href="https://golang.org/pkg/database/sql/#NullBool">sql.Null*</a></tt>
types in the standard library</span>":</p> 

<pre>
    type Null(type T) struct {
        Val   T
        Valid bool // Valid is true if Val is not NULL
    }
</pre>

<p>Mailing list contributor Pee Jai <a
href="https://groups.google.com/d/msg/golang-nuts/UxVAj75L-rg/gf83XfwiAQAJ">wondered</a>
whether there's a way to constrain a type to only allow structs, but Taylor
indicated that's not possible; he <a
href="https://groups.google.com/d/msg/golang-nuts/UxVAj75L-rg/raCOyQRjAAAJ">noted</a>
that "<span>generics don't solve all problems</span>". Robert Engels <a
href="https://groups.google.com/d/msg/golang-nuts/UxVAj75L-rg/KctfY4mJAQAJ">said</a>
that the <a href="https://golang.org/pkg/reflect/">reflect package</a>
would still be needed for this case anyway.</p>

<p>In one thread, "i3dmaster" <a
href="https://groups.google.com/g/golang-nuts/c/ftFxFPa2BfU/m/Os58GKd2CAAJ">asked</a>
some questions about custom map types, and Taylor <a
href="https://groups.google.com/g/golang-nuts/c/ftFxFPa2BfU/m/5I-KHAhlAAAJ">clarified</a>
that "<span>custom container types aren't going to support <tt>len()</tt>
or <tt>range</tt></span>". Creators of collection types won't have access
to this special syntax, but will need to define their own <tt>Len()</tt>
method, and their own way to iterate through the collection.</p>

<p>Go core contributor Bryan Mills has posted <a
href="https://groups.google.com/forum/?oldui=1#!searchin/golang-nuts/bryan$20mills%7Csort:date">insightful
replies</a> on a number of threads. He has also created his own <a
href="https://github.com/bcmills/go2go">repository</a> with various notes
and code examples from his experiments with generics, including an <a
href="https://github.com/bcmills/go2go/blob/master/typelist.md">explanation</a>
about why he considers type lists less than ideal. The repository also
includes various attempts at re-implementing the <tt>append()</tt> built-in
using generics as proposed.</p>


<h4>Timeline</h4>

<p>In their recent blog entry, Taylor and Griesemer are clear that adding generics to the language
won't be a quick process &mdash; they want to get it right, and take into
account community feedback:</p> 

<div class="BigQuote">
<p>We will use the feedback we gather from the Go community to decide how
to move forward. If the draft design is well received and doesn't need
significant changes, the next step would be a formal language change
proposal. To set expectations, if everybody is completely happy with the
design draft and it does not require any further adjustments, the earliest
that generics could be added to Go would be the Go 1.17 release, scheduled
for August 2021. In reality, of course, there may be unforeseen problems,
so this is an optimistic timeline; we can't make any definite
prediction.</p> 
</div>

<p>My own guess is that August 2021 (just over a year away) is optimistic
for a feature of this size. It's going to take quite a while to solicit
feedback, iterate on the design, and implement generics in a
production-ready way instead of using the current Go-to-Go translator. But
given the number of proposals and the amount of feedback so far, generics
are sure to be a much-used (and hopefully little-abused) feature whenever they
do arrive.</p>
