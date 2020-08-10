---
layout: default
title: "A look at Sourcegraph"
permalink: /writings/sourcegraph/
description: "An overview of Sourcegraph, a code search and code intelligence tool."
canonical_url: TODO
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


<p><a href="https://about.sourcegraph.com/">Sourcegraph</a> is a tool for searching and navigating around large codebases. It is written primarily in Go and is open source. The base system, which is self-hostable at no cost for up to 10 users, comes with code search, go-to-definition, and other "code intelligence" features, as well as browser extensions that integrate with code hosts like GitHub and GitLab. The company behind Sourcegraph releases a new version of the tool every month, with the <a href="https://about.sourcegraph.com/blog/sourcegraph-3.18">latest release (3.18)</a> improving C++ support and the <a href="https://about.sourcegraph.com/blog/sourcegraph-3.17">3.17 release</a> featuring faster and more precise code intelligence, as well as support for <tt>AND</tt> and <tt>OR</tt> operators.</p>

<p>Sourcegraph (the company) runs a <a href="https://sourcegraph.com/search">hosted version</a> of the system that allows anyone to search "top" public repositories from the various code hosts. It is unclear how "top" is defined, or exactly what repositories are indexed in this hosted version, but this version provides a good demonstration of the features available.</p>

<p>Sourcegraph's CEO, Quinn Slack, believes that "universal code search" is the key to helping developers work with what he calls "big code" (a play on "big data"). Slack <a href="https://thenewstack.io/universal-code-search-a-new-search-tech-for-the-era-of-big-code/">wrote</a> that in this era of "big code", the volume of code is growing exponentially, and the variety of languages developers work in means "<span>way more complexity in the languages, tools, and processes for delivering software</span>". Sourcegraph has published an <a href="https://about.sourcegraph.com/company/strategy">ambitious strategy</a> with a mission "<span>to make it so everyone can code</span>", along with a (more realistic) one-year and three-year vision that includes things like "<span>make large scale refactorings possible (universal search-and-replace)</span>". The company already supports one approach to large-scale refactorings with its <a href="https://docs.sourcegraph.com/user/campaigns">Campaigns</a> feature, which helps developers manage large code changes across multiple repositories. A campaign "<span>lets you create pull requests on all affected repositories, and it tracks their progress until they're all merged</span>".</p>


<h4>Code search</h4>

<p>The primary feature of Sourcegraph is the ability to search code across multiple repositories. Results usually come back in a second or two, even when searching hundreds of repositories. The default query style is <a href="https://docs.sourcegraph.com/user/search/queries#literal-search-default">literal search</a>, which will match a search string like <tt><a href="https://sourcegraph.com/search?q=%22foo+bar%22&patternType=literal">"foo bar"</a></tt> literally, including the quotes. Clicking the <tt>.*</tt> icon in the right-hand side of the search bar switches to <a href="https://docs.sourcegraph.com/user/search/queries#regular-expression-search">regular expression search</a>, and either of those search modes support case sensitive matching (by clicking the <tt>Aa</tt> icon).</p>

<img src="/images/sourcegraph-search.png" alt="Screenshot of a search on sourcegraph.com" title="A search on sourcegraph.com">

<p>The <tt>[]</tt> icon switches to "<a href="https://docs.sourcegraph.com/user/search/structural">structural search</a>", a search syntax created Rijnard van Tonder (who works at Sourcegraph) for his <a href="https://comby.dev/">Comby</a> project. Structural searches are language-aware, and handle nested expressions and multi-line statements better than with regular expressions. Structural search queries are often used to find potential bugs or code simplifications, for example, the query <tt><a href="https://sourcegraph.com/search?q=fmt.Sprintf%28%22:%5Bstr%5D%22%29+repo:%5Egithub%5C.com/benhoyt/goawk%24+&patternType=structural">fmt.Sprintf(":[str]")</a></tt> will find places where a developer can simplify a <tt>fmt.Sprintf()</tt> call with a single string argument to just a string literal.</p>


<h4>Code intelligence</h4>

<p>The second main feature of Sourcegraph is what the company calls "<a href="https://docs.sourcegraph.com/user/code_intelligence">code intelligence</a>": the ability to navigate to the definition of the variable or function under the cursor, or find all references to it. <a href="https://docs.sourcegraph.com/user/code_intelligence/basic_code_intelligence">By default</a>, the code intelligence features use "<span>search-based heuristics, rather than parsing the code into an AST</span>", but they seem to be quite accurate in the tests I ran. The tool found definitions in C, Python, and Go without a problem, and even found dynamically-assigned definitions in Python (such as being able to <a href="https://sourcegraph.com/github.com/benhoyt/scandir/-/blob/benchmark.py#L162">go to the definition</a> of the assigned and re-assigned <tt>scandir_python</tt> name in my scandir project).</p>

<p>More recently, Sourcegraph has implemented <a href="https://docs.sourcegraph.com/user/code_intelligence/lsif">precise code intelligence</a> using Microsoft's Language Server Index Format (LSIF), a JSON-based file format used to store pre-computed data for language tooling. Sourcegraph has written or maintains LSIF indexers for <a href="https://lsif.dev/#implementations-server">several languages</a>, including <a href="https://github.com/sourcegraph/lsif-go">Go</a>, <a href="https://github.com/sourcegraph/lsif-cpp">C++</a>, and <a href="https://github.com/sourcegraph/lsif-py">Python</a>. Currently, LSIF support in Sourcegraph is opt-in, and according to the documentation: "<span>It provides fast and precise code intelligence but needs to be periodically generated and uploaded to your Sourcegraph instance.</span>" Sourcegraph's <a href="https://docs.sourcegraph.com/user/code_intelligence/adding_lsif_to_workflows#recommended-upload-frequency">recommendation</a> is to generate and upload LSIF data on every commit, but developers can also set up a periodic job to index less frequently.</p>


<h4>Setup</h4>

<p>Installing Sourcegraph was quick using the <tt>docker-compose</tt> method, as shown in its <a href="https://docs.sourcegraph.com/admin/install/docker-compose">installation documentation</a>. It took a couple of minutes to get it up and running, and a few more minutes to configure it. I was running it on my local machine, so I used an <a href="https://ngrok.com/">ngrok</a> tunnel to (temporarily) provide an internet-facing domain with <tt>https</tt> support (it didn't need this to run, but certain features work better if it is provided). The even quicker <a href="https://docs.sourcegraph.com/admin/install/docker">single-command</a> Docker installation method also worked fine, but I decided to try out the <tt>docker-compose</tt> option: it seems slightly more realistic, as it's recommended for "<span>small &amp; medium production deployments</span>" and not just "<span>local testing</span>". For "<span>medium &amp; large highly-available cluster deployments</span>", Sourcegraph recommends <a href="https://docs.sourcegraph.com/admin/install/kubernetes">deploying on a Kubernetes cluster</a>.</p>

<p>Very little configuration was required to set things up: creating an admin user, and pointing the system at a code host (in my case, I needed to create a GitHub access token to allow Sourcegraph to access my public and private repositories on GitHub). As soon as the access token was added, Sourcegraph started cloning and indexing the repositories. A couple of minutes later, they were ready to search. The system is optimized for self-hosting; presumably the company wants to make it easy for developers to set it up for a small number of test users (and then ask them to start paying when they go above 10 users).</p>

<p>One of the "features" that may give some people pause is what Sourcegraph calls "<a href="https://docs.sourcegraph.com/admin/pings">pings</a>": by default, the tool periodically sends a ping to sourcegraph.com "<span>to help our product and customer teams</span>". The "critical telemetry" that can't be turned off includes the "<span>the email address of the initial site installer</span>" and the "<span>total count of existing user accounts</span>", presumably so the company can try to contact an installer about its enterprise offering when the 10-user threshold is reached. By default, the system also sends aggregated usage information for some product features, but this can be turned off. To its credit, Sourcegraph is up-front about its "<a href="https://about.sourcegraph.com/handbook/engineering/adding_ping_data">ping philosophy</a>", and clearly states it never sends source code, filenames, or specific search queries.</p>


<h4>Browser and editor integrations</h4>

<p>In addition to the search server and web UI, Sourcegraph provides <a href="https://docs.sourcegraph.com/integration/browser_extension">browser extensions</a> for Chrome and Firefox which enable its code intelligence features to be used when browsing code on hosts like GitHub and GitLab. For example, when reviewing a pull request on GitHub, a developer with the Sourcegraph extension installed can quickly go to a definition, find all references, or see the implementations of a given interface. <a href="https://github.blog/changelog/2019-06-11-jump-to-definition-in-public-repositories/">As of June 2019</a>, GitHub has a similar feature which uses its <a href="https://github.com/github/semantic">semantic</a> library, though the Sourcegraph browser extension seems to be more powerful (for example, it finds struct fields, and not just functions and methods). The Sourcegraph browser extension tries to keep a developer on GitHub.com if it can, but for certain links and definitions it goes to the Sourcegraph URL (or sourcegraph.com).</p>

<p>Sourcegraph also provides <a href="https://docs.sourcegraph.com/integration/editor">editor integrations</a> for four popular editors (Visual Studio Code, Atom, IntelliJ, and Sublime Text). These plugins allow the developer to open the current file in Sourcegraph, or search the selected text using Sourcegraph (the plugins open the results in a browser). The browser extensions and editor plugins fit with one of Sourcegraph's <a href="https://about.sourcegraph.com/company/strategy#principles">principles</a>: "<span>We eventually want to be a platform that ties together all of the tools developers use</span>".</p>


<h4>Wrapping up</h4>

<p>Sourcegraph looks to be a well-designed system that provides value especially for large codebases or big development teams. In fact, the documentation <a href="https://docs.sourcegraph.com/user#who-should-use-sourcegraph">implies</a> that it might not be the right fit for small teams: "<span>Sourcegraph is more useful to developers working with larger codebases or teams (15+ developers).</span>" Some may also be put off by the phone-home "pings".</p>

<p>Most of the Sourcegraph code base is <a href="https://github.com/sourcegraph/sourcegraph/blob/main/LICENSE">licensed</a> under the Apache License 2.0. The source code for the enterprise components is in the public repository, but is licensed separately using a <a href="https://github.com/sourcegraph/sourcegraph/blob/main/LICENSE.enterprise">proprietary license</a> that requires the company using it to "<span>have a valid Sourcegraph Enterprise subscription for the correct number of user seats</span>". The company's <a href="https://about.sourcegraph.com/pricing/">pricing page</a> lists the features that are restricted to the enterprise version, including: Campaigns, support for multiple code hosts, custom branding, live training sessions, and various others.</p>


<p>The development (not just the source code) of Sourcegraph is fairly open, with tracking issues for the upcoming <a href="https://github.com/sourcegraph/sourcegraph/issues/11954">3.19</a> and <a href="https://github.com/sourcegraph/sourcegraph/issues/12836">3.20</a> releases, as well as a <a href="https://github.com/sourcegraph/about/pull/1164/files">work-in-progress roadmap</a>. Along with many improvements planned for the core (search and code intelligence), such as "<a href="https://oracle.github.io/opengrok/">OpenGrok</a> parity", it looks like the company is working on their "cloud" offering, and that the Campaigns feature will see significant improvements.</p>
