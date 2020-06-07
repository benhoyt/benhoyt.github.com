---
layout: default
title: "Replacing Google Analytics (LWN edition)"
permalink: /writings/replacing-google-analytics-lwn-edition/
description: "Why more people are moving away from Google Analytics, and a look at some of the privacy-conscious alternatives (free and for-pay)."
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


<p>More and more website owners and users are concerned about the all-seeing Google tracking them as they browse around the web. Google Analytics (GA) is a free and full-featured web analytics system and, despite the privacy concerns, has become the de-facto standard analytics tool for small and large websites alike. However, in recent years a growing number of alternatives are helping break Google's dominance &mdash; many of them open source.</p>

<p>GA is by far the dominant player here: BuiltWith <a href="https://trends.builtwith.com/analytics/Google-Analytics">shows</a> that around 86% of the top 100,000 websites use GA. This figure goes down to 64% for the top one million websites. These figures have grown steadily for the past 15 years, since Google acquired Urchin and rebranded it as Google Analytics.</p>

<p>In addition to privacy concerns, GA is too complex and feature-heavy for the majority of small website owners, many of whom just want to see how much traffic is going to the pages on their website, and from what sources it's coming from. So it's not surprising that a plethora of simpler, more open tools have taken off in the past few years.</p>


<h4>Lightweight open source alternatives</h4>

<p><a href="https://plausible.io/">Plausible</a> is one of the more recent web analytics tools, and since soon after launching in early 2019 they have been <a href="https://plausible.io/blog/plausible-is-going-open-source">fully open source</a>, with the code licensed under a permissive MIT license. Their business model is to charge for the hosting, with <a href="https://plausible.io/#pricing">low pricing</a> that should work for a lot of small businesses. Self-hosting Plausible is possible (even <i>plausible</i>), though as the company states:</p>

<div class="BigQuote">
<p>It's worth noting that for now, there's no explicit support for self-hosting Plausible. The project is still evolving quickly and maintaining a self-hosted solution would slow product development down considerably. I would love to offer a self-hosted solution in the future once the product and the business are more stable.</p>
</div>

<p>In addition to their source code being available, Plausible is one of an increasing number of companies that has a <a href="https://plausible.nolt.io/roadmap">publicly-visible roadmap</a>, presumably for better transparency and engagement with their customers. It seems that customer engagement is a big part of what they do, with a helpful blog featuring content like <a href="https://plausible.io/blog/remove-google-analytics">Why you should stop using Google Analytics on your website</a>, <a href="https://plausible.io/blog/google-analytics-seo">Will removing Google Analytics from a site hurt search engine rankings?</a>, a <a href="https://plausible.io/vs-matomo">comparison</a> with the popular Matomo analytics tool, and so on.</p>

<p>Plausible is also somewhat unique from a developer perspective, with their <a href="https://github.com/plausible-insights/plausible">server code</a> written in <a href="https://elixir-lang.org/">Elixir</a>, a functional programming language that runs on the Erlang virtual machine. Their frontend UI uses "some vanilla Javascript for interactive bits" rather than a rendering framework like React. They also <a href="https://plausible.io/lightweight-web-analytics">boast</a> one of the smallest analytics scripts, with <a href="https://plausible.io/js/plausible.js"><tt>plausible.js</tt></a> weighing in at 781 bytes at the time of writing (about half the size of their favicon). GA's <a href="https://www.google-analytics.com/analytics.js"><tt>analytics.js</tt></a>, in comparison, is almost 18KB.</p>

<p><a href="https://www.goatcounter.com/">GoatCounter</a> is another open source tool that launched shortly after Plausible, in <a href="https://www.arp242.net/goatcounter.html">August 2019</a>. Created by Martin Tournoij, it has more of a "made by a single developer" feel than other tools, and it's a little less slick-looking than Plausible, but that may well be a positive to some (particularly LWN readers).</p>

<p>GoatCounter has a slightly different model than Plausible, with its source code <a href="https://www.arp242.net/license.html">licensed</a> under the copyleft European Union Public License (EUPL), and the company charging a small monthly fee for commercial use. Tournoij has a <a href="https://www.arp242.net/license.html">lengthy article</a> discussing why he chose the EUPL, noting:</p>

<div class="BigQuote">
<p>I still don't really care what people do with my code, but I do care if my ability to make a living would be unreasonably impeded. Taking my MIT code and working full-time on enhancements that aren't sent back to me means my competitor has double the amount of people working on it: me (for free, from their perspective), and them. They will always have an advantage over me.</p>
</div>

<p>GoatCounter is written in Go, and like Plausible, uses vanilla JavaScript for some lightweight interactivity. JavaScript frameworks often get in the way of web accessibility, and GoatCounter's prioritization of accessibility (mentioned on their homepage) struck a chord with "ctoth", a blind developer who <a href="https://news.ycombinator.com/item?id=22047556">thanked</a> Tournoij on Hacker News:</p>

<div class="BigQuote">
<p>First time I've ever seen a comment about accessibility on the homepage of a mainstream product like this. As a blind developer this was just awesome, made me really feel like somebody out there is listening. Thank you for making this.</p>
</div>

<p>Another open source offering is <a href="https://count.ly/">Countly</a>, founded in 2013. Countly is comparatively feature rich and has a large number of dashboard types. However, of the smaller analytics tools it feels the most like a "web startup", complete with a polished video on their homepage and <a href="https://count.ly/images/home/countly-overview.png">sleek dashboards</a> in their UI. Countly seems to make less of a big deal about privacy, but is clear that they are "<a href="https://count.ly/your-data-your-rules">committed to giving you control of your analytics data</a>.</p>

<p>Countly has a very clear distinction between their enterprise edition (relatively expensive at $5000 annually) and their install-it-yourself community edition. The source code is licensed under the GNU AGPL, with the server written in JavaScript, and "SDKs" for Android and iOS written in Java and Objective C.</p>


<h4>Heavier open source tools</h4>

<p>On the heavier end of the spectrum, there is <a href="https://matomo.org/">Matomo</a>, formerly called "Piwik", which was created in 2007. It's a full-featured alternative to Google Analytics, so companies that need the power of GA can transition to it, but still get the privacy and trasparency benefits from using an open source alternative. As an example, web agency Isotropic recently <a href="https://isotropic.co/moving-to-matomo-google-analytics-biggest-competition/">switched</a> to Matomo:</p>

<div class="BigQuote">
<p>We chose to do this as we wanted to respect our users privacy, and felt that hosting statistics on our own server was better for both us and them. [...] We needed something that rivaled the functionality of Google Analytics, or was even better than it. The solution needed to offer real-time analytics, geolocation, advertising campaign tracking, heat Maps, and be open source. 
</p>
</div>

<p>Even though Matomo is the most popular open source analytics tool and has been around the longest, they're still only used <a href="https://trends.builtwith.com/analytics/Matomo">on 1.4%</a> of the top one million websites, roughly a fiftieth of GA's market share &mdash; it's hard for even well-known open source software to compete with the $600 billion gorilla.</p>

<p>Matomo is written in PHP and uses MySQL as its data store. It's licensed under the GNU General Public License (GPL), and supports <a href="https://matomo.org/docs/installation/">installing it yourself</a> for free (including as a Wordpress plugin), two relatively low-cost cloud-hosted options, and enterprise pricing.</p>

<p>A similar but less popular tool is <a href="http://www.openwebanalytics.com/">Open Web Analytics (OWA)</a>, which is also written in PHP and licensed under the GPL. It uses a donations-based development model rather than having monthly pricing options. Of all the open source tools, OWA is the one that feels most like a clone of Google Analytics; even <a href="http://demo.openwebanalytics.com/owa/index.php?owa_do=base.reportDashboard&owa_siteId=c9b7d12e322c7c360fb8f7c72ffe4c41">its dashboard</a> looks very similar to GA's.</p>

<p><a href="https://snowplowanalytics.com/">Snowplow Analytics</a>, founded in 2012 and marketed as "the enterprise-grade event data collection platform", only provides the data collection part of the equation, and gives you full control over how to model and display the data. It's useful for larger companies who want to control over how they model sessions or "enrich" their data with business-specific fields.</p>

<p>Setting up your own installation of Snowplow is definitely not for the faint of heart, and requires configuring the various components, as well as significant AWS setup. However, they do provide a comprehensive <a href="https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow">setup guide</a> on their GitHub wiki. Companies can set it up to insert events into PostgreSQL or AWS's columnar Redshift database, or leave the data in S3 for further processing. Typically a business intelligence tool like <a href="https://looker.com/">Looker</a> or <a href="https://chartio.com/">ChartIO</a> is used to view the data, but Snowplow doesn't prescribe that aspect.</p>

<p>Snowplow is collection of tools written in a number of languages, notably Scala (via Spark) and Ruby. Used by <a href="https://trends.builtwith.com/analytics/Snowplow">0.6%</a> of the top one million websites, it's a serious contender, and a compelling option for larger companies that want full control over the data pipeline.</p>



<h4>Proprietary alternatives</h4>

<p>TODO: There are a large number of proprietary (and usually expensive) analytics systems, such as Adobe Analytics, Mixpanel, and Quantcast. Here we look at a couple of the smaller, privacy-focussed options:</p>

<p>https://simpleanalytics.com/ - SaaS</p>

<p>https://usefathom.com/ - SaaS - Open version is no longer maintained in favour of a complete (closed source) rewrite, although there is a promise to start maintaining it in the future again (see https://github.com/usefathom/fathom/issues/268).</p>


<h4>Web log based systems</h4>

<p>TODO: going old school and just analyzing web logs, for when you have server access and don't need anything from JavaScript (device screen size, etc)...

https://goaccess.io/
https://en.wikipedia.org/wiki/Analog_(program)
https://en.wikipedia.org/wiki/Webalizer
https://en.wikipedia.org/wiki/AWStats


<h4>An aside about "Do Not Track"</h4>

<p>Internet privacy is not a new topic, and the "Do Not Track (DNT)" HTTP header had a <a href="https://lwn.net/Articles/439460/">promising start</a> a decade ago, but as of 2020 it's basically dead, due to lack of adoption by the industry. Companies argued that its legal status was unclear, and that it was difficult to determine how to interpreter the header. As one example, GoatCounter <a href="https://www.arp242.net/dnt.html">describes</a> why ignoring the header is "a feature".</p>

<p>In January 2019 the W3C <a href="https://github.com/w3c/dnt/commit/5d85d6c3d116b5eb29fddc69352a77d87dfd2310">shut down</a> its "Tracking Protection Working Group" that was working on DNT, and Apple <a href="https://developer.apple.com/documentation/safari_release_notes/safari_12_1_release_notes#3130299">removed support</a> for "the expired Do Not Track standard" from Safari in March that same year.</p>

<p>Ironically, Apple's reason for removing support for the header was to "prevent potential use as a fingerprinting variable". Tracking systems often use a fingerprint of a user's HTTP headers to track them across different websites, and the <tt>DNT: 1</tt> header &mdash; given its low use &mdash; adds uniqueness to the user's headers and may make them <i>more</i> trackable.</p>

<p>Since then, Apple has been steadily rolling out what they call <a href="https://webkit.org/blog/7675/intelligent-tracking-prevention/">"Intelligent Tracking Prevention"</a>, which is a more holistic approach that prevents the use of third-party cookies after a certain time window, and helps avoid tracking via query string parameters ("<a href="https://webkit.org/blog/8828/intelligent-tracking-prevention-2-2/">link decoration</a>").</p>

<p>Mozilla Firefox <a href="https://blog.mozilla.org/blog/2019/09/03/todays-firefox-blocks-third-party-tracking-cookies-and-cryptomining-by-default/">added</a> similar protections from third-party cookies in September 2019. Microsoft <a href="https://docs.microsoft.com/en-us/microsoft-edge/web-platform/tracking-prevention">included</a> tracking prevention in the new Chromium-based version of their Edge browser, released January 2020. Even Google, much of whose revenue comes from advertising (and indirectly, tracking), announced their own <a href="https://blog.chromium.org/2020/01/building-more-private-web-path-towards.html">plans</a> to phase out support for third-party cookies in Chrome over the next two years.</p>


<h4>Wrapping up</h4>

<p>TODO: Many good options available, the time is right to use an alternative, blah blah blah.</p>
