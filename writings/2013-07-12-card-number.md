---
layout: default
title: "Yes, my credit card number *does* have spaces!"
permalink: /writings/card-number/
description: "Yes, my credit card number *does* have spaces!"
canonical_url: https://blog.brush.co.nz/2013/07/card-number/
---
<h1>Yes, my credit card number *does* have spaces!</h1>
<p class="subtitle">July 2013</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2013/07/card-number/)


<p><img style="width:auto" alt="Credit Card" class="right size-full wp-image-977" height="162" src="/images/brushblog/creditcard.jpg" width="246"/>Okay, so here’s a little rant (by a fellow developer) about web forms that accept credit card numbers. Or rather, web forms that don’t accept them very well.</p>

<p>Many card number input boxes are limited to 16 characters, meaning when I get up to “1234 5678 1234 5” and then try to type the last three digits … BANG, input box full, no more typie. I have to go back and delete the spaces, making it harder to read and check. I had this just today when paying for my Highrise account (though I’m not really picking on <a href="http://37signals.com/">37signals</a> — it happens on many payment sites).</p>

<p>The other one that I get fairly often is when a site lets me enter the number with spaces, but then the server-side check comes back and says “invalid credit card number”. Um, no it’s not invalid — I’m typing it exactly as it appears on my card.</p>

<p>C’mon, folks, we’re programmers! Stripping out non-digits is the kind of thing computers can do in nano- or micro-seconds. What exactly is so hard about adding one line of code?</p>

<pre class="prettyprint"><code>    card_number = ''.join(c for c in card_number if c.isdigit())
</code></pre>

<p>If you’re taking money that I <em>want</em> to give you, please at least let me enter my card number as it appears on my card — digit groups separated by spaces. Stripping really isn’t that hard! :-)</p>



<h2>Comments</h2>

<h3>Berwyn <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 09:53</span></h3>

<p>My related pet peeve is websites that can’t accept phone numbers with spaces nor in international format:
    +64 3 741 1204</p>

<h3>Berwyn <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 10:24</span></h3>

<p>What’s even worse is when they have four different fields where you can enter your card number (4 digits in each field) and it doesn’t move automatically between the boxes, so you can’t copy’n’paste.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 10:31</span></h3>

<p>True true. Like the “IP address entry boxes” on older versions of Windows. Someone thought separating them into four separate boxes was a good idea, but it makes copy’n’paste a nightmare.</p>

<h3>Leonid Volnitsky <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 13:29</span></h3>

<p>I used to work on mainframes in 80’s. And I remember that ALL application would accept phone numbers with spaces and ().  And when I moved to PC (and later Web), to my surprise,  no application would understand  common separators in phones, IPs, CC numbers.</p>

<h3>Darryl <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 15:35</span></h3>

<p>The other annoyance is that you have to select the credit card type. This can be determined programatically (eg: Visas are 16 digits with a leading 4 — 4012 8888 8888 1881).</p>

<h3>Ariven <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 15:40</span></h3>

<p>Visa can be 13 or 16 digits though the 13 digit ones are supposed to be migrated to 16, and are not the only card that starts with 4.</p>

<p><a href="http://en.wikipedia.org/wiki/Bank_card_number" rel="nofollow">http://en.wikipedia.org/wiki/Bank_card_number</a></p>

<p>Though I agree, determining what type of card it is can usually be handled server side or by a query to your processor.</p>

<h3>Zack Bloom <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 16:33</span></h3>

<p>Other filtering options include:</p>

<p><code>filter(lambda d: d.isdigit(), card_number)
</code></p>

<p>and</p>

<p><code>card_number.replace(' ', '')
</code></p>

<h3>Matt Tew <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 16:48</span></h3>

<p>Joke’s on you, Mr Surname.  Now I have your credit card number.</p>

<h3>Explo Derator <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 18:11</span></h3>

<p>You are a whiner.</p>

<p>Aren’t semi-transparent user interface elements and animations good enough for you?  What kind of wizardry do you expect anyways?  Capable, well thought out ergonomics?  Bah!</p>

<p>Get over yourself, the world needs more bling and bedazzle and vagazzle, not things that work reliably and eloquently and efficiently and naturally.  What you need is an app for your pissy attitude.</p>

<h3>Brock <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 19:38</span></h3>

<p>“Stripping isn’t that hard”
That’s what I tell the ladies.</p>

<h3>Kenny <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 19:55</span></h3>

<p>Your code doesn’t remove white space. It reconstructs the exact same string.</p>

<h3>Nathan <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 20:03</span></h3>

<p>No need for the lambda in Zack Bloom’s answer! :)</p>

<p>filter(str.isdigit, card_number) will work fine.</p>

<h3>Stu <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 22:04</span></h3>

<p>Or just use an incredibly simple regular expression.</p>

<p>s/\D//g</p>

<h3>Henry H. Thomas <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 22:07</span></h3>

<p>Not joking; would this be considered an indication that the OP is a little higher up on the aspergers spectrum than “normal”? I mean, he is a programmer after all.</p>

<h3>William Gannon <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 22:51</span></h3>

<p>Why not just put the onus on the client in the first place?  How hard is it for javascript to strip out non-digits using a simple regex?</p>

<h3>Seri <span style="padding-left: 1em; color: #bbb;">13 Jul 2013, 22:53</span></h3>

<p>@Ariven One reason why payment sites like to make the user select their card type is that it adds another (albeit minor) level of security.</p>

<p>Especially where a VISA Debit card is quite different to a  VISA credit card in the way it’s processed.</p>

<h3>Jon <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 01:02</span></h3>

<p>Websites should all perform client side validation for CC number. No need for a round-trip to the server to know a digit is off.</p>

<p><a href="http://en.wikipedia.org/wiki/Luhn_algorithm" rel="nofollow">http://en.wikipedia.org/wiki/Luhn_algorithm</a></p>

<h3>Benn <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 01:38</span></h3>

<p>I’d use an algorithm that replaces spaces rather than one that removes everything but digits. Including spaces because “that’s how it appears on the card” is reasonable, but including anything other than digits and spaces should throw an error.</p>

<h3>Andres S <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 02:28</span></h3>

<p>Wouldn’t it be better to have 4 input boxes, and autofocusing the next one when the current’s length is already 4?</p>

<h3>George <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 02:37</span></h3>

<p>4 input boxes would take a little finagling to not muck up cut &amp; pasting.  I use a virtual credit card # tool, so that makes a big difference to me.</p>

<h3>me <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 02:43</span></h3>

<p>I’ve even seen a special “you must remove spaces from your input” error message. I suspect a horrible top-down development environment, probably with screwy regulations like “may not programatically alter customer input” is to blame.</p>

<h3>Philo <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 03:30</span></h3>

<p>The credit card thing seems to be a new trend. I don’t think I saw it at all before 1-2 years ago. On the other hand – phone number fields. Holy crap, how hard is it to just store the whole string? Or strip out parens, hyphens, dots, and spaces. </p>

<p>And why do sites try to validate it? I’ve even seen a site that wouldn’t accept a 555- number. Take the hint, you moron – I don’t want you to call me. </p>

<p>When I see sites that only accept digits in a phone number field, I always have this sneaking suspicion that they’re storing it as an actual number.</p>

<h3>Joker_vD <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 04:45</span></h3>

<p>@Philo: Yep. Sometimes programmers think they know everything about the data they are validating, but usually it’s not so. For example, Ukrainian mobile phone numbers have 11 digits when in international format—yes, not 10, but 11! Good luck trying to enter it.</p>

<p>Really, just store the string as entered. If you need to show it on a screen, it will show up nicely. If you need to dial it programmatically, strip all separators.</p>

<p>And what about making it “necessary field”? What if I really don’t have a phone? That’s discrimination!</p>

<h3>Athox <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 21:06</span></h3>

<p>cc.split(' ').join('')</p>

<h3>est <span style="padding-left: 1em; color: #bbb;">14 Jul 2013, 21:43</span></h3>

<p>@Zack Bloom </p>

<p>card_number = filter(str.isdigit, card_number)</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">15 Jul 2013, 07:45</span></h3>

<p>@Athox, is that the new AlmostPython language? :-) I think in Python you’d say <code>''.join(cc.split())</code>.</p>

<p>@est and @Zack: true, you can use <code>filter()</code>. But as far as I’m concerned, filter, lambda, and co are the LispPython equivalents of Python’s more flexible list and generator comprehensions.</p>

<h3>Mike <span style="padding-left: 1em; color: #bbb;">16 Jul 2013, 00:22</span></h3>

<p>Shouldn’t this be up to w3c to make a standard?</p>

