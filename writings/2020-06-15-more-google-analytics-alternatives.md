---
layout: default
title: "More alternatives to Google Analytics"
permalink: /writings/more-google-analytics-alternatives/
description: "Some heavier replacements for Google Analytics, and a brief look at log-based analytics tools"
canonical_url: https://lwn.net/Articles/824294/
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


<p>Last week, we <a href="https://lwn.net/Articles/822568/">introduced</a> the privacy
concerns with using Google Analytics (GA) and presented two lightweight
open-source options: GoatCounter and Plausible. Those tools are useful
for site owners who need relatively basic metrics. In this second article,
we present several heavier-weight GA replacements for those who need more
detailed analytics. We also look at some tools that produce analytics data
based on web-server-access logs, GoAccess, in particular.</p>

<h4>Matomo</h4>

<p>One of the most popular heavyweight offerings is the open core <a
href="https://matomo.org/">Matomo</a>.  It was formerly called "Piwik" and was
created in 2007; LWN <a href="https://lwn.net/Articles/372594/">looked
at</a> Piwik way back in 2010. It's a full-featured alternative to Google
Analytics, so companies that need the power of GA can transition to it, but
still get the privacy and transparency benefits that come from using an
open-source and self-hosted option. As an example, web agency
Isotropic recently <a
href="https://isotropic.co/moving-to-matomo-google-analytics-biggest-competition/">switched</a>
to Matomo:</p>

<div class="BigQuote"> <p>We chose to do this as we wanted to respect our
users privacy, and felt that hosting statistics on our own server was
better for both us and them. [...] We needed something that rivaled the
functionality of Google Analytics, or was even better than it. The solution
needed to offer real-time analytics, geo-location, advertising campaign
tracking, heat maps, and be open source.</p> </div>

<p>Even though Matomo is the most popular open-source analytics tool and
has been around the longest, it's still only used <a
href="https://trends.builtwith.com/analytics/Matomo">on 1.4%</a> of the top
one million web sites, roughly 2% of GA's market share &mdash;
it's hard for even well-known open-source software to compete with the
$600-billion gorilla.</p>

<img class="photo" src="/images/lwn-matomo.png" alt="[Matomo UI from matomo.org]"
title="Matomo UI">

<p>Like GA, Matomo provides a summary dashboard with a few basic numbers
and charts, as well as many detailed reports, including location maps,
referral information, and so on.
    Additionally, Matomo has a feature called "<a
href="https://matomo.org/docs/content-tracking/">content tracking</a>"
that allows  automatically tracking users' interactions with the
content (clicks and impressions) without writing code, unlike GA, which
requires writing JavaScript or installing a third-party plugin.
The self-hosted version of Matomo has all of these features, but site
owners can also pay for and install various <a 
href="https://plugins.matomo.org/">plugins</a> such as <a
href="https://en.wikipedia.org/wiki/Purchase_funnel">funnel</a>
measurement, 
single-sign-on support, and even a rather invasive <a
href="https://plugins.matomo.org/HeatmapSessionRecording">plugin</a> that
records full user sessions including mouse movements. </p>

<p>Matomo is written in PHP and uses MySQL as its data store; <a
href="https://matomo.org/docs/installation/">installation</a> is
straightforward by simply copying the files to a web server with PHP and
MySQL installed. It's licensed under the GPLv3; it supports self-hosting
for free (standalone or as a WordPress plugin), two relatively low-cost
cloud options, and enterprise pricing. Matomo seems like a well-run project
and has a fairly active <a href="https://forum.matomo.org/">community
support forum</a>; it also provides business-level <a
href="https://matomo.org/support-plans/">support plans</a> for companies
using the self-hosted version.</p>

<h4>Open Web Analytics</h4>

<p>A similar but less popular tool is <a
href="http://www.openwebanalytics.com/">Open Web Analytics (OWA)</a>, which
is also written in PHP and licensed under the GPLv2. OWA uses a
donation-based development model rather than having monthly pricing options
for a hosted service. Of all the open-source tools, OWA is the one that
feels most like a clone of Google Analytics; even <a
href="http://demo.openwebanalytics.com/owa/index.php?owa_do=base.reportDashboard&owa_siteId=c9b7d12e322c7c360fb8f7c72ffe4c41">its
dashboard</a> looks similar to GA's &mdash; so it may be a good option for
users who are familiar with GA's interface.</p>

<p>OWA is not as feature-rich as Matomo, but still has all the basics: an
overview dashboard, web statistics, visitor locations on a map overlay, and
referrer tracking. Like Matomo, it comes with a WordPress 
integration to analyze visitors on those type of sites. It also provides various ways to <a
href="https://github.com/Open-Web-Analytics/Open-Web-Analytics/wiki#extending-owa">extend</a>
the built-in functionality, including an API, the ability to add new "modules"
(plugins), and the ability to hook into various tracking events (e.g. a
visitor's first page view or a user's mouse clicks).</p>

<p>OWA is maintained by a single developer, Peter Adams, and has had
periods of significant
inactivity. Recently, development seems to have picked up, with Adams
shipping several <a
href="https://github.com/Open-Web-Analytics/Open-Web-Analytics/releases">new
releases</a> in early 2020.
Some of the warnings on recent releases, such as <a
href="https://github.com/Open-Web-Analytics/Open-Web-Analytics/releases/tag/1.6.9">those
for the 1.6.9 release</a>, may be a bit worrisome, however ("<span>!
IMPORTANT: The API endpoint has 
changed!</span>"). Installation is again straightforward, and just requires
copying the PHP files to a web server and having a MySQL database
available.</p>

<h4>Countly</h4>

<p>Another open-core option, <a href="https://count.ly/">Countly</a>, was founded in 2013; it is
relatively feature-rich and has many dashboard types. Of the
tools we are covering, though, it is the one that feels the most like a "web
startup", complete with a polished video on its home page and sleek
dashboards in its UI.  Countly advertises that it is "<a
href="https://count.ly/your-data-your-rules">committed to giving you
control of your analytics data</a>".</p>

<img class="photo" src="/images/lwn-countly.png" alt="[Countly UI from count.ly]"
title="Countly UI">

<p>Countly has a <a href="https://count.ly/pricing">clear distinction</a>
between its enterprise edition (relatively expensive, starting at $5000
annually) and its self-hosted community edition, with the latter limited to
"basic Countly plugins" and "aggregated data". Countly's core source code
is licensed under the GNU AGPL, with the server written using Node.js
(JavaScript), and SDKs for Android and iOS written in Java and Objective&nbsp;C.</p>

<p>Countly's basic plugins provide typical analytics metrics such as simple
statistics and referrers for web and mobile devices, but also some more advanced
features like scheduling email-based reports and recording JavaScript and
mobile app crashes. However, its enterprise edition brings in a wide range of
plugins (made either by Countly or by third-party developers) that provide
advanced features such as HTTP performance monitoring, funnels with goals
and completion rates, A/B testing, and so on. Overall, Countly's community
edition is a reasonably rich offering for companies with mobile apps or
that are selling
products online, and it provides the option to upgrade to the enterprise version later if more is
needed.</p>

<h4>Snowplow</h4>

<p>A more generalized event-analytics system is <a
href="https://snowplowanalytics.com/">Snowplow Analytics</a>, founded in
2012 and marketed as "<span>the enterprise-grade event data collection
platform</span>". Snowplow provides the data collection part of the
equation, but it is up to the installer to determine how to model and
display the data. It is useful for larger companies who want control over
how they model sessions or that want to  enrich the data with business-specific
fields.</p>

<p>Setting up an installation of Snowplow is definitely not for the faint
of heart; it requires configuring the various components, along with
significant Amazon Web Services (AWS) setup; it <a
href="https://discourse.snowplowanalytics.com/t/selfhosting-of-snowplow/1109">may
be possible</a>, but not easy, to install it outside of AWS. However, there
is a comprehensive <a
href="https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow">AWS setup
guide</a> on the GitHub wiki (and the company does offer for-pay hosted
options).  Companies can set it up to insert events into PostgreSQL, AWS's
columnar Redshift database, or leave the data in Amazon S3 for further
processing.  Typically a business-intelligence tool like <a
href="https://looker.com/">Looker</a> or <a
href="https://chartio.com/">ChartIO</a> is used to view the data, but
Snowplow does not prescribe that aspect.</p>

<p>Snowplow is a collection of tools written in a number of languages,
notably Scala (via Spark) and Ruby. It is available under the
Apache&nbsp;2.0 license. Snowplow is used by <a
href="https://trends.builtwith.com/analytics/Snowplow">almost 3%</a> of the
top 10,000 web sites, so it may be a reasonable option for larger companies that
want full control over their data pipeline.</p>

<h4>Analytics using web access logs</h4>

<p>All of the systems described above use JavaScript-based tracking: the
benefit of that approach is that it provides richer information (for
example, screen resolution) and doesn't require access to web
logs. However, if server-access logs are available, it may be preferable to
feed those logs directly into analysis software. There are a number of
open-source tools that do this: three tools that have all been around for
over 20 years are <a href="https://awstats.sourceforge.io/">AWStats</a>, <a
href="https://analog.readthedocs.io/en/latest/">Analog</a>, and <a
href="http://www.webalizer.org/">Webalizer</a>. AWStats is written in Perl
and is the most full-featured and actively maintained of the bunch; Analog
is written in Python
and Webalizer is written in C, but neither is actively maintained.</p>

<p>A more recent contender is the MIT-licensed <a
href="https://goaccess.io/">GoAccess</a>, which was designed first as a
terminal-based log analyzer, but also has a nice looking HTML
view. GoAccess is written in C with only an <a
href="https://invisible-island.net/ncurses/">ncurses</a> dependency, 
and supports all of the common access-log formats, including those
from cloud services such as Amazon S3 and Cloudfront.</p>

<img class="photo" src="/images/lwn-goaccess-html.png" alt="[GoAccess UI]"
title="GoAccess UI">

<p>GoAccess is definitely the most modern-looking and well-maintained
access-log tool, and it generates all of the basic metrics: hit and visitor
count by page URL, breakdowns by operating system and browser type,
referring sites and URLs, and so on. It also has several metrics that
aren't typically included in JavaScript-based tools, for example
page-not-found URLs, HTTP status codes, and server response time.</p>

<p>GoAccess's default mode outputs a static report, but it also has an
option that updates the data in real time: it updates every 200
milliseconds in terminal mode, or every second in HTML mode (using its own
little WebSocket server). GoAccess's design seems well thought-out,
with options for incremental log parsing (using data structures stored
to disk) and support for parsing large log files using fast parsing code and
in-memory hash tables.</p>

<p>The tool is easy to install on most systems, with pre-built packages for
all the major Linux package managers, and a Homebrew version for macOS
users. It even works on Windows using Cygwin or through the Linux
Subsystem on Windows&nbsp;10.</p>

<h4>Wrapping up</h4>

<p>All in all, there are several good options for those who need more
powerful analytics, or need a system similar to GA, but are open source. For
those running e-commerce sites, or in need of features like funnel
analysis, Matomo and Countly seem like good choices. Enterprises that need
direct control over how their events are stored and modeled should perhaps
consider a Snowplow installation. For those who have access to their web
logs or just don't want to use JavaScript-based tracking, GoAccess seems
like a good choice for web-log analysis in 2020.</p>
