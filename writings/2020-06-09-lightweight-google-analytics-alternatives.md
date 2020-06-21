---
layout: default
title: "Lightweight Google Analytics alternatives"
permalink: /writings/lightweight-google-analytics-alternatives/
description: "Replacing Google Analytics with lightweight open source and privacy-conscious alternatives"
canonical_url: https://lwn.net/Articles/822568/
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


<p>More and more web-site owners are concerned about the "all-seeing Google"
tracking users as they browse around the web. <a
href="https://en.wikipedia.org/wiki/Google_Analytics">Google Analytics</a> (GA) is a 
full-featured web-analytics system that is available for free and, despite the privacy
concerns, has become the de facto analytics tool for small and large web sites
alike. However, in recent years, a growing number of alternatives are helping
break Google's dominance. In this article we'll look at two of the lightweight
open-source options, namely GoatCounter and Plausible. In a subsequent article,
we'll look at a few of the larger tools.</p>

<p>GA is by far the biggest player here: BuiltWith <a
href="https://trends.builtwith.com/analytics/Google-Analytics">shows</a> that
around 86% of the top 100,000 web sites use it. This figure goes down to 64% for
the top one-million web sites. These figures have grown steadily for the past 15
years, since Google acquired Urchin and rebranded it as Google Analytics.
In addition to privacy concerns, GA is more complex and feature-heavy than 
some web-site owners need; many of them just want to see how much traffic is
going to the pages on their site, and where that traffic is coming
from. So it's not surprising that a number of simpler, more open tools have
taken off in the past few years.</p>

<p>
It should be noted that LWN does use GA, though we are evaluating other
choices.  Those who turn off ads in their preferences will not be served
with the GA code, however.


<h4>What Google tracks, and why it's concerning</h4>

<p>If asked what information Google tracks, a cynic might say, "everything".
Part of the problem is that this isn't too far from the truth: Google tracks and
stores a huge amount of information about users.</p>

<p>A <a
href="https://digitalcontentnext.org/wp-content/uploads/2018/08/DCN-Google-Data-Collection-Paper.pdf">2018
paper [PDF]</a> by Douglas Schmidt highlights the extent of Google's tracking,
with location tracking on Android devices as one example:</p>

<div class="BigQuote"> <p>Both Android and Chrome send data to Google even in
the absence of any user interaction. Our experiments show that a dormant,
stationary Android phone (with Chrome active in the background) communicated
location information to Google 340 times during a 24-hour period, or at an
average of 14 data communications per hour. </p> </div>

<p>The paper distinguishes between "active" and "passive" tracking. Active
tracking is when the user directly uses or logs into a Google service, such as
performing a search, logging into Gmail, and so on. In addition to recording all
of a user's search keywords, Google passively tracks users as they visit
web sites that use GA and other Google <a
href="https://www.google.com/ads/publisher/">publisher tools</a>. Schmidt
found that in an example "day in the life" 
scenario, "<span>Google collected or inferred over two-thirds of the information
through passive means</span>".</p>

<p>Schmidt's paper details how GA cookie tracking works, noting the difference
between "1st-party" and "3rd-party" cookies &mdash; the latter of which track
users and their ad clicks across multiple sites:</p>

<div class="BigQuote"> <p>While a GA cookie is specific to the particular domain
of the website that user visits (called a "1st-party cookie"), a DoubleClick
cookie is typically associated with a common 3rd-party domain (such as
doubleclick.net). Google uses such cookies to track user interaction across
multiple 3rd-party websites.</p>

<p>When a user interacts with an advertisement on a website, DoubleClick's
conversion tracking tools (e.g. Floodlight) places cookies on a user’s computer
and generates a unique client ID. Thereafter, if the user visits the advertised
website, the stored cookie information gets accessed by the DoubleClick server,
thereby recording the visit as a valid conversion.</p> </div>

<p>Because such a large percentage of web sites use Google advertising products
as well as GA, this has the effect that the company knows a large fraction of
users' browsing history across many web sites, both popular sites and smaller
"mom and pop" sites. In short, Google knows a lot about what you like, where you
are, and what you buy.</p>

<p>Google does provide ways to turn off features like targeted advertising
and location tracking, as well as to delete the personalized profile associated
with an account. However, these features are almost entirely opt-in, and most
users either don't know about them or just never bother to turn them off.</p>

<p>Of course, just switching away from GA won't eliminate all of these privacy
issues (for example, it will do nothing to stop Android location tracking or
search tracking), but it's one way to reduce the huge amount of data Google
collects. In addition, for site owners that use a GA alternative, Google does
not get a behind-the-scenes look at the site's traffic patterns &mdash; data
which it could conceivably use in the future to build a competing tool.</p>

<p>LWN readers likely skew toward privacy-conscious: using Firefox instead of
Google Chrome, turning on ad blockers, and so on. However, the users of the web
sites they build may not be so privacy-conscious. For web-site developers, the
analytics tools they choose can help respect their users' privacy and avoid
Google knowing quite so much about their users' browsing patterns.</p>


<h4>GoatCounter</h4>

<p><a href="https://www.goatcounter.com/">GoatCounter</a> is one of the more
recent web-analytics tools, launched in <a 
href="https://www.arp242.net/goatcounter.html">August 2019</a>. Created by
Martin Tournoij, it has more of a "made by a single developer" feel than other
tools; it's a little less slick-looking than some, but it is also
developer-friendly and simple to set up.</p>

<img class="photo" src="/images/lwn-goatcounter.png" alt="[GoatCounter UI from
www.goatcounter.com]" title="GoatCounter UI">

<p>The tool supports all of the basic analytics: page views and visits by URL,
browser and operating system statistics, device screen sizes, locations, and
referrer information. By default GoatCounter shows the last seven days with counts
broken down by hour, but site owners can adjust the date span with simple
controls.</p>

<p>GoatCounter has an unusual pricing model, with its source code licensed under
the copyleft <a
href="https://joinup.ec.europa.eu/collection/eupl/introduction-eupl-licence">European
Union Public License</a> (EUPL). Companies can host the software themselves, or
use GoatCounter's hosted version for a small fee (though the hosted version
doesn't cost anything for "<a
href="https://www.goatcounter.com/terms#commercial">personal</a>" projects).
Tournoij has a <a href="https://www.arp242.net/license.html">lengthy article</a>
discussing why he chose the EUPL, noting:</p>

<div class="BigQuote"> <p>I still don't really care what people do with my code,
but I do care if my ability to make a living would be unreasonably impeded.
Taking my MIT code and working full-time on enhancements that aren't sent back
to me means my competitor has double the amount of people working on it: me (for
free, from their perspective), and them. They will always have an advantage over
me.</p> </div>

<p>GoatCounter is written in Go, and uses vanilla JavaScript in its UI for some
lightweight interactivity. <a
href="https://hiredigitally.com/2019/04/17/are-javascript-frameworks-accessible/">JavaScript
frameworks often get in the way of web 
accessibility</a>, and GoatCounter's prioritization of accessibility (mentioned on
its home page) struck a chord with "ctoth", who <a
href="https://news.ycombinator.com/item?id=22047556">thanked</a> Tournoij on
Hacker News:</p>

<div class="BigQuote"> <p>First time I've ever seen a comment about
accessibility on the homepage of a mainstream product like this. As a blind
developer this was just awesome, made me really feel like somebody out there is
listening. Thank you for making this.</p> </div>

<p>In addition to counting page views, GoatCounter tracks sessions using a hash
of the browser's user agent and IP address to identify the client without storing any
personal information. The <a
href="https://en.wikipedia.org/wiki/Salt_(cryptography)">salt</a> used to
generate these hashes is rotated every 
4 hours with a sliding window. Tournoij has a <a
href="https://github.com/zgoat/goatcounter/blob/master/docs/sessions.markdown">detailed
write-up</a> about the technical aspects of session tracking, including a
comparison with other solutions that have similar aims.</p>

<p>
For web-site owners who prefer to avoid JavaScript or who want analytics
from users with JavaScript disabled, 
GoatCounter supports <a
href="https://www.goatcounter.com/code#image-based-tracking-without-javascript">non-JavaScript
tracking</a> scheme.  It uses a 1x1 transparent GIF image in an
"<tt>&lt;img&gt;</tt>" tag on the pages to be counted, though this approach
will not record the referrer or screen size.</p>


<p>The hosted version of GoatCounter is easy to set up &mdash; taking about
five minutes to set up an account and add the one line of JavaScript to my 
web site. Analytics data started showing up within a few seconds.
Even with the hosted version, the site owner fully owns the data, and can export
the full dump or delete their account at any time.</p>

<p>The self-hosted version is also straightforward to set up using the <a
href="https://github.com/zgoat/goatcounter/releases">Linux binaries</a> or by
building from source &mdash; it took me less than ten minutes to build from
source and set it up locally with the default SQLite database configuration. In
contrast to Plausible (discussed below), it was much lighter to install, 
didn't download anything, and  started up almost instantly.</p>


<h4>Plausible</h4>

<p><a href="https://plausible.io/">Plausible</a> is another relatively new
analytics tool that was launched in early 2019. Soon after launching, it switched to 
<a href="https://plausible.io/blog/plausible-is-going-open-source">open
source</a>, with the code licensed under the permissive MIT license. The company's business
model is to charge for the hosting, with pricing aimed at small
businesses. In addition to making its source code available, Plausible is one of an
increasing number of companies that has a <a
href="https://plausible.nolt.io/roadmap">publicly-visible roadmap</a> for better
transparency. It also posts informational content for potential customers on its
<a href="https://plausible.io/blog/">blog</a>.</p>

<img class="photo" src="/images/lwn-plausible.png" alt="[Plausible UI from
plausible.io]" title="Plausible UI">

<p>Plausible is unique from a technology perspective, with its <a
href="https://github.com/plausible/analytics">server code</a> written in <a
href="https://elixir-lang.org/">Elixir</a>, which is a functional programming language
that runs on the Erlang virtual machine. Its frontend UI uses a small amount of
vanilla JavaScript for the interactive parts, rather than a rendering framework
like React. It also <a
href="https://plausible.io/lightweight-web-analytics">boasts</a> one of the
smallest analytics scripts, with <a
href="https://plausible.io/js/plausible.js"><tt>plausible.js</tt></a> weighing
in at 781 bytes (1.2KB uncompressed) at the time of this writing. GA's <a
href="https://www.google-analytics.com/analytics.js"><tt>analytics.js</tt></a>,
by comparison, is almost 18KB (46KB uncompressed), while GoatCounter's <a
href="https://gc.zgo.at/count.js"><tt>count.js</tt></a> is 2.3KB (6.3KB
uncompressed).  That size can make a meaningful difference since 
the scripts are loaded for each page on the site.</p>

<p>In terms of user interface, Plausible is definitely more polished than
GoatCounter. It is fairly minimalist, though, perhaps even more so than GoatCounter,
providing total visitor counts, page-view counts per path, referrer information,
map location, and devices (broken down by screen size, browser, and operating
system). The tool also provides a "<a
href="https://en.wikipedia.org/wiki/Bounce_rate">bounce rate</a>" metric,
though the exact 
definition is unclear.</p>

<p>Plausible's home page states that it provides "100% data ownership", and it is
possible to export the CSV data for a single chart (as well as delete a
Plausible.io account). However, the data dump is significantly less useful than
GoatCounter's full data dump, which includes detailed information for every
event.</p>

<p>Self-hosting Plausible is possible (even <i>plausible</i>), though as founder
Uku Taht points out in the announcement of switching to open source:</p>

<div class="BigQuote"> <p>It's worth noting that for now, there's no explicit
support for self-hosting Plausible. The project is still evolving quickly and
maintaining a self-hosted solution would slow product development down
considerably. I would love to offer a self-hosted solution in the future once
the product and the business are more stable.</p> </div>

<p>That said, just a few weeks ago, Plausible added a <a
href="https://github.com/plausible/analytics/blob/master/HOSTING.md">document</a>
that describes an experimental way to self-host the system using Docker.
Following those recommendations, I tried to use <tt>docker-compose</tt> to get
it running locally. It was a little disconcerting how many Docker and
<tt>npm</tt> packages it downloaded during the minutes-long installation
process, and even when it was done, there was a hard-to-comprehend error with a
PostgreSQL migration which prevented it from starting &mdash; the "experimental"
label definitely fits.</p>


<h4>Proprietary options, briefly</h4>

<p>There are also a couple of lightweight proprietary tools with a focus on
privacy worth mentioning. Obviously, these don't have the advantages of open
development or self-hosting, but still provide a low-cost way out of Google's
data-collection net.</p>

<p>One is the minimalist <a href="https://simpleanalytics.com/">Simple
Analytics</a> product, which is a cloud-based tool created by solo developer
Adriaan van Rossum; it has a clean-looking interface with only the few key
metrics, similar to Plausible. Another is <a
href="https://usefathom.com/">Fathom</a>, which was open source initially, but
the current version is proprietary (although the company <a
href="https://github.com/usefathom/fathom/issues/268#issuecomment-522088146">hopes</a>
to start maintaining the open-source code base again in the future).</p>



<h4>Summary</h4>

<p>The last few years have seen a number of good alternatives to Google
Analytics, particularly for those who only need a few basic features. Many of
the recent alternatives are both open source and privacy-conscious, which means there
are fewer reasons for projects and businesses to continue using proprietary analytics
systems.</p>

<p>For site owners who just need basic traffic numbers, GoatCounter and
Plausible both seem like excellent options. Those who like more visual polish
and documentation might prefer Plausible; those who value a more
developer-friendly tool with easy self-hosting will probably prefer
GoatCounter. 
We will soon be publishing a second article that looks at some
heavier-weight GA alternatives, as well as tools that provide
analytics from web-server logs.</p>
