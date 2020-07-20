---
layout: default
title: "The sad, slow dying of Do Not Track"
permalink: /writings/do-not-track/
description: "The Do Not Track header was a valiant, 10-year effort to prevent tracking. Unfortunately, it doesn't seem to have taken."
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


<p>Internet privacy is not a new topic, and the "Do Not Track" (DNT) HTTP header had a <a href="https://lwn.net/Articles/439460/">promising start</a> almost a decade ago, but as of 2020 it's basically dead, due to lack of adoption by the industry. Companies argued that its legal status was unclear, and that it was difficult to determine how to interpreter the header. Two of the more recent blows to DNT were the W3C working group disbanding in early 2019 and Apple's Safari removing support for the header a few months later. In May 2019, the privacy-focussed DuckDuckGo search engine proposed legislation that would require that companies obey the header, but it's probably too late in the game for that kind of resurrection.</p>

<p>The DNT header first appeared in 2009, designed by security researchers Christopher Soghoian, Sid Stamm, and Dan Kaminsky. In his article on the <a href="http://paranoia.dubfire.net/2011/01/history-of-do-not-track-header.html">history of DNT</a>, Soghoian writes:</p>

<div class="BigQuote">
<p>In July of 2009, I decided to try and solve this problem. My friend and research collaborator Sid Stamm helped me to put together a prototype Firefox add-on that added two headers to outgoing HTTP requests:</p>
<p><tt>X-Behavioral-Ad-Opt-Out: 1</tt><br>
<tt>X-Do-Not-Track: 1</tt></p>
<p>The reason I opted for two headers was that many advertising firms' opt outs only stop their use of behavioral data to customize advertising. That is, even after you opt out, they continue to track you.</p>
</div>

<p>Even back when Soghoian wrote this article in 2011, it was clear that getting advertisers to respect the header wasn't going to be easy:</p>

<div class="BigQuote">
<p>The technology behind implementing the Do Not Track header is trivially easy - it took Sid Stamm just a few minutes to whip up the first prototype. The far more complex problem relates to the policy questions of what advertising networks do when they receive the header. This is something that is very much still up in the air (particularly since no ad network has agreed to look for or respect the header).</p>
</div>

<p>Starting with Mozilla Firefox in January 2011, browsers began to implement the "<span>trivially easy</span>" part, allowing users to opt in to sending the new header. Microsoft followed soon after, adding DNT support to Internet Explorer 9 in March 2011. Apple followed suit with Safari in April 2011. Google was a little late to the game, but <a href="https://chrome.googleblog.com/2012/11/longer-battery-life-and-easier-website.html">added support</a> to Chrome in November 2012.</p>

<p>In September 2011 a W3C "<a href="https://www.w3.org/2011/tracking-protection/">Tracking Protection Working Group</a>" was formed "<span>to improve user privacy and user control by defining mechanisms for expressing user preferences around Web tracking and for blocking or allowing Web tracking elements</span>". During their eight active years, the group published a <a href="https://www.w3.org/TR/tracking-dnt/">specification of the DNT header</a> as well as a <a href="https://www.w3.org/TR/tracking-compliance/">set of practices</a> about what compliance to DNT means. Unfortunately in January 2019 the working group was closed with this <a href="https://github.com/w3c/dnt/commit/5d85d6c3d116b5eb29fddc69352a77d87dfd2310">notice</a>:</p>

<div class="BigQuote">
<p>Since its last publication as a Candidate Recommendation, there has not been sufficient deployment of these extensions (as defined) to justify further advancement, nor have there been indications of planned support among user agents, third parties, and the ecosystem at large. The working group has therefore decided to conclude its work and republish the final product as this Note, with any future addendums to be published separately.</p>
</div>

<p>As early as 2012 <a href="https://lwn.net/Articles/520047/">LWN wrote</a> about how it wasn't looking good for DNT: advertising groups were pushing back (unsurprisingly), and there was no legal definition of how the header should be interpreted. In addition, Microsoft's decision to enable the header by default in Internet Explorer 10 backfired, as DNT had always been intended as to be a deliberate choice made by the consumer. Roy Fielding from Apache even committed a <a href="https://github.com/apache/httpd/commit/a381ff35fa4d50a5f7b9f64300dfd98859dee8d0">change</a> to un-set the DNT header if the request was coming from Internet Explorer 10 &mdash; I don't think I've ever seen so many comments on a GitHub commit. Even though Microsoft finally <a href="https://blogs.microsoft.com/on-the-issues/2015/04/03/an-update-on-microsofts-approach-to-do-not-track/">removed this default</a> in April 2015, it's likely that this well-intentioned move muddied the DNT waters.</p>

<p>A few high-profile web sites did honor Do Not Track, including Reddit, Twitter, Medium, and Pinterest. Tellingly, however, as of today two of those sites now ignore the header: Reddit's <a href="https://www.redditinc.com/policies/privacy-policy">privacy policy</a> now states that "<span>there is no accepted standard for how a website should respond to this signal, and we do not take any action in response to this signal</span>", and Twitter <a href="https://help.twitter.com/en/safety-and-security/twitter-do-not-track">notes</a> that it discontinued support (as of May 2017) because "<span>an industry-standard approach to Do Not Track did not materialize</span>". At present, <a href="https://help.medium.com/hc/en-us/articles/213690167-Medium-s-Do-Not-Track-Policy">Medium</a> and <a href="https://help.pinterest.com/en/article/do-not-track">Pinterest</a> still honor the header.</p>

<p>Apple <a href="https://developer.apple.com/documentation/safari_release_notes/safari_12_1_release_notes#3130299">removed support</a> for "<span>the expired Do Not Track standard</span>" from Safari in March 2019. Ironically, Apple's stated reason for removing support for the header was to "<span>prevent potential use as a fingerprinting variable</span>". Tracking systems often use a fingerprint of a user's HTTP headers to track them across different websites, and the <tt>DNT: 1</tt> header &mdash; given its low use &mdash; adds uniqueness to the user's headers and may actually make them easier to track.</p>

<p>Since then, Apple has been steadily rolling out what it calls <a href="https://webkit.org/blog/7675/intelligent-tracking-prevention/">"Intelligent Tracking Prevention"</a>, which is a more holistic approach that prevents the use of third-party cookies after a certain time window, and helps avoid tracking via query string parameters ("<a href="https://webkit.org/blog/8828/intelligent-tracking-prevention-2-2/">link decoration</a>").</p>

<p>Mozilla Firefox <a href="https://blog.mozilla.org/blog/2019/09/03/todays-firefox-blocks-third-party-tracking-cookies-and-cryptomining-by-default/">added</a> similar protections from third-party cookies in September 2019. Microsoft <a href="https://docs.microsoft.com/en-us/microsoft-edge/web-platform/tracking-prevention">included</a> tracking prevention in the new Chromium-based version of its Edge browser, released January 2020. Even Google, much of whose revenue comes from advertising (and indirectly, tracking), announced its own <a href="https://blog.chromium.org/2020/01/building-more-private-web-path-towards.html">plans</a> to phase out support for third-party cookies in Chrome over the next two years.</p>

<p>Other companies have also decided to ignore DNT: as one example of a smaller company not implementing it, analytics site <a href="https://www.goatcounter.com/">GoatCounter</a> (which LWN has <a href="https://lwn.net/Articles/822568/">written</a> about previously) <a href="https://www.arp242.net/dnt.html">describes</a> why ignoring the header is "<span>a feature</span>". Discussing sites that compile observations of the user's browsing habits, GoatCounter says:</p>

<div class="BigQuote">
<p>But, this is not what GoatCounter does, it just collects some basic statistics about how many people visit your site. To give a real-world analogy: it just counts how many people are entering your shop through which door. What it <i>doesn't</i> do is then follow those people after they've left your store to see which other stores they visit, snoop on as much personal details as possible, and create a profile based on that. That’s what tracking is, and is just not the same thing as what GoatCounter is doing.</p>
</div>

<p>In May 2014, LWN <a href="https://lwn.net/Articles/597487/">wrote</a> about <a href="https://privacybadger.org/">Privacy Badger</a>, "<span>a browser add-on that stops advertisers and other third-party trackers from secretly tracking where you go and what pages you look at on the web</span>". Privacy Badger enables the DNT header and blocks requests to third-party sites that it believes are likely to track a user (which, not surprisingly, happens to <a href="https://privacybadger.org/#Why-does-Privacy-Badger-block-ads">block most ads</a>). One of the goals of Privacy Badger is to <a href="https://privacybadger.org/#-I-am-an-online-advertising-tracking-company.--How-do-I-stop-Privacy-Badger-from-blocking-me">goad</a> advertising companies to actually respect the header. If Privacy Badger sees that a domain respects DNT by publishing a <a href="https://www.eff.org/dnt-policy">DNT policy</a> to <tt>company-domain.com/.well-known/dnt-policy.txt</tt>, it will stop blocking that domain. This sounds like a great idea for users, but it just doesn't seem to have taken off with advertisers.</p>

<p>One recent attempt to revitalize the DNT header is by <a href="https://duckduckgo.com/">DuckDuckGo</a>, a company that builds privacy-oriented internet tools (including a search engine that "<span>doesn't track you</span>"). In May 2019 DuckDuckGo published a PDF titled "<a href="https://duckduckgo.com/download/The_Do-Not-Track_Act_of_2019.pdf">The Do-Not-Track Act of 2019</a>" which it <a href="https://spreadprivacy.com/do-not-track-act-2019/">hopes</a> will "<span>put teeth behind this widely used browser setting by making a law that would align with current consumer expectations and empower people to more easily regain control of their online privacy</span>". The company's proposal would require web sites to honor the DNT header by preventing third-party tracking and only using first-party tracking in ways "<span>the user expects</span>", for example, a site could show a user a local weather forecast, but not sell or share the user's location data to third parties.</p>

<p>Unfortunately in the year since DuckDuckGo published the proposal, nothing further seems to have come of it. However, around the same time, U.S. senator Josh Hawley, supported by senators Dianne Feinstein and Mark Warner, introduced a similar <a href="https://www.congress.gov/bill/116th-congress/senate-bill/1578/all-info">Do Not Track Act</a> that was read and "<span>referred to the Committee on Commerce, Science, and Transportation</span>". Others with more political understanding than I have may be able to comment on whether a bill that's been in committee for over a year has any chance of going further.</p>

<p>It looks as though, after a decade-long ride with a lot of bumps, the Do Not Track header never quite got enough traction with the right people to reach its destination. It is still possible that one of the political efforts will go somewhere, but it seems less and less likely. Similar to how most of us deal with email spam, we may have to rely on technological solutions to filter out tracking requests, such as Privacy Badger and DuckDuckGo's browser extensions or the various browsers' "intelligent tracking prevention" schemes.</p>
