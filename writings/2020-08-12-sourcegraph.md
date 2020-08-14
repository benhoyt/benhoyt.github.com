---
layout: default
title: "Searching code with Sourcegraph"
permalink: /writings/sourcegraph/
description: "An overview of Sourcegraph, a code search and code intelligence tool."
canonical_url: https://lwn.net/Articles/828748/
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">August 2020</p>

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


<p><a href="https://about.sourcegraph.com/">Sourcegraph</a> is a tool for
searching and navigating around large code bases.
Sourcegraph has various search
methods, including regular-expression search, and "structural search",
which is
a relatively new technique that is language-aware.
The open-source core of
the tool comes
with code search, go-to-definition and other "<a
href="https://docs.sourcegraph.com/user/code_intelligence">code
intelligence</a>" features, which provide ways for developers to make
sense of multi-repository code bases.  Sourcegraph's code intelligence can show documentation for
functions and methods on mouse hover and allow developers to
quickly jump to definitions or to find all references to a particular
identifier.</p>


<p>
The Sourcegraph server is mostly written in Go, with the core released
under the Apache License 2.0; various "enterprise" extensions are available
under a proprietary license. The company behind Sourcegraph releases a new
version of the tool every month, with the <a
href="https://about.sourcegraph.com/blog/sourcegraph-3.18">latest release
(3.18)</a> improving C++ support and the <a
href="https://about.sourcegraph.com/blog/sourcegraph-3.17">3.17 release</a>
featuring faster and more accurate code intelligence as well as support
for <tt>AND</tt> and <tt>OR</tt> search operators.</p>

<h4>Code search</h4>

<p>The primary feature of Sourcegraph is the ability to search code across
one or more repositories. Results usually come back in a second or two,
even when searching hundreds of repositories. The default query style is <a
href="https://docs.sourcegraph.com/user/search/queries#literal-search-default">literal
search</a>, which will match a search string like <tt><a
href="https://sourcegraph.com/search?q=%22foo+bar%22&patternType=literal">"foo
bar"</a></tt> exactly, including the quotes. Clicking the <tt>.*</tt> icon
in the right-hand side of the search bar switches to <a
href="https://docs.sourcegraph.com/user/search/queries#regular-expression-search">regular
expression search</a>, and either of those search modes support case-sensitive matching (by clicking the <tt>Aa</tt> icon).</p>

<img src="/images/sourcegraph-search.png" alt="[Sourcegraph search]"
title="Sourcegraph search" class="photo">

<p>The <tt>[]</tt> icon switches to "<a
href="https://docs.sourcegraph.com/user/search/structural">structural
search</a>", a search syntax created Rijnard van Tonder (who works at
Sourcegraph) for his <a href="https://comby.dev/">Comby</a>
project. Structural searches are language-aware, and handle nested
expressions and multi-line statements better than regular
expressions. Structural search queries are often used to find potential
bugs or code simplifications, for example, the query <tt><a
href="https://sourcegraph.com/search?q=fmt.Sprintf%28%22:%5Bstr%5D%22%29&patternType=structural">fmt.Sprintf(":[str]")</a></tt>
will find places where a developer can eliminate a <tt>fmt.Sprintf()</tt>
call when it has a single argument that is just a string literal.</p>

<p>The documentation has an <a
href="https://docs.sourcegraph.com/dev/architecture">architecture
diagram</a> that shows the various processes a Sourcegraph installation
runs. There is also a more detailed description of the <a
href="https://docs.sourcegraph.com/dev/architecture/life-of-a-search-query">life
of a search query</a>.   The front end starts by looking for a <tt>repo:</tt> filter
in the query to decide which repositories need to be searched.  The server
stores its list of
repositories in a PostgreSQL database, along with most other
Sourcegraph metadata; Git repositories are cloned and stored as
files.

<p>
Next, the server determines which repositories are indexed (for a
specific revision if specified in the search query)
and which
are not: both indexing the repositories and indexed searches are handled by <a
href="https://github.com/google/zoekt">zoekt</a>, which is a trigram-based
code-search library written in Go. (Those curious about using trigrams for
searching code may be interested in  Go technical lead Russ Cox's <a
href="https://swtch.com/~rsc/regexp/regexp4.html">article</a> about
it).

<p>
Repository revisions that are not indexed are handled 
by a separate "<a
href="https://github.com/sourcegraph/sourcegraph/tree/master/cmd/searcher">searcher</a>"
process (which is 
<a
href="https://en.wikipedia.org/wiki/Scalability#Horizontal_or_Scale_Out">horizontally-scalable</a>
via Kubernetes).
It fetches a zip archive
of the repository from Sourcegraph's <a
href="https://github.com/sourcegraph/sourcegraph/tree/master/cmd/gitserver">gitserver</a>
and iterates through the files in it, matching 
using Go's <a href="https://golang.org/pkg/regexp/"><tt>regexp</tt></a> package for
regular-expression searches or
the Comby library for structural searches.
By default, only a repository's default branch is indexed, but
Sourcegraph 3.18 <a
href="https://about.sourcegraph.com/blog/indexed-non-default-branches">added
the ability</a> to index non-default branches.
</p>


<h4>Code intelligence</h4>

<p>The second main feature of Sourcegraph is what the company calls "code
intelligence": the ability to navigate to the definition of the variable or
function under the cursor, or to find all references to it. <a
href="https://docs.sourcegraph.com/user/code_intelligence/basic_code_intelligence">By
default</a>, the code-intelligence features use "<span>search-based
heuristics, rather than parsing the code into an AST [abstract syntax
tree]</span>", but the heuristics seem
to be quite accurate in the tests I ran. The tool found definitions in C,
Python, and Go without a problem, and even found dynamically-assigned
definitions in Python (such as being able to go to <a
href="https://sourcegraph.com/github.com/benhoyt/scandir/-/blob/benchmark.py#L162">the
definition</a> of the assigned and re-assigned <tt>scandir_python</tt> name
in my <a href="https://github.com/benhoyt/scandir">scandir project</a>).</p>

<p>More recently, Sourcegraph has implemented <a
href="https://docs.sourcegraph.com/user/code_intelligence/lsif">more
precise code intelligence</a> (which uses language-specific parse trees
rather than search heuristics) using Microsoft's <a href="https://microsoft.github.io/language-server-protocol/specifications/lsif/0.5.0/specification/">Language Server Index
Format</a> (LSIF), a JSON-based file format that is used to store  data
extracted by indexers for
language tooling. Sourcegraph has written or maintains LSIF indexers for <a
href="https://lsif.dev/#implementations-server">several languages</a>,
including <a href="https://github.com/sourcegraph/lsif-go">Go</a>, <a
href="https://github.com/sourcegraph/lsif-cpp">C/C++</a>, and <a
href="https://github.com/sourcegraph/lsif-py">Python</a> (all
MIT-licensed). Currently, LSIF support in Sourcegraph is opt-in, and
according to the documentation: "<span>It provides fast and precise code
intelligence but needs to be periodically generated and uploaded to your
Sourcegraph instance.</span>" Sourcegraph's <a
href="https://docs.sourcegraph.com/user/code_intelligence/adding_lsif_to_workflows#recommended-upload-frequency">recommendation</a>
is to generate and upload LSIF data on every commit, but developers can
also set up a periodic job to index less frequently.</p>

<p>Similar to the query documentation, there is a document describing <a
href="https://docs.sourcegraph.com/dev/architecture/life-of-a-code-intelligence-query">the
life of a code intelligence query</a>, which are broken down into three
types: hover queries (which retrieve the documentation associated with a
symbol to display as "hover text"), go-to-definition queries, and
find-references queries. Precise LSIF information is used if it is
available, otherwise Sourcegraph falls back to returning "fuzzy" results
based on a combination of <a
href="https://en.wikipedia.org/wiki/Ctags">Ctags</a> and searching.</p>


<h4>Open source?</h4>

<p>Sourcegraph's licensing is open core, but the delivery is <a
href="https://about.sourcegraph.com/community/faq">somewhat unusual</a>:
all of the source, including the proprietary code, is in a <a
href="https://github.com/sourcegraph/sourcegraph">single public
repository</a>, but the code under the <tt>enterprise/</tt> and
<tt>web/src/enterprise/</tt> directories are subject to the <a
href="https://github.com/sourcegraph/sourcegraph/blob/main/LICENSE.enterprise">Sourcegraph
Enterprise license</a>, and the rest of the code is under the open-source
license. The pre-built Docker images provided by Sourcegraph include the
enterprise code "<span>to provide a smooth upgrade path to Sourcegraph
Enterprise</span>", but the repository provides a <a
href="https://github.com/sourcegraph/sourcegraph/blob/main/dev/dev-sourcegraph-server.sh">build
script</a> that builds a fully open-source image. The enterprise code
includes a <a
href="https://github.com/sourcegraph/sourcegraph/blob/6b597b69f268daac181f88e2b3cd22241f4eb06a/enterprise/cmd/frontend/internal/licensing/enforcement.go#L36">check</a>
to disallow more than ten users, but that won't be included in an
open-source build. Overall, building and installing the open-source version is <a 
href="https://github.com/sourcegraph/sourcegraph/issues/6790">not well
documented</a> and its setup script may be <a
href="https://github.com/sourcegraph/sourcegraph/issues/6789">missing some
steps</a> &mdash; it definitely feels like a second-class citizen.</p>

<p>Sourcegraph (the company) runs a <a
href="https://sourcegraph.com/search">hosted version</a> of the system that
allows anyone to search "top" public repositories from various code
hosts. It is unclear how "top" is defined, or exactly what repositories are
indexed in this hosted version, but this version provides a good
demonstration of the features available. The company's <a
href="https://about.sourcegraph.com/pricing/">pricing page</a> lists the
features that are restricted to the enterprise version, including:
the Campaigns multi-repository refactoring tool, support for multiple code
hosts, custom branding, live training 
sessions, and more.</p>



<h4>Setup</h4>

<p>Installing the pre-built Sourcegraph images was quick using the
<tt>docker-compose</tt> method, as shown in its <a
href="https://docs.sourcegraph.com/admin/install/docker-compose">installation
documentation</a>. It took a couple of minutes to get it up and running,
and a few more minutes to configure it. I was running it on my local
machine, so I used an <a href="https://ngrok.com/">ngrok</a> tunnel to
(temporarily) provide an internet-facing domain with <tt>https</tt> support
(it didn't need this to run, but certain features work better if it is
provided). The even quicker <a
href="https://docs.sourcegraph.com/admin/install/docker">single-command</a>
Docker installation method also worked fine, but I decided to try out the
<tt>docker-compose</tt> option: it seems slightly more realistic, as it's
recommended for small and medium production deployments and not just local
testing. For larger, highly-available deployments, Sourcegraph recommends
<a href="https://docs.sourcegraph.com/admin/install/kubernetes">deploying
on a Kubernetes cluster</a>.</p>

<p>Very little configuration was required to set things up: creating an
admin user, and pointing the system at a code host (in my case, I needed to
create a GitHub access token to allow Sourcegraph to access my public and
private repositories on GitHub). As soon as the access token was added,
Sourcegraph started cloning and indexing the repositories. A couple of
minutes later, they were ready to search. The system is optimized for
self-hosting; presumably the company wants to make it easy for developers
to set it up for a small number of test users (and then ask them to start
paying when they go above ten users).</p>

<p>One of the "features" that may give some people pause is what
Sourcegraph calls "<a
href="https://docs.sourcegraph.com/admin/pings">pings</a>"; by default, the
tool sends a <tt>POST</tt> request to
<tt>https://sourcegraph.com/.api/updates.com</tt> approximately every 30
minutes "<span>to help our product and customer teams</span>". This
"<span>critical telemetry</span>" includes the "<span>the email address of
the initial site installer</span>" and the "<span>total count of existing
user accounts</span>", presumably so the company can try to contact an
installer about paying for its enterprise offering when the ten-user
threshold is reached. It can only be turned off by modifying the source
code (the ping code is in the open-source core, so someone could
comment out <a
href="https://github.com/sourcegraph/sourcegraph/blob/c4160cf9cd5a0ae610050a1667568d60004e8cc9/cmd/frontend/internal/cli/serve_cmd.go#L199">this
line</a> to get rid of it). By default, the system also sends aggregated usage information
for some product features, but this can be turned off by setting the
<tt>DisableNonCriticalTelemetry</tt> configuration variable. To its credit,
Sourcegraph is up-front about its "<a
href="https://about.sourcegraph.com/handbook/engineering/adding_ping_data">ping
philosophy</a>", and clearly states that it never sends source code,
filenames, or specific search queries.</p>


<h4>Browser and editor integrations</h4>

<p>In addition to the search server and web UI, Sourcegraph provides <a
href="https://docs.sourcegraph.com/integration/browser_extension">browser
extensions</a> for Chrome and Firefox that enable its code-intelligence
features to be used when browsing on hosts like GitHub and GitLab. For
example, when reviewing a pull request on GitHub, a developer with the
Sourcegraph extension installed can quickly go to a definition, find all
references, or see the implementations of a given interface. <a
href="https://github.blog/changelog/2019-06-11-jump-to-definition-in-public-repositories/">As
of June 2019</a>, GitHub has a similar feature, which uses its <a
href="https://github.com/github/semantic">semantic</a> library, though the
Sourcegraph browser extension seems to be more capable (for example, it
finds struct fields, and not just functions and methods). The Sourcegraph
browser extension tries to keep a developer on github.com if it can, but
for certain links and definitions it goes to the Sourcegraph instance's
URL.</p>

<p>Sourcegraph also provides <a
href="https://docs.sourcegraph.com/integration/editor">editor
integrations</a> for four popular editors (Visual Studio Code, Atom,
IntelliJ, and Sublime Text). These plugins allow the developer to open the
current file in Sourcegraph, or search the selected text using Sourcegraph
(the plugins open the results in a browser). The browser extensions and
editor plugins fit with one of Sourcegraph's <a
href="https://about.sourcegraph.com/company/strategy#principles">principles</a>:
"<span>We eventually want to be a platform that ties together all of the
tools developers use</span>".</p>


<h4>In conclusion</h4>

<p>The development (not just the source code) of Sourcegraph is fairly
open, with tracking issues for the upcoming <a
href="https://github.com/sourcegraph/sourcegraph/issues/11954">3.19</a> and
<a href="https://github.com/sourcegraph/sourcegraph/issues/12836">3.20</a>
releases, as well as a <a
href="https://github.com/sourcegraph/about/blob/585cd10db5e34ce3d9a7ec15c2f6f1a0ca538204/handbook/product/roadmap.md">work-in-progress
roadmap</a>. Along with many improvements planned for the core (search and
code intelligence), such as "<a
href="https://oracle.github.io/opengrok/">OpenGrok</a> parity", it looks
like the company is working on its cloud offering, and that the
Campaigns feature will see significant improvements.</p>

<p>Sourcegraph looks to be a well-designed system that is useful, 
especially for large code bases and big development teams. In fact, the
documentation <a
href="https://docs.sourcegraph.com/user#who-should-use-sourcegraph">implies</a>
that the tool might not be the right fit for small teams: "<span>Sourcegraph is
more useful to developers working with larger code bases or teams (15+
developers).</span>" Some may also be put off by the poorly-supported open-source build and the phone-home "pings"; however, it does look like <a
href="https://github.com/sourcegraph/sourcegraph/issues/6783#issuecomment-577595944">some
folks</a> have persisted with the open-source version and have gotten it
working.</p>
