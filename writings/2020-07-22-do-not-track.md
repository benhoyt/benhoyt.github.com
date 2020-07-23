---
layout: default
title: "The sad, slow-motion death of Do Not Track"
permalink: /writings/do-not-track/
description: "The Do Not Track header was a valiant, 10-year effort to prevent tracking. Unfortunately, it doesn't seem to have taken."
canonical_url: https://lwn.net/Articles/826575/
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


<p>"Do Not Track" (DNT) is a simple HTTP header that a browser can send to
signal to a web site that the user does not want to be tracked. The DNT
header had a <a href="https://lwn.net/Articles/424861/">promising start</a> and the <a
href="https://lwn.net/Articles/439460/">support of major browsers</a> almost a decade
ago. Most web browsers still support sending it, but in 2020 it is almost
useless because the vast majority of web sites ignore it. Advertising
companies, in particular, argued that its legal status was unclear, and
that it was difficult to determine how to interpret the header. There have
been some relatively recent attempts at legislation to enforce honoring the
DNT header, but those efforts do not appear to be going anywhere.  In
comparison, the European Union's <a
href="https://en.wikipedia.org/wiki/General_Data_Protection_Regulation">General
Data Protection Regulation</a> (GDPR) and the <a
href="https://en.wikipedia.org/wiki/California_Consumer_Privacy_Act">California
Consumer Privacy Act</a> (CCPA) attempt to solve some of the same problems
as DNT but are legally enforceable.  </p>

<p>In 2007, the US Federal Trade Commission was <a
href="https://cdt.org/wp-content/uploads/privacy/20071031consumerprotectionsbehavioral.pdf">asked
[PDF]</a> to create a "Do Not
Track" list, similar to the popular "Do Not Call" list. This would have been a
list of advertiser domain names  that tracked consumer behavior online,
and would allow browsers to prevent requests to those sites if the user
opted in. However, that approach never got off the ground, and DNT first
appeared as a header in 2009, when security researchers Christopher
Soghoian, Sid Stamm, and Dan Kaminsky got together to create a
prototype. In his 2011 article on the <a
href="http://paranoia.dubfire.net/2011/01/history-of-do-not-track-header.html">history
of DNT</a>, Soghoian wrote:</p>

<div class="BigQuote">
<p>In July of 2009, I decided to try and solve this problem. My friend and
research collaborator Sid Stamm helped me to put together a prototype
Firefox add-on that added two headers to outgoing HTTP requests:</p>

<p><tt>X-Behavioral-Ad-Opt-Out: 1</tt><br>
<tt>X-Do-Not-Track: 1</tt></p>

<p>The reason I opted for two headers was that many advertising firms' opt
outs only stop their use of behavioral data to customize advertising. That
is, even after you opt out, they continue to track you.</p>

</div>

<p>At some point, Soghoian said, "<span>the Behavioral Advertising Opt
Out header seems to have been discarded, and instead, focus has shifted to
a single header to communicate a user's preference to not be
tracked</span>". The final <a
href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/DNT">format</a>
of the header is literally "<tt>DNT:&nbsp;1</tt>".</p>

<p>Even back when Soghoian wrote that article, it was clear that
getting advertisers to respect the header wasn't going to be easy:</p>

<div class="BigQuote">
<p>The technology behind implementing the Do Not Track header is trivially
easy - it took Sid Stamm just a few minutes to whip up the first
prototype. The far more complex problem relates to the policy questions of
what advertising networks do when they receive the header. This is
something that is very much still up in the air (particularly since no ad
network has agreed to look for or respect the header).</p>
</div>

<p>Part of the problem was defining what "tracking"
means in this context. The Electronic Frontier Foundation (EFF), which has
been involved in DNT efforts from the beginning, <a
href="https://www.eff.org/deeplinks/2011/02/what-does-track-do-not-track-mean">defines</a>
it as "<span>the retention of information that can be used to connect
records of a person's actions or reading habits across space, cyberspace,
or time</span>". The EFF's article also lists certain exceptions that are
not considered tracking, which notably allows for "analytics
providers". The article is also careful to distinguish between tracking by
a first-party ("<span>the website you can see in your browser's address
bar</span>"), which is allowed, and tracking by a third-party (other
domains), which is not.</p>

<p>Starting with Mozilla Firefox in January 2011, browsers began to
implement the "trivially easy" part, allowing users to opt into sending
the new header. Microsoft followed soon after, adding DNT support to
Internet Explorer 9 in March 2011. Apple followed suit with Safari in April
2011. Google was a little late to the game, but <a
href="https://chrome.googleblog.com/2012/11/longer-battery-life-and-easier-website.html">added
support</a> to Chrome in November 2012.</p>

<p>In September 2011 a W3C "<a
href="https://www.w3.org/2011/tracking-protection/">Tracking Protection
Working Group</a>" was formed "<span>to improve user privacy and user
control by defining mechanisms for expressing user preferences around Web
tracking and for blocking or allowing Web tracking elements</span>". During
its eight active years, the group published a <a
href="https://www.w3.org/TR/tracking-dnt/">specification of the DNT
header</a> as well as a <a
href="https://www.w3.org/TR/tracking-compliance/">set of practices</a>
about what compliance for DNT means. Unfortunately, in January 2019 the
working group was closed with this <a
href="https://github.com/w3c/dnt/commit/5d85d6c3d116b5eb29fddc69352a77d87dfd2310">notice</a>:</p>

<div class="BigQuote">
<p>Since its last publication as a Candidate Recommendation, there has not
been sufficient deployment of these extensions (as defined) to justify
further advancement, nor have there been indications of planned support
among user agents, third parties, and the ecosystem at large. The working
group has therefore decided to conclude its work and republish the final
product as this Note, with any future addendums to be published
separately.</p> 
</div>

<p>As early as 2012, <a href="https://lwn.net/Articles/520047/">LWN
wrote</a> about how it wasn't looking good for DNT: advertising groups were
pushing back (unsurprisingly), and there was no legal definition of how the
header should be interpreted. In addition, Microsoft's decision in May 2012
to <a
href="https://docs.microsoft.com/en-us/archive/blogs/microsoft_on_the_issues/advancing-consumer-trust-and-privacy-internet-explorer-in-windows-8">enable
the header by default</a> in Internet Explorer 10 backfired, as DNT had
always been intended to indicate a deliberate choice made by the consumer. Roy
Fielding even committed a <a
href="https://github.com/apache/httpd/commit/a381ff35fa4d50a5f7b9f64300dfd98859dee8d0">change</a>
to unset the DNT header in the Apache web server if the request was coming from Internet Explorer
10 &mdash; possibly setting a record for the number of comments on a GitHub
commit. Even though Microsoft finally <a
href="https://blogs.microsoft.com/on-the-issues/2015/04/03/an-update-on-microsofts-approach-to-do-not-track/">removed
this default</a> in April 2015, it's likely that this well-intentioned move
muddied the DNT waters.</p>

<p>A few high-profile web sites did honor Do Not Track, including Reddit,
Twitter, Medium, and Pinterest. Tellingly, however, as of today two of
those sites now ignore the header: Reddit's <a
href="https://www.redditinc.com/policies/privacy-policy">privacy policy</a>
now states that "<span>there is no accepted standard for how a website
should respond to this signal, and we do not take any action in response to
this signal</span>", and Twitter <a
href="https://help.twitter.com/en/safety-and-security/twitter-do-not-track">notes</a>
that it discontinued support (as of May 2017) because "<span>an
industry-standard approach to Do Not Track did not materialize</span>". At
present, <a
href="https://help.medium.com/hc/en-us/articles/213690167-Medium-s-Do-Not-Track-Policy">Medium</a>
and <a
href="https://help.pinterest.com/en/article/do-not-track">Pinterest</a>
still act on the header.</p>

<p>Apple's Safari was the first major browser to <a
href="https://developer.apple.com/documentation/safari_release_notes/safari_12_1_release_notes#3130299">lose
support</a> for "<span>the expired Do Not Track standard</span>" &mdash;
it was removed from Safari in March 2019. Ironically, Apple's stated
reason for removing it was to "<span>prevent potential use as a
fingerprinting variable</span>". Tracking systems often use a fingerprint
of a user's HTTP headers to help track them across different websites, and
the <tt>DNT:&nbsp;1</tt> header &mdash; given its low use &mdash; adds
uniqueness to the user's headers that may actually make them easier to
track.</p>

<p>Since then, Apple has been steadily rolling out what it calls "<a
href="https://webkit.org/blog/7675/intelligent-tracking-prevention/">Intelligent
Tracking Prevention</a>", which is an approach that prevents
the use of third-party cookies after a certain time window and helps avoid
tracking via query-string parameters ("<a
href="https://webkit.org/blog/8828/intelligent-tracking-prevention-2-2/">link
decoration</a>"). Mozilla  <a
href="https://blog.mozilla.org/blog/2019/09/03/todays-firefox-blocks-third-party-tracking-cookies-and-cryptomining-by-default/">added</a>
similar protections from third-party cookies to Firefox in September 2019. Microsoft
<a
href="https://docs.microsoft.com/en-us/microsoft-edge/web-platform/tracking-prevention">included</a>
tracking prevention in the new Chromium-based version of its Edge browser,
released in January 2020. Even Google, where much of its revenue comes from
advertising (and indirectly, tracking), announced its own <a
href="https://blog.chromium.org/2020/01/building-more-private-web-path-towards.html">plans</a>
to phase out support for third-party cookies in Chrome over the next two
years.</p>

<p>In May 2014, LWN <a href="https://lwn.net/Articles/597487/">wrote</a>
about <a href="https://privacybadger.org/">Privacy Badger</a>, "<span>a
browser add-on that stops advertisers and other third-party trackers from
secretly tracking where you go and what pages you look at on the
web</span>". Privacy Badger enables the DNT header and blocks requests to
third-party sites that it believes are likely to track a user (which, not
surprisingly, happens to <a
href="https://privacybadger.org/#Why-does-Privacy-Badger-block-ads">block
most ads</a>). One of the goals of Privacy Badger is to <a
href="https://privacybadger.org/#-I-am-an-online-advertising-tracking-company.--How-do-I-stop-Privacy-Badger-from-blocking-me">goad</a>
advertising companies to actually respect the header. If Privacy Badger
sees that a domain respects DNT by publishing the <a
href="https://www.eff.org/dnt-policy">DNT compliance policy</a> to
<tt>company-domain.com/.well-known/dnt-policy.txt</tt>, it will stop
blocking that domain. This sounds like a great idea for users, but it just
doesn't seem to have taken off with advertisers.</p>

<p>One recent attempt to revitalize the DNT header is by <a
href="https://duckduckgo.com/">DuckDuckGo</a>, which is a company that builds
privacy-oriented internet tools (including a search engine that
"<span>doesn't track you</span>"). It found (in November 2018) that,
despite web sites mostly ignoring the header, DNT was <a
href="https://spreadprivacy.com/do-not-track/">enabled by approximately
23%</a> of adults in the US. In May 2019 DuckDuckGo published draft
legislation titled "<a
href="https://duckduckgo.com/download/The_Do-Not-Track_Act_of_2019.pdf">The
Do-Not-Track Act of 2019 [PDF]</a>" which it <a
href="https://spreadprivacy.com/do-not-track-act-2019/">hopes</a> will
"<span>put teeth behind this widely used browser setting by making a law
that would align with current consumer expectations and empower people to
more easily regain control of their online privacy</span>". The company's
proposal would require web sites to honor the DNT header by preventing
third-party tracking and only using first-party tracking in ways "<span>the
user expects</span>". For example, a site could show a user the local
weather forecast, but not sell or share the user's location data to third
parties.</p>

<p>Unfortunately, in the year since DuckDuckGo published the proposal,
nothing further seems to have come of it. However, around the same time,
US senator Josh Hawley, supported by senators Dianne Feinstein and Mark
Warner, introduced a similar <a
href="https://www.congress.gov/bill/116th-congress/senate-bill/1578/all-info">Do
Not Track Act</a> that was "<span>referred to the Committee on Commerce,
Science, and Transportation</span>". There has not been any activity on
this bill in the last year, so it seems there is little chance of it going
further.</p>

<p>In June 2018, the W3C working group published an <a
href="https://www.w3.org/blog/2018/06/do-not-track-and-the-gdpr/">article</a>
comparing DNT with the GDPR. The GDPR requires a web site to get a user's
consent before tracking them and, unlike DNT, that  is enforceable by law.
Similarly, the recent CCPA
legislation is enforceable, but it only applies to businesses operating in the
state of California, and only to the "sale" of personal information. As law firm
Davis Wright Tremaine LLP <a
href="https://www.dwt.com/blogs/privacy--security-law-blog/2020/07/pole-camera-surveilance-fourth-amendment">noted</a>,
the CCPA waters are almost as muddy as those of DNT: "<span>we do not yet have
clarity under the CCPA, however, regarding which tracking activities (e.g.,
tracking for analytics, tracking to serve targeted ads, etc.) would be
considered 'sales'</span>." One possible way forward is to generalize efforts
like the GDPR and CCPA rather than trying to give DNT a new lease on life.</p>

<p>It looks as though, after a decade-long ride with a lot of bumps, the Do
Not Track header never quite got enough traction with the right people to
reach its destination. It is still possible that one of the political
efforts will go somewhere, but it seems less and less likely. Similar to
how most of us deal with email spam, we may have to rely on technological
solutions to filter out tracking requests, such as Privacy Badger and
DuckDuckGo's browser extensions or the various browsers' "intelligent
tracking prevention" schemes.</p>
