---
layout: default
title: "Replacing Google Analytics (LWN edition)"
permalink: /writings/replacing-google-analytics-lwn-edition/
description: "Moving from Google Analytics to open source and privacy-conscious alternatives"
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

<p>GA is by far the biggest player here: BuiltWith <a href="https://trends.builtwith.com/analytics/Google-Analytics">shows</a> that around 86% of the top 100,000 websites use GA. This figure goes down to 64% for the top one million websites. These figures have grown steadily for the past 15 years, since Google acquired Urchin and rebranded it as Google Analytics.</p>

<p>In addition to privacy concerns, GA is more complex and feature-heavy than the majority of website owners need, many of whom just want to see how much traffic is going to the pages on their site, and from what sources the traffic is coming from. So it's not surprising that a plethora of simpler, more open tools have taken off in the past few years.</p>


<h4>Lightweight alternatives</h4>

<p><a href="https://plausible.io/">Plausible</a> is one of the more recent web analytics tools, and since soon after launching in early 2019 it has been <a href="https://plausible.io/blog/plausible-is-going-open-source">fully open source</a>, with the code licensed under a permissive MIT license. Its business model is to charge for the hosting, with low pricing that should work for a lot of small businesses. Self-hosting Plausible is possible (even <i>plausible</i>), though as founder Uku Taht notes:</p>

<div class="BigQuote">
<p>It's worth noting that for now, there's no explicit support for self-hosting Plausible. The project is still evolving quickly and maintaining a self-hosted solution would slow product development down considerably. I would love to offer a self-hosted solution in the future once the product and the business are more stable.</p>
</div>

<img src="/images/lwn-plausible.png">

<p>In addition to its source code being available, Plausible is one of an increasing number of companies that has a <a href="https://plausible.nolt.io/roadmap">publicly-visible roadmap</a>, presumably for better transparency and engagement with its customers. It seems that customer engagement is a big part of what it does, with a helpful blog featuring content like <a href="https://plausible.io/blog/remove-google-analytics">Why you should stop using Google Analytics on your website</a>, <a href="https://plausible.io/blog/google-analytics-seo">Will removing Google Analytics from a site hurt search engine rankings?</a>, and a <a href="https://plausible.io/vs-matomo">comparison</a> with the popular Matomo analytics tool.</p>

<p>Plausible is also somewhat unique from a developer perspective, with its <a href="https://github.com/plausible-insights/plausible">server code</a> written in <a href="https://elixir-lang.org/">Elixir</a>, a functional programming language that runs on the Erlang virtual machine. Its frontend UI uses "some vanilla Javascript for interactive bits" rather than a rendering framework like React. It also <a href="https://plausible.io/lightweight-web-analytics">boasts</a> one of the smallest analytics scripts, with <a href="https://plausible.io/js/plausible.js"><tt>plausible.js</tt></a> weighing in at 781 bytes at the time of writing (about half the size of Plausible's favicon). GA's <a href="https://www.google-analytics.com/analytics.js"><tt>analytics.js</tt></a>, in comparison, is almost 18KB.</p>

<p><a href="https://www.goatcounter.com/">GoatCounter</a> is another open source tool that launched shortly after Plausible, in <a href="https://www.arp242.net/goatcounter.html">August 2019</a>. Created by Martin Tournoij, it has more of a "made by a single developer" feel than other tools, and it's a little less slick-looking than Plausible, but that may well be a positive to some.</p>

<p>GoatCounter has a slightly different model than Plausible, with its source code <a href="https://www.arp242.net/license.html">licensed</a> under the copyleft European Union Public License (EUPL), and the company charging a small monthly fee for commercial use. Tournoij has a <a href="https://www.arp242.net/license.html">lengthy article</a> discussing why he chose the EUPL, noting:</p>

<div class="BigQuote">
<p>I still don't really care what people do with my code, but I do care if my ability to make a living would be unreasonably impeded. Taking my MIT code and working full-time on enhancements that aren't sent back to me means my competitor has double the amount of people working on it: me (for free, from their perspective), and them. They will always have an advantage over me.</p>
</div>

<img src="/images/lwn-goatcounter.png">

<p>GoatCounter is written in Go, and like Plausible, uses vanilla JavaScript for some lightweight interactivity. JavaScript frameworks often get in the way of web accessibility, and GoatCounter's prioritization of accessibility (mentioned on its homepage) struck a chord with <tt>ctoth</tt>, a blind developer who <a href="https://news.ycombinator.com/item?id=22047556">thanked</a> Tournoij on Hacker News:</p>

<div class="BigQuote">
<p>First time I've ever seen a comment about accessibility on the homepage of a mainstream product like this. As a blind developer this was just awesome, made me really feel like somebody out there is listening. Thank you for making this.</p>
</div>

<p>Another open source offering is <a href="https://count.ly/">Countly</a>, founded in 2013. Countly is comparatively feature rich and has a large number of dashboard types. However, of the smaller analytics tools it feels the most like a "web startup", complete with a polished video on its homepage and <a href="https://count.ly/images/home/countly-overview.png">sleek dashboards</a> in its UI. Countly seems to make less of a big deal about privacy, but it is "<a href="https://count.ly/your-data-your-rules">committed to giving you control of your analytics data</a>".</p>

<img src="/images/lwn-countly.png">

<p>Countly has a clear distinction between its enterprise edition (relatively expensive at $5000 annually) and its install-it-yourself community edition. The source code is licensed under the GNU AGPL, with the server written in JavaScript, and SDKs for Android and iOS written in Java and Objective C.</p>

<p>There are also a couple of lightweight proprietary tools: of note is the somewhat minimalist <a href="https://simpleanalytics.com/">Simple Analytics</a> product, as well as <a href="https://usefathom.com/">Fathom</a>, which was open source initially, but the current version is proprietary (although Fathom <a href="https://github.com/usefathom/fathom/issues/268">hopes</a> to start maintaining the open source codebase again in the near future).</p>


<h4>Heavier tools</h4>

<p>On the heavier end of the spectrum, there is <a href="https://matomo.org/">Matomo</a>, formerly called "<a href="https://lwn.net/Articles/372594/">Piwik</a>", which was created in 2007. It's a full-featured alternative to Google Analytics, so companies that need the power of GA can transition to it, but still get the privacy and transparency benefits from using an open source alternative. As an example, web agency Isotropic recently <a href="https://isotropic.co/moving-to-matomo-google-analytics-biggest-competition/">switched</a> to Matomo:</p>

<div class="BigQuote">
<p>We chose to do this as we wanted to respect our users privacy, and felt that hosting statistics on our own server was better for both us and them. [...] We needed something that rivaled the functionality of Google Analytics, or was even better than it. The solution needed to offer real-time analytics, geolocation, advertising campaign tracking, heat Maps, and be open source. 
</p>
</div>

<p>Even though Matomo is the most popular open source analytics tool and has been around the longest, it's still only used <a href="https://trends.builtwith.com/analytics/Matomo">on 1.4%</a> of the top one million websites, roughly a fiftieth of GA's market share &mdash; it's hard for even well-known open source software to compete with the $600 billion gorilla.</p>

<p>Matomo is written in PHP and uses MySQL as its data store. It's licensed under the GNU General Public License (GPL), and supports <a href="https://matomo.org/docs/installation/">installing it yourself</a> for free (standalone or as a Wordpress plugin), two relatively low cost cloud options, and enterprise pricing.</p>

<p>A similar but less popular tool is <a href="http://www.openwebanalytics.com/">Open Web Analytics (OWA)</a>, which is also written in PHP and licensed under the GPL. OWA uses a donations-based development model rather than having monthly pricing options. Of all the open source tools, OWA is the one that feels most like a clone of Google Analytics; even <a href="http://demo.openwebanalytics.com/owa/index.php?owa_do=base.reportDashboard&owa_siteId=c9b7d12e322c7c360fb8f7c72ffe4c41">its dashboard</a> looks similar to GA's.</p>

<p>A more generalized event analytics system is <a href="https://snowplowanalytics.com/">Snowplow Analytics</a>, founded in 2012 and marketed as "the enterprise-grade event data collection platform". Snowplow provides the data collection part of the equation, but it is up to the installer to determine how to model and display the data. It's useful for larger companies who want control over how they model sessions or "enrich" their data with business-specific fields.</p>

<p>Setting up an installation of Snowplow is definitely not for the faint of heart, and requires configuring the various components, as well as significant AWS setup. However, it does provide a comprehensive <a href="https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow">setup guide</a> on its GitHub wiki. Companies can set it up to insert events into PostgreSQL or AWS's columnar Redshift database, or leave the data in S3 for further processing. Typically a business intelligence tool like <a href="https://looker.com/">Looker</a> or <a href="https://chartio.com/">ChartIO</a> is used to view the data, but Snowplow doesn't prescribe that aspect.</p>

<p>Snowplow is collection of tools written in a number of languages, notably Scala (via Spark) and Ruby. Used by <a href="https://trends.builtwith.com/analytics/Snowplow">almost 3%</a> of the top 10,000 websites, it's a compelling option for larger companies that want full control over the data pipeline.</p>

<p>Of course, there are also a number of fairly heavy-weight proprietary alternatives to Google Analytics, such as <a href="https://www.adobe.com/nz/analytics/adobe-analytics.html">Adobe Analytics</a>, <a href="https://mixpanel.com/">Mixpanel</a>, and <a href="https://www.quantcast.com/products/measure-audience-insights/">Quantcast Measure</a>. What's less clear is how much would be gained by using one of these tools &mdash; they're not open source, and none of them seem particularly interested in addressing privacy concerns.</p>


<h4>Web access log analytics</h4>

<p>All of the systems described above used JavaScript-based analytics: the benefits of JavaScript approaches are that it provides richer information (for example, screen resolution) and doesn't require access to web logs.</p>

<p>However, if server access logs are available, it may be better to feed those logs directly into analysis software. There are a number of open source tools that do this: <a href="https://awstats.sourceforge.io/">AWStats</a>, <a href="https://analog.readthedocs.io/en/latest/">Analog</a>, and <a href="http://www.webalizer.org/">Webalizer</a> are three tools that have all been around for over 20 years. AWStats is written in Perl and is the most full-featured and actively maintained of the bunch; Analog and Webalizer are both written in C and are not actively maintained.</p>

<p>A more recent contender is the MIT-licensed <a href="https://goaccess.io/">GoAccess</a>, which was designed as a terminal-based log analyzer, but also has a nice looking HTML view. GoAccess is written in C with only <tt>ncurses</tt> as a dependency, and supports all of the common access log formats, as well as log files from cloud services such as Amazon S3 and Cloudfront. GoAccess definitely seems like a good choice for web log analysis in 2020.</p>

<img src="/images/lwn-goaccess-html.png">

<p>If web access logs are unavailable, developers can still use GoAccess if they're willing to put a CDN (such as AWS Cloudfront or Cloudflare) in front of their website. The CDN logs can then be downloaded and run through GoAccess. There are other approaches too, such as <a href="https://benhoyt.com/writings/replacing-google-analytics/">this article</a> describing how to use GoAccess on a website served by GitHub Pages &mdash; this method uses a "tracking pixel" with Cloudfront logging and a Python script that transforms logs before sending them to GoAccess.</p>


<h4>Wrapping up</h4>

<p>The last few years have seen a number of good alternatives to Google Analytics, particularly for those who only need a few basic features. Most of the recent alternatives are both open source and privacy-conscious, so there are now very few reasons for projects and businesses to use proprietary analytics systems.</p>
