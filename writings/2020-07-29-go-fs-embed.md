---
layout: default
title: "Go draft designs: a file system interface and file embedding"
permalink: /writings/go-fs-embed/
description: "A presentation of the Go draft designs for a file system interface and a standard way to embed files in a Go binary."
canonical_url: TODO
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


<p>The <a href="https://golang.org/">Go</a> team has recently published several draft designs that propose changes to the language, standard library, and tooling: the one on generics we <a href="https://go.googlesource.com/proposal/+/refs/heads/master/design/go2draft-type-parameters.md">covered</a> back in June. Last week the Go team published three more draft designs: one for a new read-only <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md">file system interface</a>, a second design that proposes a standard way to <a href="https://go.googlesource.com/proposal/+/master/design/draft-embed.md">embed files</a> into Go binaries (building on the file system interface), and another unrelated design that hopes to <a href="https://go.googlesource.com/proposal/+/522400e00c82921a68bed78611cfb0ff3c014140/design/draft-fuzzing.md">standardize "fuzz testing"</a>. This article covers the two draft designs related to file systems and file embedding. There has been a lot of discussion on these: mostly positive, but with some significant concerns. In a future article we hope to look at the fuzz testing design.</p>

<p>Russ Cox, technical lead of the Go team, and Rob Pike, one of the creators of Go, are the authors of the draft design on the file system interface. Cox is also an author of the draft design on file embedding, along with Brad Fitzpatrick, a long-time Go contributor.  Additionally, Cox created video presentations of each draft design for those who prefer that format (the <a href="https://www.youtube.com/watch?v=yx7lmuwUNv8">file system interface video</a> and the <a href="https://www.youtube.com/watch?v=rmS-oWcBZaI">file embedding video</a>). Both documents are quick to note that these designs are not (yet) formal proposals:</p>

<div class="BigQuote">
<p>This is a Draft Design, not a formal Go proposal, because it describes a potential <a href="https://research.swtch.com/proposals-large#checklist">large change</a> that addresses the same need as many third-party packages and could affect their implementations (hopefully by simplifying them!). The goal of circulating this draft design is to collect feedback to shape an intended eventual proposal.</p>
</div>

<p>Many smaller language and library changes are discussed on the <a href="https://github.com/golang/go/issues">GitHub issue tracker</a>, but for these larger discussions the Go team is trying to use <a href="https://reddit.com/r/golang">Go Reddit</a> threads to scale the discussion &mdash; GitHub issues does not have any form of threading, so multiple conversations are hard to keep track of. There is a Go Reddit thread for each draft design: the <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/">file system interface</a> and the <a href="https://old.reddit.com/r/golang/comments/hv96ny/qa_goembed_draft_design/">file embedding</a> one, with quite a number of comments on each. There is also a lengthy, non-official <a href="https://news.ycombinator.com/item?id=23933966">Hacker News thread</a> discussing the file embedding design.</p>


<h4>A file system interface</h4>

<p>The crux of the file system interface design is a single-method <a href="https://golang.org/doc/effective_go.html#interfaces">interface</a> named <tt>FS</tt> in a new <tt>io/fs</tt> standard library package:</p>

<pre>
    type FS interface {
        Open(name string) (File, error)
    }
</pre>

<p>This means that every file system implementation must at least implement the ability to open a file (or directory) by name, returning a <tt>File</tt> as well as an error. The <tt>File</tt> interface is defined as follows:</p>

<pre>
    type File interface {
        Stat() (os.FileInfo, error)
        Read(buf []byte) (int, error)
        Close() error
    }
</pre>

<p>In other words, a file has to be <tt>stat</tt>-able, readable, and closable. As the draft describes, these are the bare minimum methods a conforming file system implementation needs to provide:</p>

<div class="BigQuote">
<p>The <tt>FS</tt> interface defines the <i>minimum</i> requirement for an implementation: just an <tt>Open</tt> method. As we will see, an <tt>FS</tt> implementation may also provide other methods to optimize operations or add new functionality, but only <tt>Open</tt> is required.</p>
<p>[...]</p>
<p>The <tt>File</tt> interface defines the <i>minimum</i> requirements for an implementation. For <tt>File</tt>, those requirements are <tt>Stat</tt>, <tt>Read</tt>, and <tt>Close</tt>, with the same meanings as for an <tt>*os.File</tt>. A <tt>File</tt> implementation may also provide other methods to optimize operations or add new functionality—for example, an <tt>*os.File</tt> is a valid <tt>File</tt> implementation—but only these three are required.</p>
</div>

<p>File system implementations can expose additional functionality using what the draft design calls an "extension interface", which is an interface that "<span><a href="https://golang.org/doc/effective_go.html#embedding">embeds</a> a base interface and adds one or more extra methods, as a way of specifying optional functionality that may be provided by an instance of the base interface.</span>" For example, it is common to read a whole file at once, and for in-memory file system implementations, it may be inefficient to do this using <tt>Open</tt>, multiple calls to <tt>Read</tt>, and <tt>Close</tt>. In cases like this, a developer could implement the <tt>ReadFile</tt> extension method as defined in the <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#readfile"><tt>ReadFileFS</tt> extension interface</a>:</p>

<pre>
    type ReadFileFS interface {
        FS  // embed the file system interface (Open method)
        ReadFile(name string) ([]byte, error)
    }
</pre>

<p>Along with the extension interface, the draft design adds a <tt>ReadFile</tt> helper function that checks the file system for the <tt>ReadFile</tt> extension, and uses it if it exists, otherwise falls back to performing the open/read/close sequence. There are various other extension interfaces defined in the draft proposal, including <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#stat"><tt>StatFS</tt></a>, <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#readdir"><tt>ReadDirFS</tt></a>, and <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#glob"><tt>GlobFS</tt></a>. The draft design does not provide ways to rename or write files, but that could also be done using <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#possible-future-or-third_party-extensions">extensions</a>.</p>

<p>In addition to the new <tt>io/fs</tt> types and helper functions, the draft design suggests changes to various standard library packages to make use of the new file system interface. For example, <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#adjustments-to-html_template-and-text_template">adding</a> a <tt>ParseFS</tt> method to the HTML templating library to allow parsing templates from an in-memory file system, or <a href="https://go.googlesource.com/proposal/+/master/design/draft-iofs.md#adjustments-to-archive_zip">making</a> the <tt>archive/zip</tt> package implement <tt>FS</tt> so that developers can treat a zip file as a "file system" and use it wherever <tt>FS</tt> is allowed.</p>

<p>Much of the feedback on the Go Reddit discussion has been positive, and it seems like an interface of this kind is something developers want. However, one of the criticisms by several people is about the drawbacks of extension interfaces. Reddit user "acln0" <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fys0w28/">summarized</a> the concerns:</p>

<div class="BigQuote">
<p>I have only one observation to make, related to extension interfaces and the extension pattern. I am reminded of http.ResponseWriter and the optional interfaces the http package makes use of. Due to the existence of these optional interfaces, wrapping http.ResponseWriter is difficult. Doing it "generically" involves a <a href="https://github.com/felixge/httpsnoop">combinatorial explosion of optional interfaces</a>, and it's easy to go wrong in a way that looks like this: "we added status logging by wrapping http.ResponseWriter, and now HTTP/2 push doesn't work anymore, because our wrapper hides the Push method from the handlers downstream".</p>
</div>

<p>Peter Bourgon, a well-known Go blogger and speaker, <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fysrqdo/">believes</a> that this use of extension interfaces means that it "<span>becomes infeasible to use the (extremely useful) decorator pattern. That's really unfortunate. To me that makes the proposal almost a non-starter; the decorator pattern is too useful to break in this way.</span>" Nick Craig-Wood, author of <a href="https://rclone.org/">Rclone</a>, a cloud storage tool written in Go, is positive about the proposal but <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fysyrht/">expressed</a> similar concerns: "<span>Extension (or optional as I usually call them) interfaces are a big maintenance burden - wrapping them is really hard</span>."</p>

<p>The draft design states that "<span>enabling that kind of middleware [that is, wrappers] is a key goal for this draft design</span>", so it would seem wise for the design's authors to tackle this problem head on. Cox hasn't yet proposed a solution, but <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fys5ck5/">acknowledged</a> the issue: "<span>It's true - there's definitely a tension here between extensions and wrappers. I haven't seen any perfect solutions for that.</span>".</p>

<p>Another <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fyryjmj/">concern</a> comes from Reddit user "TheSwedeheart": "<span>One thing I'm missing to migrate that over to this is support for propagating contexts to each operation, for cancellation.</span>". Cox <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fys58od/">replied</a> that a library author could "<span>probably pass the context to a constructor that returns an FS with the context embedded in it, and then have that context apply to the calls being made with that specific FS.</span>" As "lobster_johnson" points out, this goes against the <a href="https://golang.org/pkg/context/"><tt>context</tt></a> package's guideline to explicitly pass context as the first function argument, not store a context inside a struct. However, Cox <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fyszfmj/">countered</a> with an example of <tt>http.Request</tt> doing something similar, and stated that "<span>Those are more guidelines than rules. [...] Sometimes it does make sense.</span>"</p>

<p>There are of course the usual bike-shedding threads that debate naming; Reddit user "olegkovalov" <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fyrx54b/">said</a> "<span>I'm somewhat scared about <tt>io/fs</tt> name, <tt>fs</tt> is a good variable name, it'll cause many troubles to the users when <tt>io/fs</tt> will appear</span>." After some back-and-forth, Cox <a href="https://www.reddit.com/r/golang/comments/hv976o/qa_iofs_draft_design/fysxjnp/">stressed</a> the need to focus on application developers instead of on the file system implementers:</p>

<div class="BigQuote">
<p>You're focusing on the file system implementers instead of the users. Code referring to things like os.FileInfo, os.ModeDir, os.PathError, os.ErrNotExist will all now refer canonically to fs.FileInfo, fs.ModeDir, fs.PathError, fs.ErrNotExist. Those seem much better than, say, filesystem.ErrNotExist. And far more code will be referring to those names than implementing file systems.</p>
</div>


<h4>Embedding files in binaries</h4>

<p>The second, related draft design proposes a way to embed files (or "static assets") in Go binaries and read their contents at runtime. This simplifies releases and deployments, as developers can simply copy around a large binary with no external dependencies (for SQL snippets, HTML templates, CSS and JavaScript assets for a web application, and so on). As the document points out, there are already over a dozen third-party tools that can do this, but "<span>adding direct support to the <tt>go</tt> command for the basic functionality of embedding will eliminate the need for some of these tools and at least simplify the implementation of others</span>". Including embedding in the standard <tt>go</tt> tool will also mean there is no pre-build step to convert files to data in Go source code, and no need to commit those generated files to version control.</p>

<p>The authors of the draft design <a href="https://go.googlesource.com/proposal/+/master/design/draft-embed.md#goals">make it clear</a> that this is a tooling change, not a Go language change:</p>

<div class="BigQuote">
<p>Another explicit goal is to avoid a language change. To us, embedding static assets seems like a tooling issue, not a language issue. Avoiding a language change also means we avoid the need to update the many tools that process Go code, among them goimports, gopls, and staticcheck.</p>
</div>

<p>The <tt>go</tt> tool looks for special comments in Go source files for various things, including <tt>//&nbsp;+build</tt> tags to include certain files only on specific architectures, and <tt>//go:generate</tt> comments that tell <tt>go generate</tt> what commands to run for code generation purposes. This new draft design proposes a new <tt>//go:embed</tt> comment directive that tells <tt>go build</tt> to include those files in the resulting binary. Here is a concrete example:</p>

<pre>
    // The "content" variable holds our static web server content.
    //go:embed image/* template/*
    //go:embed html/index.html
    var content embed.Files
</pre>

<p>This would make <tt>go build</tt> include all the files in the <tt>image</tt> and <tt>template</tt> directories, as well as the <tt>html/index.html</tt> file, and make them accessible via the <tt>content</tt> variable (which is of type <tt>embed.Files</tt>). The <tt>embed</tt> package is a new standard library package being proposed which contains the API for accessing the embedded files. In addition, the <tt>embed.Files</tt> type implements the <tt>fs.FS</tt> interface from the draft design discussed above, allowing the embedded files to be used directly with other standard library packages like <tt>net/http</tt> and <tt>html/template</tt>, as well as any third-party packages that support the new file system interface.</p>

<p>The draft design <a href="https://go.googlesource.com/proposal/+/master/design/draft-embed.md#codecs-and-other-processing">limits the scope</a> of the proposal in an important way. There are many ways that the data in the files could be transformed before being including in the binary: data compression, TypeScript compilation, image resizing, and so on. This design takes a simple approach of just including the raw file data:</p>

<div class="BigQuote">
<p>It is not feasible for the <tt>go</tt> command to anticipate or include all the possible transformations that might be desirable. The <tt>go</tt> command is also not a general build system; in particular, remember the design constraint that it never runs user programs during a build. These kinds of transformations are best left to an external build system, such as Make or Bazel, which can write out the exact bytes that the <tt>go</tt> command should embed.</p>
</div>

<p>Again, the feedback on the Reddit thread was mostly positive, with comments like <a href="https://old.reddit.com/r/golang/comments/hv96ny/qa_goembed_draft_design/fyrz1ce/">this one</a> from Reddit user "bojanz": "<span>This looks like a great start. Thank you for tackling this.</span>" There are a few minor suggestions, such as "zikaeroh"'s <a href="https://old.reddit.com/r/golang/comments/hv96ny/qa_goembed_draft_design/fytj7my/">comment</a> in favor of adding a more powerful path matching API that supports <tt>**</tt> for recursive directory matching. Reddit user "ekrubnivek" <a href="https://old.reddit.com/r/golang/comments/hv96ny/qa_goembed_draft_design/fytb7z3/">suggested</a> storing a cryptographic hash of each file's content so the developer does not have to hash the file at runtime: "<span>This is useful for e.g. cache busting on a static file server</span>".</p>

<p>One of the repeated critiques is from developers who don't like overloading source code comments with the special <tt>//go:embed</tt> syntax. Reddit user "saturn_vk" <a href="https://old.reddit.com/r/golang/comments/hv96ny/qa_goembed_draft_design/fyuxor0/">stated</a> bluntly, "<span>I really don't like the fact that comments are being abused for actual work</span>", and Hacker News user "breakingcups" <a href="https://news.ycombinator.com/item?id=23937213">strongly advocated</a> for the use of a project file instead of directives in comments:</p>

<div class="BigQuote">
<p>Again, more magic comments.</p>
<p>The proposed feature is great, but the unwillingness of the Go team to use a separate, clearly defined project file or at the very least a separate syntax in your code file leads them to stuff every additional feature into comments, a space shared by human notetaking.</p>
</div>

<p>Cox sums up his thinking about this with the following <a href="https://old.reddit.com/r/golang/comments/hv96ny/qa_goembed_draft_design/fywm1ap/">comment</a> which compares the syntax with <tt>#pragma</tt> in C:</p>

<div class="BigQuote">
<p>For what it's worth, we already have <tt>//go:generate</tt> and a few other lesser known ones. And there is a separate draft design to replace <tt>//&nbsp;+build</tt> with <tt>//go:build</tt>. At that point we will be completely consistent: these kinds of directives begin with <tt>//go:</tt>. The point is to look enough like a comment to make tools that don't need to know ignore them, but enough not like a comment to signal to people that something special is going on.</p>
<p>C uses <tt>#pragma foo</tt> for this. Go simply spells <tt>#pragma</tt> as <tt>//go:</tt>.</p>
</div>


<h4>Wrapping up</h4>

<p>It seems like there's a good amount of community support for both draft designs, particularly the more user-facing proposal for file embedding. Many developers are already using third-party file embedding libraries to simplify their deployments, and these efforts will standardize that tooling. It seems likely that the draft designs will be refined and turned into full <a href="https://research.swtch.com/proposals">proposals</a>. With <a href="https://lwn.net/Articles/820217/">Go 1.15</a> coming out in a few days, it's possible these proposals would be ready for Go 1.16 (due out in six months), but if there needs to be another round of feedback &mdash; for example, regarding the problems with extension interfaces &mdash; a Go 1.17 release date seems more likely.</p>
