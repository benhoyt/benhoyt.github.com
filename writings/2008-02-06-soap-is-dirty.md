---
layout: default
title: "SOAP won’t make you clean"
permalink: /writings/soap-is-dirty/
description: "SOAP won’t make you clean"
canonical_url: https://blog.brush.co.nz/2008/02/soap-is-dirty/
---
<h1>SOAP won’t make you clean</h1>
<p class="subtitle">February 2008</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2008/02/soap-is-dirty/)


<p><img style="width:auto" class="right" height="68" src="/images/brushblog/2008_02_soap.png" width="175"/>I <i>am</i> something of a minimalist, so maybe it’s just me, but for a while now I’ve had bad feelings about <a href="http://en.wikipedia.org/wiki/SOAP">SOAP</a>. (Yeah, I mean the XML-based remote procedure thingy, not the stuff you wash your hands with.)</p>

<p>However, it wasn’t until I implemented a simple query to get my PayPal balance that I had actual evidence. Here’s how you get your balance …</p>

<p>First send this XML to <code>https://api-3t.paypal.com/2.0/</code>:</p>

<p><small></small></p>

<pre class="prettyprint"><code>&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;soapenv:Envelope
   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:xsd="http://www.w3.org/2001/XMLSchema"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"&gt;
 &lt;soapenv:Header&gt;
  &lt;RequesterCredentials xmlns="urn:ebay:api:PayPalAPI"
    soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next"
    soapenv:mustUnderstand="1"&gt;
   &lt;ebl:Credentials xmlns:ebl="urn:ebay:apis:eBLBaseComponents"&gt;
    &lt;ebl:Username&gt;U&lt;/ebl:Username&gt;
    &lt;ebl:Password&gt;P&lt;/ebl:Password&gt;
    &lt;ebl:Signature&gt;S&lt;/ebl:Signature&gt;
   &lt;/ebl:Credentials&gt;
  &lt;/RequesterCredentials&gt;
 &lt;/soapenv:Header&gt;
 &lt;soapenv:Body&gt;
  &lt;GetBalanceReq xmlns="urn:ebay:api:PayPalAPI"&gt;
   &lt;GetBalanceRequest&gt;
    &lt;Version xmlns="urn:ebay:apis:eBLBaseComponents"&gt;2.30&lt;/Version&gt;
   &lt;/GetBalanceRequest&gt;
  &lt;/GetBalanceReq&gt;
 &lt;/soapenv:Body&gt;
&lt;/soapenv:Envelope&gt;
</code></pre>

<p></p>

<p>And wait for this equally lovely-looking response:</p>

<p><small></small></p>

<pre class="prettyprint"><code>&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;SOAP-ENV:Envelope
  xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:cc="urn:ebay:apis:CoreComponentTypes"
  xmlns:wsu="http://schemas.xmlsoap.org/ws/2002/07/utility"
  xmlns:saml="urn:oasis:names:tc:SAML:1.0:assertion"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:market="urn:ebay:apis:Market"
  xmlns:auction="urn:ebay:apis:Auction"
  xmlns:sizeship="urn:ebay:api:PayPalAPI/sizeship.xsd"
  xmlns:ship="urn:ebay:apis:ship"
  xmlns:skype="urn:ebay:apis:skype"
  xmlns:wsse="http://schemas.xmlsoap.org/ws/2002/12/secext"
  xmlns:ebl="urn:ebay:apis:eBLBaseComponents"
  xmlns:ns="urn:ebay:api:PayPalAPI"&gt;
 &lt;SOAP-ENV:Header&gt;
  &lt;Security xmlns="http://schemas.xmlsoap.org/ws/2002/12/secext"
    xsi:type="wsse:SecurityType"&gt;
  &lt;/Security&gt;
  &lt;RequesterCredentials xmlns="urn:ebay:api:PayPalAPI"
    xsi:type="ebl:CustomSecurityHeaderType"&gt;
   &lt;Credentials xmlns="urn:ebay:apis:eBLBaseComponents"
     xsi:type="ebl:UserIdPasswordType"&gt;
    &lt;Username xsi:type="xs:string"&gt;&lt;/Username&gt;
    &lt;Password xsi:type="xs:string"&gt;&lt;/Password&gt;
    &lt;Signature xsi:type="xs:string"&gt;S&lt;/Signature&gt;
    &lt;Subject xsi:type="xs:string"&gt;&lt;/Subject&gt;
   &lt;/Credentials&gt;
  &lt;/RequesterCredentials&gt;
 &lt;/SOAP-ENV:Header&gt;
 &lt;SOAP-ENV:Body id="_0"&gt;
  &lt;GetBalanceResponse xmlns="urn:ebay:api:PayPalAPI"&gt;
   &lt;Timestamp xmlns="urn:ebay:apis:eBLBaseComponents"&gt;2008-02-06T00:29:17Z&lt;/Timestamp&gt;
   &lt;Ack xmlns="urn:ebay:apis:eBLBaseComponents"&gt;Success&lt;/Ack&gt;
   &lt;CorrelationID xmlns="urn:ebay:apis:eBLBaseComponents"&gt;9ed8e32f98405&lt;/CorrelationID&gt;
   &lt;Version xmlns="urn:ebay:apis:eBLBaseComponents"&gt;2.300000&lt;/Version&gt;
   &lt;Build xmlns="urn:ebay:apis:eBLBaseComponents"&gt;499645&lt;/Build&gt;
   &lt;Balance xsi:type="cc:BasicAmountType" currencyID="USD"&gt;1234.56&lt;/Balance&gt;
   &lt;BalanceTimeStamp xsi:type="xs:dateTime"&gt;2008-02-06T00:29:17Z&lt;/BalanceTimeStamp&gt;
  &lt;/GetBalanceResponse&gt;
 &lt;/SOAP-ENV:Body&gt;
&lt;/SOAP-ENV:Envelope&gt;
</code></pre>

<p></p>

<p>Then you parse out the only thing you care about, the number <code>1234.56</code> inside the <code>&lt;Balance&gt;</code> tag.</p>

<p>There’s something a little bit wrong with having to process three pages of XML when all anyone wants is a 7-byte string. Oh, and maybe the fact that it’s in USD (another 3 bytes).</p>

<p>Contract that to a more <a href="http://en.wikipedia.org/wiki/Representational_State_Transfer">RESTful</a> and plain-texty approach, also known as <a href="http://en.wikipedia.org/wiki/KISS_principle">KISSing</a>, where the entire request and response would be:</p>

<p><small></small></p>

<pre class="prettyprint"><code>https://api.paypal.com/balance?username=U&amp;password=P&amp;signature=S
1234.56 USD
</code></pre>

<p></p>

<p>(Admittedly, PayPal does support a simple “name-value pair” approach with many of their API calls, but for some reason not this one.)</p>

<p>I’m sure some people will say, “But you never see that ugly XML if you use libraries.” Sure, you can hide most of the ickyness of SOAP behind bloated XML parsers and WSDL libraries, but why did you need the uglyness in the first place?</p>

<p>So, next time you’re thinking of implementing a SOAP server, think again. Hearken instead to the cries of <a href="http://en.wikipedia.org/wiki/Roy_Fielding">Roy Fielding</a> and  <a href="http://json.org/">Douglas Crockford</a>.</p>



<h2>Comments</h2>

<h3>commenter <span style="padding-left: 1em; color: #bbb;">6 Feb 2008, 23:45</span></h3>

<p>Cleartext passwords? How about
<pre>https://api.paypal.com/balance?username=U
Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==
1234.56</pre></p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">6 Feb 2008, 23:53</span></h3>

<p>Hi commenter, because it’s https and not http, everything is encrypted, so passwords will never be sent in the clear (same is true for the SOAP API, though — it’s https).</p>

<h3>xav <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 00:11</span></h3>

<p>Hi,</p>

<p>I do agree with you, the soap is bloated to death. However, that’s never a good idea to have a password in “clear” in the get string, that has way too many places to end up being stored (on the history in your browser, on the log of the server and potentially in a lot of different places in between).</p>

<p>The less things you have to protect because they contain valuable informations, the better you are.</p>

<p>Don’t store, transmit, copy them unless you really really don’t have other alternatives</p>

<p>X+</p>

<h3>Lars Pohlmann <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 00:14</span></h3>

<p>For such a simple request I share your criticism. 
But SOAP has some advantages when dealing with complex requests and returnvalues. You can use arrays and all common datatypes, even complex datastructures in them, and the way to pass those parameters and returnvalues is clearly defined.</p>

<h3>Kurt <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 00:37</span></h3>

<p>Commenter (or should I say Aladdin): Base64 is hardly better than cleartext anyway.</p>

<h3>Sebastien Arbogast <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 00:42</span></h3>

<p>What you forget is that webservices are all about reusability. So what if you just need the effective balance and assume everything is in USD, and since I’m French, I need the currency too, and then an automated server needs the timestamp to track the balance, and so on.
In a SOA world, a service should not be designed in terms of what consumers need, but in terms of what the producer has to offer, so that everyone gets AT LEAST the correct data from THE SAME source. So yes, to handle that kind of comprehensive design you need some kind of a complex protocol such as SOAP and WSDL. Yes, you could do POX/REST but then the problem is automating those calls in an heterogeneous world.</p>

<p>So I agree that SOAP/WSDL might be a little overkill in a naive geeky world where we call webservice API’s from our command shell to know how rich we are. But in the real world, communication needs standard protocols, and SOAP/WSDL does a pretty good job at it. And if you’re discussing that, then why are there so many fields in a TCP frame? ;o)</p>

<h3>commenter <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 01:55</span></h3>

<p>Using HTTP Authentication rather than an ad-hoc authentication scheme keeps secrets out of the browser’s address bar and (probably) the server’s log files.</p>

<p>As Ben points out, RFC-2818 provides confidentiality between the client and the server in either case.</p>

<h3>Nick <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 02:35</span></h3>

<p>What about XML-RPC? Yes it is still XML but much of the “fat” from SOAP has been trimmed. I recently worked on a project and chose XML-RPC because it offered everything SOAP had with a much cleaner and easier to implement send/response mechanism.</p>

<h3>Matt <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 03:43</span></h3>

<p>Terrible idea putting the password in the url. It gets logged and  if any clowns hit it directly from the browser while testing their wicked cool app, any toolbars could intercept it.</p>

<p>That being said, post could work.</p>

<h3>impute <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 04:14</span></h3>

<p>I much prefer XML-RPC (<a href="http://www.xmlrpc.com/" rel="nofollow">http://www.xmlrpc.com/</a>) which is what SOAP was before Microsoft touched it. There are some differences in functionality (particularly when dealing with passing structures) but overall it’s amazing how much easier it is to work with.</p>

<h3>Greg Davies <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 04:53</span></h3>

<p>Sure it’s more text, but a lot of it is header stuff. If you were getting 1000 records or something the signal to noise ratio would improve. 
You’re also forgetting about all the work these headers are doing for you. Do you have to parse this by hand, or does your IDE/library parse it for you? Do you have to deserialize it into objects by hand? Do you have to define those objects? 
A decent web service discovery app will do all this for you when you feed it a webservice address. Do you really want to write a new parsing method for every type of webservice call you want to make?</p>

<h3>knowitall <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 05:58</span></h3>

<p>Commenter,
Um, not only was Ben correct that there were <em>no</em> passwords being sent in the clear (since <em>all</em> traffic is encrypted over an HTTPS connection), but even <em>if</em> it weren’t using HTTPS, your solution to use HTTP Auth is <em>horrible</em> since anyone can reverse the Base64 encoded password. It was not designed to be secure! </p>

<p>Please read <a href="http://en.wikipedia.org/wiki/Basic_access_authentication" rel="nofollow">http://en.wikipedia.org/wiki/Basic_access_authentication</a></p>

<p>…for your poor clients’ sakes.</p>

<h3>Michael <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 07:55</span></h3>

<p>I don’t think that’s the world’s greatest example.  It’s a bit like me going off on how bloated and expensive cars are by citing an example of me driving to my neighbor’s house.  Yes, in that example, they’re stupid, but you and I both can (probably) agree to their general usefulness in the big picture.</p>

<p>The key is seeing the big picture when it comes to SOAP.  </p>

<p>Personally, I never use it, nor will I ever.  The reason?  I’m not the target audience.  But imagine several large corporate partners exchanging complex data with wildly varying business systems, security policies, etc.  Features such as easily being able to add extensions and tagged content, encapsulate payloads, filter on the fly, apply intermediate transmission and security policies independent of the message data, etc., are a big win in the right environment.</p>

<p>Additionally, I think your currency example also highlights another problem, in that you’re proposing unstructured data.  Sure, it seems okay to hand-parse the response for such a small example, but imagine something much more complex.  Imagine that you have a significant data model that must pass through various in-transit and application-level filters and transformers.  Having each field identified within a heirarchical, tagged model in a way that each data element is easily and unambiguously referencable is a must.</p>

<p>I love REST in my own projects, but I’m not stupid enough to think that it’s the universal hammer.  There is a time and place for technologies such as SOAP.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 08:30</span></h3>

<p>I certainly agree about not sending passwords in the clear, but it’s all encrypted if you use https (as in my example). Definitely better than Basic authentication. :-)</p>

<p>However, xav’s probably right about the fact that they’ll get stored in the server’s log file, which isn’t the greatest idea — I hadn’t thought of that. On the other hand, I’ve used a couple of web services now that do it this way, and have never had a problem. But you could either turn off query string logging, or use a POST — which seems slightly wrong in a RESTful world, because it’s really a <a href="http://blog.micropledge.com/2007/06/get-to-do-posts-job/" rel="nofollow">GET operation</a>.</p>

<p>Lars, <a href="http://json.org/" rel="nofollow">JSON</a> is a neat and quickly-becoming-standard way of dealing with “complex requests and return values”. It’s much simpler than XML, more readable, and possibly better suited to this sort of thing (transferring objects). Greg, as far as I can see JSON solves the “parsing issue”.</p>

<p>So perhaps the right way to do the query is:</p>

<pre><code>POST https://api.paypal.com/get-balance
    username=U&amp;password=P&amp;signature=S
["success", 1234.56, "USD"]
</code></pre>

<p>Sebastien, about automation: I did say it was for getting “my” PayPal balance, but it’s actually part of a finance checking script we use at <a href="http://micropledge.com/" rel="nofollow">microPledge</a>.</p>

<p>Michael, good post, and you’re probably right. But I’m wary of enterprisey stuff in general, which is kind of where you’re saying SOAP might come into its own.</p>

<h3>Robert Synnott <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 08:42</span></h3>

<p>Facebook’s Thrift thing does this in a nice compact binary format (as of course did CORBA, but it was a little scary).</p>

<p>Certainly, SOAP is used in a lot of circumstances where it introduces stupid levels of overhead…</p>

<h3>James <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 15:15</span></h3>

<p>I’m a big fan of JSON Personally. It’s simple, easy to parse, and the data is already in the format you need it (So no traversing a DOM)</p>

<h3>Michael <span style="padding-left: 1em; color: #bbb;">7 Feb 2008, 18:50</span></h3>

<p>“Enterprisey” isn’t a bad thing.  “Enterprise” programmers, such as those you’ll find at large, multi-national financial institutions (for example), face a unique set of challenges.</p>

<p>The VAST majority of programmers are not “enterprise” programmers.  They’re mostly “conventional” corporate programmers doing the tedious day-to-day coding tasks most of us are familiar with.  A lot of data massaging, internal business workflow, order entry, web stores, etc., most of which are good candidates for a KISS mindset.</p>

<p>SOAP is actually pretty interesting, but it was designed with the enterprise audience in mind.  What happens when you release such a technology to the world at large, when most of the world at large do not fall into the target audience?</p>

<p>It gets hated.  Big time.</p>

<p>And it is in fact “bad” at doing the sort of things that the people ripping on it do.  It’s simply that those people don’t need it, and don’t understand the group of folks that do.  Unfortunately, the marketing machine and word-of-mouth “look, it’s shiny and new” effect results in everyone and their mother hearing about it, investigating it, using it, and subsequently deciding it’s more than they need.</p>

<p>OF COURSE IT IS!</p>

<p>There’s a group of developers out there who can easily justify the extended feature set.  But most of us aren’t in that goup.  And most of us define the blogosphere.  Therefore, most of what you read is critisism from the majority sphere of the wrong people.  The audience for whom SOAP was intended that are using SOAP successfully every day would have to write 5000 posts per day per person just to offset the ginormous unindended audience constantly proclaiming it a piece of crap because it doesn’t do what it wasn’t intended to do very well.  Uhmm… no kidding?</p>

<p>This leads to another effect.  The term “enterprise” has been hijacked as evil for this very reason.  There is a group of “enterprise” class developers out there who justify the creation of that term.  Then there’s the rest of us, who after years of criticising technologies that don’t do what we want because they weren’t intended for us to begin with, and citing silly examples of people trying to squeeze “enterprise” solutions into places they shouldn’t be, have created such a poor reputation for the word “enterprise” that it’s now an industry joke.</p>

<p>The whole thing was just a misunderstanding.  Not to mention a fair bit of overmarketing and geek-factor gone haywire.  Perhaps an unforunate social phenomenon more than anything.</p>

<p>Back to your first example, the PayPal front end interfaces mostly with (I would guess), the small-medium business market, with some obvious exceptions, so one could argue that SOAP is simply overkill for such an audience.  However, PayPal interfaces on the back end with a host of partners and financial institutions, sharing complex financial and transaction data under a range of different business and security policies and over a range of different interfaces and protocols.  It also has some large clients with tigher, custom integration.  It’s not too unexpected for them to depend on “enterprisey” technologies given the things they need to deal with on fronts other than that which you’re exposed to as a simple consumer of their general service interface.</p>

<p>And I’m sure hype plays into it to ;)</p>

<p>In any case, hopefully you can see all the things the SOAP format enables one to do, and why you in particular, like myself, don’t need them, but also why there exist those out there that actually do.</p>

<h3>nfo <span style="padding-left: 1em; color: #bbb;">24 Dec 2008, 19:55</span></h3>

<p>Good article Ben !!!
You wrote down what i am thinking about soap.
SOAP = Silly Overweight API Protocol
Really Nice One :)</p>

<p>Best Regards</p>

<p>nfo</p>

