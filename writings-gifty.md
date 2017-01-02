---
layout: default
title: Developing GiftyWeddings.com
permalink: /writings/gifty/index.html
---
<h1><a href="/writings/gifty/">{{ page.title }}</a></h1>
<p class="subtitle">January 2017</p>


I run a small wedding gift registry website over at [GiftyWeddings.com](https://giftyweddings.com/). This article explains how I got started with Gifty and also describes the recent revamp I gave the site. I'm a programmer first, so this is primarily from my perspective as a developer, but I might also include a few juicy details about the business side of things (if you can call a tiny side project a "business").


Version One
===========

I made Gifty initially for my younger brother and his wife when they were getting married, 8+ years ago. But it wasn't that much harder to open it up as a little side business and make it available for other couples to use. If I remember correctly, I had a very basic first version done in a long weekend, but then spent many more evenings and weekends polishing it up to make it more useable.

This first version of the site was a fairly simple website written in Python (2.6). It used the [web.py](http://webpy.org/) web framework, Cheetah and later my [Symplate](https://github.com/benhoyt/symplate) for templating, and PostgreSQL with my little [row-object mapper](http://blog.brush.co.nz/2010/01/mro/) for database handling.

The Python backend did all the work -- template rendering, form handling, database actions. JavaScript was only used to enhance usability in a few places, like focusing a text input on page load. (Kids, this is how the web used to work. It wasn't called [progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement) back then, just "a website". And there were no 3MB JavaScript blobs including 953 npm packages for a basic CRUD app.)

Through word-of-mouth and good ol' Google, after a couple of years Gifty was getting a few couples a month using the site. After a while, my brothers and I over at [Brush Technology](http://brush.co.nz/) injected a couple of thousand advertising dollars (AdWords, Facebook, and print wedding magazines) that probably only broke even, but did give the site a bit more visibility. The site's had about 5-10 couples using it per month for the last several years.

Somewhat strangely, it's really only been modestly successful in New Zealand (where I lived at the time). I guess this is partly just because that's where the initial traffic came from, but even the small marketing spend we did in the U.S. and further afield didn't help much. I think couples in the States tend to just use the store-based registries. Still, I get about one couple per month using it outside New Zealand.

The original site looked like this:

![Screenshot of the old Gifty Weddings website](/images/gifty-old.png)

Being designed by the less-than-world-class-designer yours truly, it was kinda dated even when it first launched, but after a few years it felt quite ugly. But it was 2016 before I got around to a revamp.


The Revamp
==========

Close to eight years after version one, I started working on a revamp. Party because I wanted to learn some new tools, and partly because it really needed a from-the-ground-up fresh look, I decided to do a complete rewrite.

I'd been wanting to learn a bit about React for a while, so I wanted to use that for the frontend. Also, the site's "edit mode" for the couple was pretty old-school -- every time you added or edited a gift it was a page load and round trip to the server. While part of me likes that from a "web purity" perspective, it was kinda klunky to use.

So I ended up using React (version 0.14) along with Babel and webpack to get some ES2015 goodness in my JavaScript. Modern JavaScript is actually not bad to use. I tend to be very conservative about using 3rd party modules (no [leftpad fiasco](http://www.haneycodes.net/npm-left-pad-have-we-forgotten-how-to-program/)), so ended up using just React, with babel-polyfill to get the ES2015 extras, and zero other npm dependencies. My webpack'd JavaScript blob for Gifty is 256KB, which is both pretty small for a modern web app, and a neat number for a computer scientist.

I'm not a fan of large CSS frameworks, but wanted some kind of starting point, so I ended up using [Skeleton](http://getskeleton.com/). It has a responsive grid layout and good typography defaults that worked well for Gifty. The site's CSS is 17KB, of which 7KB is Normalize and Skeleton. I didn't feel the need for a CSS preprocessor for a small, single-file chunk of CSS.

So I did the new design myself, with a bunch of help from the Skeleton CSS and custom font. Here's what the new site looks like:

![Screenshot of the new Gifty Weddings website](/images/gifty-new.jpg)
