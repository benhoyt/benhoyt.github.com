---
layout: default
title: "Lightweight Google Analytics alternatives"
permalink: /writings/lightweight-google-analytics-alternatives/
description: "Replacing Google Analytics with lightweight open source and privacy-conscious alternatives"
canonical_url: TODO
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">June 2020</p>

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
</style>


<p>More and more web site owners are concerned about the "all-seeing Google"
tracking their users as they browse around the web. Google Analytics (GA)
is a full-featured web-analytics system available for free and, despite the
privacy concerns, has become the de facto analytics tool for small
and large web sites alike. However, in recent years, a growing number of
alternatives are helping break Google's dominance. In this article
we'll look at some of the lightweight open-source options, namely GoatCounter, Plausible, and Countly.</p>

<p>GA is by far the biggest player here: BuiltWith <a
href="https://trends.builtwith.com/analytics/Google-Analytics">shows</a>
that around 86% of the top 100,000 web sites use it. This figure goes down
to 64% for the top one-million web sites. These figures have grown steadily
for the past 15 years, since Google acquired Urchin and rebranded it as
Google Analytics.</p>

<p>In addition to privacy concerns, GA is more complex and feature-heavy
than some web-site owners need; many of them just want to see
how much traffic is going to the pages on their site, and from what sources
the traffic is coming from. So it's not surprising that a plethora of
simpler, more open tools have taken off in the past few years.</p>


<h4>What Google tracks, and why it's concerning</h4>

<p>If asked what information Google tracks, a cynic might say, "everything!" Part of the problem is that this isn't too far from the truth: Google tracks and stores a huge amount of information about users.</p>

<p>A <a href="https://digitalcontentnext.org/wp-content/uploads/2018/08/DCN-Google-Data-Collection-Paper.pdf">2018 paper [PDF]</a> by Douglas Schmidt highlights the extent of their tracking, with location tracking on Android devices as one example:</p>

<div class="BigQuote">
<p>Both Android and Chrome send data to Google even in the absence of any user interaction. Our experiments show that a dormant, stationary Android phone (with Chrome active in the background) communicated location information to Google 340 times during a 24-hour period, or at an average of 14 data communications per hour.
</p>
</div>

<p>The paper distinguishes between "active" and "passive" tracking. Active tracking is when the user directly uses or logs in to a Google service, such as performing a search, logging into Gmail, and so on. In addition to recording all of a user's search keywords and tracking their location, Google passively tracks users as they use other products like Google Maps, Android devices, and (pertinent to this article) websites that use Google Analytics. Schmidt found that in an example "day in the life" scenario, "<span>Google collected or inferred over two-thirds of the information through passive means</span>".</p>

<p>Schmidt's paper details how GA cookie tracking works, noting the difference between "1st-party" and "3rd-party" cookies &mdash; the latter of which track users and their ad clicks across multiple sites:</p>

<div class="BigQuote">
<p>While a GA cookie is specific to the particular domain of the website that user visits (called a "1st-party cookie"), a DoubleClick cookie is typically associated with a common 3rd-party domain (such as doubleclick.net). Google uses such cookies to track user interaction across multiple 3rd-party websites.</p>

<p>When a user interacts with an advertisement on a website, DoubleClick's conversion tracking tools (e.g. Floodlight) places cookies on a user’s computer and generates a unique client ID. Thereafter, if the user visits the advertised website, the stored cookie information gets accessed by the DoubleClick server, thereby recording
the visit as a valid conversion.</p>
</div>

<p>Because such a large percentage of websites use Google advertising products as well as Google Analytics, this has the effect that the company knows a large fraction of users' browsing history across many websites, both popular sites and smaller "mom and pop" sites.</p>

<p>Google does now provide ways to turn off features like targetted advertising and location tracking, as well as delete the personalized profile associated with your account. However, these features are almost entirely opt-in, and most users either don't know about them or just.</p>

<p>The company's justification for this level of tracking, of course, is that they can provide personalized search results so that you can more easily find what you're looking for. Search competitor DuckDuckGo, however, seems to be <a href="https://spreadprivacy.com/duckduckgo-revenue-model/">doing just fine</a> without this kind of tracking.</p>

<p>People often say they have "nothing to hide", so aren't particularly concerned about Google tracking this information. However, as DuckDuckGo <a href="https://spreadprivacy.com/three-reasons-why-the-nothing-to-hide-argument-is-flawed/">points out</a>, this argument is flawed &mdash; none of us wants someone looking over our shoulder when we go to the bathroom, or when we enter our salary information into an online form.</p>

<p>One of the subtler problems with Google's level of tracking and personalization is that what Eli Pariser called the "<a href="https://en.wikipedia.org/wiki/Filter_bubble">filter bubble</a>". Because users are provided with heavily personalized search results, they get less exposure to differing points of view, and end up being "<span>isolated intellectually in their own informational bubble</span>".</p>

<p>LWN readers likely skew towards privacy-conscious already: using Firefox instead of Google Chrome, turning on ad blockers. However, the users of the web sites they build may not be. For web site developers, the analytics tools they choose can help respect their users' privacy and avoid Google-level invasions of privacy.</p>


<h4>GoatCounter</h4>

<p><a
href="https://www.goatcounter.com/">GoatCounter</a> is one of the more recent analytics tools, launched in <a 
href="https://www.arp242.net/goatcounter.html">August 2019</a>. Created by
Martin Tournoij, it has more of a "made by a single developer" feel than
other tools; it's a little less slick-looking than the other tools, but it is also very developer-friendly and simple to host.</p>

<img class="photo" src="/images/lwn-goatcounter.png" alt="[GoatCounter UI from www.goatcounter.com]" title="GoatCounter UI">

<p>The tool supports all the basic analytics: pageviews and visits by page path, browser and operating system statistics, device screen sizes, locations, and referrer information. By default GoatCounter shows the last 7 days with counts broken down by hour, but site owners can adjust the date filter with simple controls.</p>

<p>GoatCounter has an unusual pricing model, with its
source code licensed under the copyleft <a
href="https://joinup.ec.europa.eu/collection/eupl/introduction-eupl-licence">European
Union Public License</a> (EUPL). Companies can host the software
themselves, or use GoatCounter's hosted version for a small fee (the hosted
version doesn't cost anything for "<a href="https://www.goatcounter.com/terms#commercial">personal</a>" projects). Tournoij has a
<a href="https://www.arp242.net/license.html">lengthy article</a>
discussing why he chose the EUPL, noting:</p>

<div class="BigQuote">
<p>I still don't really care what people do with my code, but I do care if
my ability to make a living would be unreasonably impeded. Taking my MIT
code and working full-time on enhancements that aren't sent back to me
means my competitor has double the amount of people working on it: me (for
free, from their perspective), and them. They will always have an advantage
over me.</p>
</div>

<p>GoatCounter is written in Go, and uses vanilla
JavaScript in its UI for some lightweight interactivity. JavaScript frameworks often
get in the way of web accessibility, and GoatCounter's prioritization of
accessibility (mentioned on its home page) struck a chord with
"ctoth", who <a
href="https://news.ycombinator.com/item?id=22047556">thanked</a> Tournoij
on Hacker News:</p>

<div class="BigQuote">
<p>First time I've ever seen a comment about accessibility on the homepage
of a mainstream product like this. As a blind developer this was just
awesome, made me really feel like somebody out there is listening. Thank
you for making this.</p>
</div>

<p>In addition to counting pageviews, GoatCounter tracks sessions using a hash of the browser's user agent and IP to identify the client without storing any personal information. The "salt" used to generate these hashes is rotated every 12 hours with a sliding window. Tournoij has a <a href="https://github.com/zgoat/goatcounter/blob/master/docs/sessions.markdown">detailed write-up</a> about the technical aspects of session tracking, including a comparison with other solutions that have similar aims.</p>

<p>The hosted version of GoatCounter is extremely easy to set up &mdash; it took me about 5 minutes to set up an account and add the one line of JavaScript to my website, though it also supports <a href="https://www.goatcounter.com/code#image-based-tracking-without-javascript">non-JavaScript tracking</a> for users with JavaScript disabled or for web site owners who prefer that approach. Analytics data started showing up within a few seconds. Even with the hosted version, the site owner fully owns the data, and can export it or delete it at any time.</p>

<p>The self-hosted version is also straight-forward to set up using the <a href="https://github.com/zgoat/goatcounter/releases">Linux binaries</a> or by building from source &mdash; it took me less than 10 minutes to set it up locally with the default SQLite database option. In contrast to Plausible (discussed below), it was much lighter to install; it didn't download anything or start my laptop fan, and it started up almost instantly.</p>


<h4>Plausible</h4>

<p><a href="https://plausible.io/">Plausible</a> is one of the more recent
web-analytics tools, and launched in early 2019. Soon after launching it
switched to 
<a
href="https://plausible.io/blog/plausible-is-going-open-source">open
source</a>, with the code licensed under a permissive MIT license. Its
business model is to charge for the hosting, with low pricing aimed 
for small businesses.</p>

<p>In addition to making its source code available, Plausible is one of an
increasing number of companies that has a <a
href="https://plausible.nolt.io/roadmap">publicly-visible roadmap</a>,
presumably for better transparency and engagement with its customers. In
addition, it has a 
blog featuring content like "<a
href="https://plausible.io/blog/remove-google-analytics">Why you should
stop using Google Analytics on your website</a>" and "<a
href="https://plausible.io/blog/google-analytics-seo">Will removing Google
Analytics from a site hurt search engine rankings?</a>".</p>

<img class="photo" src="/images/lwn-plausible.png" alt="[Plausible UI from plausible.io]" title="Plausible UI">

<p>Plausible is also unique from a developer perspective, with its <a
href="https://github.com/plausible/analytics">server code</a>
written in <a href="https://elixir-lang.org/">Elixir</a>, a functional
programming language that runs on the Erlang virtual machine. Its frontend
UI uses a small amount of vanilla JavaScript for the interactive parts
rather than a rendering framework like React. It also <a
href="https://plausible.io/lightweight-web-analytics">boasts</a> one of the
smallest analytics scripts, with <a
href="https://plausible.io/js/plausible.js"><tt>plausible.js</tt></a>
weighing in at 781 bytes at the time of writing (about half the size of
Plausible's favicon). GA's <a
href="https://www.google-analytics.com/analytics.js"><tt>analytics.js</tt></a>,
in comparison, is almost 18KB.  That size can make a meaningful difference
since the scripts are loaded for each page on the site.</p>

<p>In terms of feature set,

<p>Self-hosting Plausible is possible
(even <i>plausible</i>), though as founder Uku Taht points out in that
announcement:</p>

<div class="BigQuote">
<p>It's worth noting that for now, there's no explicit support for
self-hosting Plausible. The project is still evolving quickly and
maintaining a self-hosted solution would slow product development down
considerably. I would love to offer a self-hosted solution in the future
once the product and the business are more stable.</p>
</div>

<p>That said, just a few weeks ago, Plausible added a <a href="https://github.com/plausible/analytics/blob/master/HOSTING.md">document</a> that describes an experimental way to self-host the system using Docker. Following their recommendations, I tried to use <tt>docker-compose</tt> to get it running locally. It was a little disconcerting how many Docker and <tt>npm</tt> packages it downloaded during the minutes-long installation process, and even when it was done, there was a hard-to-comprehend error with a PostgreSQL migration which prevented it starting. I'm sure I could tinker with it further and get it running, but the "experimental" label definitely fits.</p>


<h4>Countly</h4>

<p>Another open-source offering is <a href="https://count.ly/">Countly</a>,
founded in 2013. Countly is comparatively feature rich and has a large
number of dashboard types. However, of the smaller analytics tools it feels
the most like a "web startup", complete with a polished video on its
home page and <a href="https://count.ly/images/home/countly-overview.png">sleek
dashboards</a> in its UI. Countly seems to make less of a big deal about
privacy, but it is "<a
href="https://count.ly/your-data-your-rules">committed to giving you
control of your analytics data</a>".</p>

<img class="photo" src="/images/lwn-countly.png" alt="[Countly UI]" title="Countly UI">

<p>Countly has a <a href="https://count.ly/pricing">clear distinction</a>
between its enterprise edition (relatively expensive at $5000 annually) and
its install-it-yourself community edition, with the latter limited to
"basic Countly plugins" and "aggregated data". Countly's core source code
is licensed under the GNU AGPL, with the server written in JavaScript, and
SDKs for Android and iOS written in Java and Objective C.</p>

<p>There are also a couple of lightweight proprietary tools with a focus on
privacy worth mentioning. One is the minimalist <a
href="https://simpleanalytics.com/">Simple Analytics</a> product, which is
a cloud-based tool created by solo developer Adriaan van Rossum; it has a
clean-looking interface with only the few key metrics.
Another is <a href="https://usefathom.com/">Fathom</a>, which was open source
initially, but the current version is proprietary (although the company <a
href="https://github.com/usefathom/fathom/issues/268#issuecomment-522088146">hopes</a>
to start maintaining the open-source code base again in the future).</p>


<h4>Summary</h4>

<p>The last few years have seen a number of good alternatives to Google
Analytics, particularly for those who only need a few basic features. Most
of the recent alternatives are both open source and privacy conscious, so now
there are few reasons for projects and businesses to use
proprietary analytics systems.</p>

<p>For site owners who just need basic traffic numbers, Plausible and
GoatCounter seem like excellent options (those that like more visual polish
and documentation might prefer Plausible). For those that want more powerful features (TODO), Countly could be a good choice.</p>

<p>In the next week or two, we hope to publish a second article on heavier-weight GA alternatives, as well as looking at tools that provide analytics from web server logs.</p>
