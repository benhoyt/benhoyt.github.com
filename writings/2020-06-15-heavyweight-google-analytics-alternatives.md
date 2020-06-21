---
layout: default
title: "Heavyweight Google Analytics alternatives, and log analytics tools"
permalink: /writings/heightweight-google-analytics-alternatives/
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

<p>TODO: continued from last time, here are the heavy-weight tools, etc.</p>

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

<h4>Matomo</h4>

<p>Another heavier offering is <a
href="https://matomo.org/">Matomo</a>, formerly called "Piwik", which was
created in 2007 (LWN <a href="/Articles/372594/">looked at</a> Piwik way
back in 2010). It's a full-featured alternative to Google Analytics, so
companies that need the power of GA can transition to it, but still get the
privacy and transparency benefits that come from using an open-source and self-hosted
alternative. As an example, web agency Isotropic recently <a
href="https://isotropic.co/moving-to-matomo-google-analytics-biggest-competition/">switched</a>
to Matomo:</p>

<div class="BigQuote">

<p>We chose to do this as we wanted to respect our users privacy, and felt
that hosting statistics on our own server was better for both us and
them. [...] We needed something that rivaled the functionality of Google
Analytics, or was even better than it. The solution needed to offer
real-time analytics, geolocation, advertising campaign tracking, heat Maps,
and be open source.  </p>
</div>

<p>Even though Matomo is the most popular open-source analytics tool and
has been around the longest, it's still only used <a
href="https://trends.builtwith.com/analytics/Matomo">on 1.4%</a> of the top
one million web sites, roughly one-fiftieth of GA's market share &mdash; it's
hard for even well-known open-source software to compete with the
$600-billion gorilla.</p> 

<p>Matomo is written in PHP and uses MySQL as its data store. It's licensed
under the GNU General Public License (GPL), and supports <a
href="https://matomo.org/docs/installation/">self-installation</a> for
free (standalone or as a WordPress plugin), two relatively low-cost cloud
options, and enterprise pricing.</p>

<p>A similar but less popular tool is <a
href="http://www.openwebanalytics.com/">Open Web Analytics (OWA)</a>, which
is also written in PHP and licensed under the GPL. OWA uses a
donation-based development model rather than having monthly pricing
options for a hosted service. Of all the open-source tools, OWA is the one
that feels most like a clone of Google Analytics; even <a
href="http://demo.openwebanalytics.com/owa/index.php?owa_do=base.reportDashboard&owa_siteId=c9b7d12e322c7c360fb8f7c72ffe4c41">its
dashboard</a> looks similar to GA's &mdash; so it may be a good option for
non-technical users who are familiar with GA's interface.</p>

<p>OWA is maintained by a single developer, Peter Adams, and has had
periods of <a
href="https://www.sanfranciscofogworks.com/posts/leaving-google-analytics-piwik-vs-open-web-analytics">significant
inactivity</a>. Recently, development seems to have picked up, with Adams
shipping several <a
href="https://github.com/Open-Web-Analytics/Open-Web-Analytics/releases">new
releases</a> in early 2020. (Though it is somewhat worrisome that the latest
point release, 1.6.9, has three large breaking-change warnings in the
release description, such as "<span>! IMPORTANT: The API endpoint has
changed!</span>")</p>

<p>A more generalized event-analytics system is <a
href="https://snowplowanalytics.com/">Snowplow Analytics</a>, founded in
2012 and marketed as "<span>the enterprise-grade event data collection
platform</span>". Snowplow provides the data collection part of the equation, but
it is up to the installer to determine how to model and display the
data. It's useful for larger companies who want control over how they model
sessions or "enrich" their data with business-specific fields.</p>

<p>Setting up an installation of Snowplow is definitely not for the faint
of heart; it requires configuring the various components, along with
significant AWS setup. However, there is a comprehensive <a
href="https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow">setup
guide</a> on the GitHub wiki. Companies can set it up to insert events into
PostgreSQL, AWS's columnar Redshift database, or leave the data in Amazon
S3 for further processing. Typically a business-intelligence tool like <a
href="https://looker.com/">Looker</a> or <a
href="https://chartio.com/">ChartIO</a> is used to view the data, but
Snowplow does not prescribe that aspect.</p>

<p>Snowplow is a collection of tools written in a number of languages,
notably Scala (via Spark) and Ruby. Used by <a
href="https://trends.builtwith.com/analytics/Snowplow">almost 3%</a> of the
top 10,000 web sites, it's a compelling option for larger companies that
want full control over their data pipeline.</p>

<h4>Web access log analytics</h4>

<p>All of the systems described above use JavaScript-based tracking: the
benefit of that approach is that it provides richer information
(for example, screen resolution) and doesn't require access to web
logs. However, if server access logs are available, it may be better to feed
those logs directly into analysis software. There are a number of
open-source tools for this: <a
href="https://awstats.sourceforge.io/">AWStats</a>, <a
href="https://analog.readthedocs.io/en/latest/">Analog</a>, and <a
href="http://www.webalizer.org/">Webalizer</a> are three tools that have
all been around for over 20 years. AWStats is written in Perl and is the
most full-featured and actively maintained of the bunch; Analog and
Webalizer are both written in C and are not actively maintained.</p>

<p>A more recent contender is the MIT-licensed <a
href="https://goaccess.io/">GoAccess</a>, which was designed as a
terminal-based log analyzer, but also has a nice looking HTML
view. GoAccess is written in C with only <tt>ncurses</tt> as a dependency,
and supports all of the common access-log formats, as well as log files
from cloud services such as Amazon S3 and Cloudfront. GoAccess 
seems like a good choice for web-log analysis in 2020.</p>

<img class="photo" src="/images/lwn-goaccess-html.png" alt="[GoAccess UI]" title="GoAccess UI">

<p>If web-access logs are unavailable, developers can still use GoAccess if
they are willing to put a Content Delivery Network (CDN) &mdash; such as AWS
Cloudfront or Cloudflare &mdash; in front of their web site. The CDN logs
can then be downloaded and run through GoAccess. There are other
possibilities too, such as <a
href="https://benhoyt.com/writings/replacing-google-analytics/">my own
approach</a> of using GoAccess on a web site served by GitHub Pages &mdash;
this method uses a "tracking pixel" served by Cloudfront with logging
enabled, and a Python script that transforms logs before sending them to
GoAccess.</p>

<h4>Wrapping up</h4>

<p>The last few years have seen a number of good alternatives to Google
Analytics, particularly for those who only need a few basic features. Most
of the recent alternatives are both open source and privacy conscious, so now
there are few reasons for projects and businesses to use
proprietary analytics systems.</p>

<p>For site owners who just need basic traffic numbers, Plausible and
GoatCounter seem like excellent options (those that like more visual polish
and documentation might prefer Plausible). For those running e-commerce
sites, or in need of features like funnel analysis, Matomo seems like a good
choice. And enterprises that need direct control over how their events are
stored and modeled should perhaps consider a Snowplow installation.</p>
