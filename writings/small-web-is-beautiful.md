---
layout: default
title: "The small web is beautiful"
permalink: /writings/the-small-web-is-beautiful/
description: "TODO"
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2021</p>

<!-- TODO: delete cv/test-* files -->

**TODO: work-in-progress draft**

> Summary: I believe that small, home-grown websites are compelling aesthetically, but also important to help us resist selling our souls to large tech companies. In this article I present a vision for "the small web" as well as some concrete ideas to help people get started.


About fifteen years ago, I read E. F. Schumacher's *Small is Beautiful* and, despite not being interested in economics, I was moved by its message. Perhaps even more, I loved the terse poetry of the book's title -- it resonated with my frugal upbringing and my own aesthetic.

I think it's time for a version of that book about technology, with a chapter on web development: *The Small Web is Beautiful: A Study of Web Development as if People Mattered.* Until someone writes that, a short article will have to do.

There are two aspects of this: first, **small teams and companies**. I'm not going to talk much about that here, but [Basecamp](https://basecamp.com/books) and many others have. What I'm going to focus on in this article is **small websites and architectures**.

I'm not the first to talk about "the small web", but, somewhat surprisingly, only a few people have discussed it using that term -- here are the main web pages I can find that do:

* [Rediscovering the Small Web](https://neustadt.fr/essays/the-small-web/) by Parimal Satyal: a fabulous article about the joy of small, independent (and sometimes retro) websites in contrast to "the commercial web".
* [What is the Small Web?](https://ar.al/2020/08/07/what-is-the-small-web/), by Aral Balka: more of a manifesto against the surveillance of Big Tech than something concrete, but still interesting.

So let's dive in. I want to cover a bunch of different angles, each with its own subheading.


## Small software

If we're going to talk about a small web, we need to start with small *software*.

I started my career as an embedded programmer, not as in "embedded Linux" but as in microcontrollers where 16KB of RAM was generous. My current laptop has 16GB of RAM, and that's not a lot by today's standards. We were building TCP-capable products with *one millionth* the amount of RAM. These kind of chips are very cheap, and still widely used for small electronic devices, sensors, internet-of-things products, and so on.

You have to think about every byte, compile with size optimizations enabled, reuse buffers, and so on. It's a very different thing from modern web development, where a JavaScript app compiles "down" to a 1MB bundle, or a single Python object header is 16 bytes before you've even got any data, or a Go hello-world binary is 2MB even before you've added any real code.

How do you create small programs? I think the main thing is that you have to *care about size*, and most of us don't think we have time for that. Apart from embedded development, there's an entire programming subculture called the [demoscene](https://en.wikipedia.org/wiki/Demoscene) that has competitions for the smallest 4KB demos: who can pack the most graphical punch into 4096 bytes of executable. That's smaller than most favicon images! ([Elevated](https://www.youtube.com/watch?v=jB0vBmiTr6o) and [cdak](https://www.youtube.com/watch?v=RCh3Q08HMfs) are two of the highest-rated 4K demos.)

It's not just about executable size ... when you're developing your next command line tool, if you use Go or Rust or even C, your program will almost certainly be much faster, smaller, and use less memory than a Python or Java equivalent. And easier to install. If you don't understand why, please learn -- it's out of scope for this article, but to summarize: Go, Rust, and C compile to ready-to-execute machine code, don't carry around a virtual machine, and don't have 16 bytes of overhead for even tiny objects like integers (that's you, Python).

But why not apply some of the same principles to web development? In the web world, I think the main trick is to be careful what dependencies you include, and also what dependencies *they* pull in. In short, know `node_modules` -- or maybe better, *no* `node_modules`.

<!--
TODO: does this paragraph add anything here?

If you're at all able to influence "product", then you can push back on new features, or design smaller things to begin with. Rob Pike gave a great talk about this in relation to the Go programming language, [*Less is exponentially more*](https://commandcenter.blogspot.com/2012/06/less-is-exponentially-more.html), in which he compares the everything-including-the-kitchen-sink philosophy of C++ with the minimalist philosophy of Go. Go's success and clarity is due in part to its *lack* of features.
-->

Niklaus Wirth of Pascal fame wrote a famous paper in 1995 called [A Plea for Lean Software](https://cr.yp.to/bib/1995/wirth.pdf). His take is that "a primary cause for the complexity [of software] is that software vendors uncritically adopt almost any feature that users want ... when a system's power is measured by the number of its features, quantity becomes more important than quality". He goes on to describe Oberon, a computer language (which reminds me of Go in some ways) and an operating system that he believes help solve the complexity problem. Definitely wirth a read!

I've been mulling over this for a number of years -- back in 2008 I wrote a sarcastic dig at how bloated Adobe Reader had become: [Thank you, Adobe Reader 9!](https://blog.brush.co.nz/2008/07/adobe-reader-9/) But instead of just complaining, how do we actually solve this problem?

Concretely, I think we need to start doing the following (most of which apply to web development too):

* Care about size: this sounds obvious, but things only change when people care about them.
* Measure: both your executable's size, and your program's memory usage. You may want to measure over time, and make it a blocking issue if they grow more than *x*% in a release.
* Language: choose a language that has a chance, for example Rust, C or C++, or for servers, Go. These languages aren't right everything (like data transformation scripts), but they produce small executables, and they're good for CLIs and desktop apps.
* Remove: cut down your feature set. Aim for a small number of high-quality features. My car can't fly or float, and that's okay -- it drives well.
* Say no to new features: unless they really fit your philosophy, or add more than they cost over the lifetime of your project.
* Dependencies: understand the size and complexity of each dependency you pull in. Use only built-in libraries if you can. More about this [below](#TODO).


## Small websites

There's a growing number of people interested in small websites.

A few months ago there was a sequence of posts to Hacker News about various "clubs" you could post your small website on: the [1MB Club](https://1mb.club/) ([comments](https://news.ycombinator.com/item?id=25151773)), [512KB Club](https://512kb.club/) ([comments](https://news.ycombinator.com/item?id=25450451)), [250KB Club](https://250kb.club/) ([comments](https://news.ycombinator.com/item?id=25176663)), and even the [10KB Club](https://10kbclub.com/) ([comments](https://news.ycombinator.com/item?id=25556860)). I think those are a fun indicator of renewed interested in minimalism, but I will say that raw size isn't enough -- a 2KB site with no real content isn't much good, and a page with 512KB of very slow JavaScript is worse than a snappy site with 4MB of well-chosen images.

Some of my favourite small websites are:

[Hacker News](https://news.ycombinator.com/news): I personally like the minimalist, almost brutalist aesthetic, but I also just downloaded the home page, and loading all resources transfers only 21KB (61KB uncompressed). Even pages with huge comment threads only transfer about 100KB of compressed data, and load quickly. Reddit has become such a bloated mess in comparison. Hacker News, never change!

[Lobste.rs](https://lobste.rs/): a similar news-and-voting site, with a slighly more "modern" aesthetic, but still small. It uses some JavaScript and profile icons, but it's still clean and fast, and the total transfer size for the homepage is only 102KB.

[Sourcehut](https://sourcehut.org/): I like the concept behind Drew DeVault's business, but I love how small and anti-fluff the website is. He has set up a mini-site called the [Software Forge Performance Index](https://forgeperf.org/) that tracks size and browser performance of the main source control websites -- SourceHut is far and away the lightest and fastest. Even his homepage is only 81KB, including several screenshot thumbnails.

[SQLite](https://sqlite.org/): Not only is SQLite a small, powerful SQL database engine, the website is fantastically small and content-rich. Even their 7000-word [page about testing](https://sqlite.org/testing.html) is only 70KB. How do they do this? It's not magic: focus on high-quality textual content, minimal CSS, no JavaScript, very few images (a small logo and some SVGs).

More and more personal blogs and websites have adopted this aesthetic, too. One of the more hardcore examples is [Dan Luu's blog](https://danluu.com/). Not only is his inline CSS only about 200 bytes (it's essentially unstyled), his HTML source code doesn't use any linefeed characters. Kinda fun, although then he goes on to load 20KB of Google Analytics JavaScript...

There are many, many more. Programmer Sijmen Mulder created a nice list of [text-only websites](https://sjmulder.nl/en/textonly.html) -- not quite the same thing as *small*, but definitely overlaps!

However, **it's not just about raw size,** but about an "ethos of small". Caring about the users of your site: that your pages download fast, are easy to read, have interesting content, and don't load scads of JavaScript for Google or Facebook's trackers. Building a website from scratch is not everyone's cup of tea, but for those of us who do it, maybe we can promote templates and tools that produce small sites that encourage quality over quantity.

For my personal website, I lovingly crafted each byte of HTML and CSS by hand, like a hipster creating a craft beer. Seriously though, if your focus is good content, it's not hard to create a simple template from scratch -- with just a few lines of HTML and CSS. It will be small and fast, and it'll be yours.

I use GitHub Pages just because it's a free host that supports SSL, and automatically builds your site using the Jekyll static site generator whenever you make a change. Using a static site generator means I can have a standard header and include the same CSS across all pages easily. (Because most people only view one or two articles on my site, I include my CSS inline. With HTTP/2, this doesn't make much difference, but Lighthouse showed around 200ms with inline CSS, 300ms with external CSS.)

This article transfers about TODO 14KB (41KB uncompressed). It's small, fast, and readable on desktop or mobile. Beauty is in the eye of the beholder, but I'm aiming for a minimalist design focussed on the content.

In addition to making sure your HTML and CSS are small, be sure to compress your images properly. Two basic things here: don't upload ultra-high resolution images straight from your camera, and use a reasonable amount of JPEG compression for photos (and PNG for screenshots or vector art). Even for large images, you can usually use 80 or 85% compression and still have an image without JPEG noise. For example, the large 1920x775 image on the top of my [side business's homepage](https://giftyweddings.com/) is only 300KB.

Speaking of hero images, you don't need big irrelevant images at the top of your blog posts. They just add hundreds of kilobytes (even megabytes) to your page weight, and don't provide value. And definitely don't scatter your article with animated GIFs: if there's something animated on the screen, I can hardly concentrate enough to read the text -- and I'm [not the](https://news.ycombinator.com/item?id=26057078) [only one](https://news.ycombinator.com/item?id=11210860).


## Emphasis on server-side, not JavaScript

JavaScript is a bane for small websites: it adds to the download size and time, it can be a performance killer, it's bad for accessibility, and if you don't hold it right, it's [bad for search engines](https://benhoyt.com/writings/seo-for-software-engineers/). Plus, if your website is content-heavy, it probably isn't adding much.

Don't get me wrong: JavaScript is sometimes unavoidable, and great where it's great. If you're developing a browser application ("single page application") like Gmail or Google Maps, you should almost certainly use be using JavaScript. But for your next blog, brochure website, or project documentation site, please consider an HTML-only approach.

If your site -- like a lot of sites -- is somewhere in between and contains some light interaction, consider using JavaScript only where necessary. Use it only for the interactive components.

* Why? Simpler, faster for many things, lower-bandwidth
* NoJS for static pages
* Progressive Enhancement vs Graceful Degredation (but we don't even bother with that anymore!): https://alistapart.com/article/understandingprogressiveenhancement/ - Is it worth it in 2021?
* https://github.com/turbolinks/turbolinks
* https://turbo.hotwire.dev/

* StackOverflow again


## Static site generators

* Static websites
* Jekyll, Hugo, home-made
* Some even drop the generator and write pure HTML+CSS (but really want includes / base template)


## Fewer dependencies

* Rob Pike: "Better a little copying than a little dependency"
* Few deps: e.g., using XMLHttpRequest directly for Gifty
* Russ Cox's article
* node_modules, no! Contrast with Go; Python seems to be a middle ground
* Don't be a leftpad.
* Use only stdlib if you can


## Analytics

"Small web" analytics.

* Google Analytics -> GoatCounter
* Link to my previous articles, including LWN


## Small architecture

* Gifty tech specs - EC2, S3, Ansible, SQLite, few 3rd party modules
* Hacker News - hosted on a single server
* StackOverflow architecture - performance is a feature
* Glorious Monolith
* Touch on small teams and Conway's Law

"Safely run your application on a single server."
https://litestream.io/blog/why-i-built-litestream/

SQLite success story: https://www.indiehackers.com/podcast/166-sam-eaton-of-crave-cookie

http://boringtechnology.club/


## Hosting

* Not Medium
* Host yourself on a simple virtual server (or real server!)



## Other resources

[IndieWeb.org](https://indieweb.org/), though they use the term "indie" rather than "small". This movement looks more organic than the Small Technology Foundation (which has been [critiqued](https://news.ycombinator.com/item?id=24269071) as "digital green-washing"), and their wiki has a lot more real content. They even have local [Homebrew Website Clubs](https://indieweb.org/Homebrew_Website_Club) and [IndieWebCamp](https://indieweb.org/IndieWebCamps) meetups. Fun stuff!

Find others


## Summing up

Blah

Companies will do what companies do, and continue to make flashy-looking, bloated websites that "convert" well. Maybe you can have an influence, and come home to your better half and say "honey, I shrunk the web". Or maybe you'll just do it on your personal website.

Disclaimer: as part of my day job, I work on Juju, not a small system by any measure.
