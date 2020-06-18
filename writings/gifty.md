---
layout: default
title: Developing GiftyWeddings.com
permalink: /writings/gifty/
description: How I got started with my wedding gift registry website and also describes the 2016 revamp I gave the site.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">January 2017</p>

> Update: In November 2017, I [rewrote the backend in Go](/writings/learning-go/) (it was Python). The frontend is still as described below.

I run a small wedding gift registry website over at [GiftyWeddings.com](https://giftyweddings.com/). This article explains how I got started with Gifty and also describes the recent revamp I gave the site. I'm a programmer first, so this is primarily from my perspective as a developer, but I might also include a few numbers about the business side of things. Hopefully you'll glean some good insights about what it's like to develop and maintain a small online business as a side project.

First, a brief explanation: Gifty Weddings is a low-cost wedding gift registry website that about 500 couples have used to date. Not that I'm biased or anything, but Gifty is better than typical store-based registries for a lot of couples, because you can add any products from any stores (or even products from no store at all, like "donation toward our honeymoon fund").

I made Gifty initially for my younger brother and his wife when they were getting married, 8+ years ago. And it wasn't that much harder to open it up as a little side business and make it available for other couples to use.


Version one
-----------

This first version of the site was a fairly simple website written in Python (2.6). It used the [web.py](http://webpy.org/) web framework, Cheetah and later my [Symplate](https://github.com/benhoyt/symplate) for templating, and PostgreSQL with my little [row-object mapper](http://blog.brush.co.nz/2010/01/mro/) for database handling.

The Python backend did all the work -- template rendering, form handling, database actions. JavaScript was only used to enhance usability in a few places, like focusing a text input on page load. (Kids, this is how the web used to work. It wasn't called [progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement) back then, just "a website". And there were no 3MB JavaScript blobs including 953 npm packages for a basic CRUD app.)

Through word-of-mouth and good ol' Google, after a couple of years Gifty was getting a few couples a month using the site. We injected a couple of thousand advertising dollars (AdWords, Facebook, and print wedding magazines) that probably only broke even, but did give the site a bit more visibility. The site's had about 5-10 couples using it per month for the last several years.

Somewhat strangely, it's really only been used in New Zealand (where I lived at the time). I guess this is partly just because that's where the initial traffic came from, but even the small amount of marketing money we spent in the U.S. and further afield didn't help much. My hunch is that couples in the States use the store-based registries almost exclusively. Still, I get about one couple per month using it outside New Zealand.

The original site looked like this:

![Screenshot of the old Gifty Weddings website](/images/gifty-old.png)

Being designed by the less-than-world-class-designer yours truly, it was kinda dated even when it first launched, but after a few years it felt quite ugly. But it was 2016 before I got around to a revamp.


The revamp
----------

Close to eight years after version one, I started working on a revamp. Party because I wanted to learn some new tools, and partly because it really needed an updated look and the ability to work on mobile phones, I decided to do a complete rewrite.

I'd been wanting to learn a bit about [React](https://facebook.github.io/react/) for a while, so I used that for the frontend. Also, the site's edit mode for the couple was pretty old-school -- every time you added or edited a gift it was a page load and round trip to the server. While part of me liked that from a "web purity" perspective, it was kinda klunky to use.

So I ended up using React along with Babel and webpack to get some ES2015 goodness in my JavaScript. Modern JavaScript is actually not bad to use. I tend to be very conservative about using 3rd party modules (no [leftpad fiasco](http://www.haneycodes.net/npm-left-pad-have-we-forgotten-how-to-program/)), so ended up using just React, with babel-polyfill to get the ES2015 extras, and no other npm dependencies. My webpacked JavaScript blob for Gifty is 256KB, which is both pretty small for a modern web app, and an excellent number for a computer scientist.

I'm not a fan of large CSS frameworks, but I wanted some kind of starting point, so I ended up using [Skeleton](http://getskeleton.com/). It has a responsive grid layout and good typography defaults that worked well for Gifty. The new site's CSS is 17KB, of which 7KB is Normalize and Skeleton. I didn't feel the need for a CSS preprocessor for a small, single-file chunk of CSS.

So I did the new design myself, with a bunch of help from Skeleton. The new site uses much bigger and nicer images, and all the info couples need is on the homepage (previously it was split into several sub-pages). Here's what the top of the new site looks like:

![Screenshot of the new Gifty Weddings website](/images/gifty-new.jpg)

(Yep, that hero image really is a picture of my wife going down a flying fox / zip-line in her wedding dress.)

For the backend I chose Python again, as I'm very familiar with it and like it a lot. I settled on Python 3.4 -- I definitely wanted to use 3.x, but the Amazon EC2 image I chose didn't ship with Python 3.5 at the time, so 3.4 it was.

I went with the [Flask](http://flask.pocoo.org/) web framework, and I'm very happy with it (I don't like the size or my-way-or-the-highway approach of Django). For an ORM, I chose [peewee](http://docs.peewee-orm.com/en/latest/) for its nice API and simplicity over the heavyweight (but powerful) SQLAlchemy -- I have only good things to say about peewee for a site of this size. And although I think PostgreSQL is amazing for medium to larger projects, I ended up using SQLite for this project; Gifty is a small, low-traffic website that will fit on a single server for the forseeable future, so the no-install, zero-configuration nature of SQLite was pretty attractive.

I'm living in the U.S. now, so I was able to use [Stripe](https://stripe.com/) for payments in the revamp -- good riddance PayPal! Can't say enough good things about Stripe: easy signup, superb developer documentation and experience, the extremely easy-to-use [Stripe Checkout](https://stripe.com/checkout) product.

A few comments on the infrastructure, what little there is of it: I use a small Amazon EC2 instance to host everything (I believe it comes under their free tier for 12 months, and then it's about $10/mo). It's running one of the standard Amazon Linux images. I'm using Amazon SES to send (a very few) emails. Although I prefer nginx, I'm using Apache with mod_python just because it seemed to be the supported option and was easier to set up in this case.

I wanted the revamped site to use HTTPS, so I got a free [StartSSL](https://www.startssl.com/) certificate for giftyweddings.com and installed it in Apache without any trouble.

I don't have hard numbers, but it felt like the revamp took me longer to write than the initial version. I did it over the span of a couple of months, mostly on my daily bus commute from our house in New Jersey into New York City. In terms of number of hours, my guess would be between 40 and 80 hours for the revamp.


Some numbers
------------

I love patio11's (Patrick McKenzie's) yearly reviews, for example his [2016 review](http://www.kalzumeus.com/2016/12/30/kalzumeus-software-year-in-review-2016/). I'm not going to be nearly as detailed, but in something of that spirit, here are a few numbers:

* Number of couples who paid for Gifty in 2016: 63 (told you it was a tiny side business)
* Signups by country: New Zealand - 48, United States - 10, Australia - 5
* Signups by how they found out about Gifty: Google - 32, friend / word of mouth - 28, other - 3
* Because Gifty is primarily used in New Zealand, I get a lot more signups toward the end of the year / in the warm months
* Average number of items per registry: 43
* Number of customer service emails I get: about 3 per month
* Cost of running Gifty in 2016: less than $30 (domain registration and a few other AWS fees; EC2 hosting in 2016 was free)

In related news, my lovely wife's just offered to help out on the marketing and social media side of things (our currently-lackluster [Facebook page lives here](https://www.facebook.com/GiftyWeddings/)). So I'm very interested to see what 2017 will bring!


Final words
-----------

As you can tell, Gifty is a tiny, family-run side business. Apart from doing the revamp last year, it doesn't take much of my time ("passive income"). The flip side is that I haven't spent time promoting it, so it hasn't really grown, and we hope to change that in 2017.

As a programmer, Gifty's been a lot of fun, and I've used it try out and learn several new tools (eg: React, Flask, peewee). These days I hear a lot about people being overwhelmed by the JavaScript/frontend landscape, but with the conservative approach I took for tool choices, I didn't find this to be too bad. Overall a good developer experience, and a +10 for Python 3!

But I can't end without a little plug: if you know anyone who's getting married, and you can help spread the word, I'd be very grateful -- just point them to [GiftyWeddings.com](https://giftyweddings.com/).
