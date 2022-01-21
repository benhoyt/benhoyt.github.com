---
layout: default
title: "The small web is beautiful"
permalink: /writings/the-small-web-is-beautiful/
description: A vision for the "small web", small software, and small architectures.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">March 2021</p>


> Summary: I believe that small websites are compelling aesthetically, but are also important to help us resist selling our souls to large tech companies. In this essay I present a vision for the "small web" as well as the small software and architectures that power it. Also, a bonus rant about microservices.
>
> **Go to:** [Software](#small-software) \| [Web](#small-websites) \| [Server-side](#emphasize-server-side-not-javascript) \| [Static sites](#static-sites-and-site-generators) \| [Dependencies](#fewer-dependencies) \| [Analytics](#small-analytics) \| [Microservices](#small-architectures-not-microservices)


About fifteen years ago, I read E. F. Schumacher's *Small is Beautiful* and, despite not being interested in economics, I was moved by its message. Perhaps even more, I loved the terse poetry of the book's title -- it resonated with my frugal upbringing and my own aesthetic.

I think it's time for a version of that book about technology, with a chapter on web development: *The Small Web is Beautiful: A Study of Web Development as if People Mattered.* Until someone writes that, this essay will have to do.

There are two aspects of this: first, **small teams and companies**. I'm not going to talk much about that here, but [Basecamp](https://basecamp.com/books) and many others have. What I'm going to focus on in this essay is **small websites and architectures**.

I'm not the first to talk about the "small web", but, somewhat surprisingly, only a few people have discussed it using that term. Here are the main web pages I can find that do:

* [Rediscovering the Small Web](https://neustadt.fr/essays/the-small-web/) by Parimal Satyal: a fabulous article about the joy of small, independent (and sometimes retro) websites in contrast to the "commercial web".
* [What is the Small Web?](https://ar.al/2020/08/07/what-is-the-small-web/), by Aral Balkan of the Small Technology Foundation: more of a manifesto against the surveillance of Big Tech than something concrete, but still interesting.

Why aim small in this era of fast computers with plenty of RAM? A number of reasons, but the ones that are most important to me are:

* Fewer moving parts. It's easier to create more robust systems and to fix things when they do go wrong.
* Small software is faster. Fewer bits to download and clog your computer's memory.
* Reduced power consumption. This is important on a "save the planet" scale, but also on the very local scale of increasing the battery life of your phone and laptop.
* The light, frugal aesthetic. That's personal, I know, but as you'll see, I'm not alone.

So let's dive in. I want to cover a bunch of different angles, each with its own subheading.


## Small software

If we're going to talk about a small web, we need to start with small *software*.

As a teen, I learned to program using x86 assembly and [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) -- perhaps odd choices, but my dad was heavily into Forth, and I loved how the language was so simple I could write [my own bootstrapped compiler](https://github.com/benhoyt/third).

In terms of career, I started as an embedded programmer -- not as in "embedded Linux" but as in microcontrollers where 16KB of RAM was generous. My current laptop has 16GB of RAM, and that's not a lot by today's standards. We were building IP-networked products with *one millionth* the amount of RAM. Those kinds of micros are as cheap as chips (ahem), and still widely used for small electronic devices, sensors, internet-of-things products, and so on.

You have to think about every byte, compile with size optimizations enabled, and reuse buffers. It's a very different thing from modern web development, where a JavaScript app compiles "down" to a 1MB bundle, or a single Python object header is 16 bytes before you've even got any data, or a Go hello-world binary is 2MB even before you've added any real code.

How do you create small programs? I think the main thing is that you have to *care about size*, and most of us don't think we have time for that. Apart from embedded development, there's an entire programming subculture called the [demoscene](https://en.wikipedia.org/wiki/Demoscene) that cares about this. They have competitions for the smallest 4KB demos: who can pack the most graphical punch into 4096 bytes of executable. That's smaller than many favicons! ([Elevated](https://www.youtube.com/watch?v=jB0vBmiTr6o) and [cdak](https://www.youtube.com/watch?v=RCh3Q08HMfs) are two of the highest-rated 4K demos.) Many demosceners go on to become game developers.

It's not just about executable size ... when you're developing your next command line tool, if you use Go or Rust or even C, your program will be much faster, smaller, and use less memory than a Python or Java equivalent. And easier to install. If you don't understand why, please do learn. (It's out of scope for this essay, but to summarize: Go, Rust, and C compile to ready-to-execute machine code, don't carry around a virtual machine, and don't have memory overhead for objects like integers.)

But why not apply some of the same principles to web development? In the web world, I think the main trick is to be careful what dependencies you include, and also what dependencies *they* pull in. In short, know `node_modules` -- or maybe better, *no* `node_modules`. More about this [below](#fewer-dependencies).

Niklaus Wirth of Pascal fame wrote a famous paper in 1995 called [A Plea for Lean Software [PDF]](https://cr.yp.to/bib/1995/wirth.pdf). His take is that "a primary cause for the complexity is that software vendors uncritically adopt almost any feature that users want", and "when a system's power is measured by the number of its features, quantity becomes more important than quality". He goes on to describe Oberon, a computer language (which reminds me of Go in several ways) and an operating system that he believes helps solve the complexity problem. Definitely wirth a read!

I've been mulling over this for a number of years -- back in 2008 I wrote a sarcastic dig at how bloated Adobe Reader had become: [Thank you, Adobe Reader 9!](https://blog.brush.co.nz/2008/07/adobe-reader-9/) It was a 33MB download and required 220MB of hard drive space even in 2008 (it's now a 150MB download, and I don't know how much hard drive space it requires, because I don't install it these days).

But instead of just complaining, how do we actually solve this problem? Concretely, I think we need to start doing the following:

* Care about size: this sounds obvious, but things only change when people think they're important.
* Measure: both your executable's size, and your program's memory usage. You may want to measure over time, and make it a blocking issue if the measurements grow more than *x*% in a release. Or you could hold a memory-reduction sprint every so often.
* Language: choose a backend language that has a chance, for example Rust, C or C++, or for servers, Go. These languages aren't right for everything (like data transformation scripts), but they produce small executables, and they're good for CLIs and desktop apps.
* Remove: cut down your feature set. Aim for a small number of high-quality features. My car can't fly or float, and that's okay -- it drives well.
* Say no to new features: unless they really fit your philosophy, or add more than they cost over the lifetime of your project.
* Dependencies: understand the size and complexity of each dependency you pull in. Use only built-in libraries if you can.


## Small websites

I'm glad there's a growing number of people interested in small websites.

A few months ago there was a sequence of posts to Hacker News about various "clubs" you could post your small website on: the [1MB Club](https://1mb.club/) ([comments](https://news.ycombinator.com/item?id=25151773)), [512KB Club](https://512kb.club/) ([comments](https://news.ycombinator.com/item?id=25450451)), [250KB Club](https://250kb.club/) ([comments](https://news.ycombinator.com/item?id=25176663)), and even the [10KB Club](https://10kbclub.com/) ([comments](https://news.ycombinator.com/item?id=25556860)). I think those are a fun indicator of renewed interested in minimalism, but I will say that raw size isn't enough -- a 2KB site with no real content isn't much good, and a page with 512KB of very slow JavaScript is worse than a snappy site with 4MB of well-chosen images.

Some of my favourite small websites are:

[Hacker News](https://news.ycombinator.com/news): I personally like the minimalist, almost brutalist design, but I love its lightness even more. I just downloaded the home page, and loading all resources transfers only 21KB (61KB uncompressed). Even pages with huge comment threads only transfer about 100KB of compressed data, and load quickly. Reddit has become such a bloated mess in comparison. Hacker News, never change!

[Lobsters](https://lobste.rs/): a similar news-and-voting site, with slightly more "modern" styling. It uses some JavaScript and profile icons, but it's still clean and fast, and the total transfer size for the homepage is only 102KB. You just don't need megabytes to make a good website.

[Sourcehut](https://sourcehut.org/): I like the concept behind Drew DeVault's business, but I love how small and anti-fluff the website is. He has set up a mini-site called the [Software Forge Performance Index](https://forgeperf.org/) that tracks size and browser performance of the prominent source code websites -- Sourcehut is far and away the lightest and fastest. Even his homepage is only 81KB, including several screenshot thumbnails.

[SQLite](https://sqlite.org/): not only is SQLite a small, powerful SQL database engine, the website is fantastically small and content-rich. Even their 7000-word [page about testing](https://sqlite.org/testing.html) is only 70KB. How do they do this? It's not magic: focus on high-quality textual content, minimal CSS, no JavaScript, and very few images (a small logo and some SVGs).

[LWN](https://lwn.net/): I'm a little biased, because I've written [articles](https://lwn.net/Archives/GuestIndex/#Hoyt_Ben) for them, but they're an excellent website for Linux and programming news. Extremely high-quality technical content (and a high bar for authors). They're definitely niche, and have a "we focus on quality content, not updating our CSS every year" kind of look -- they've been putting out great content for 23 years! Their homepage only downloads 44KB (90KB uncompressed).

[Dan Luu's blog](https://danluu.com/): this is one of the more hardcore examples. His inline CSS is only about 200 bytes (the pages are basically unstyled), and his HTML source code doesn't use any linefeed characters. Kind of a fun point, although then he goes on to load 20KB of Google Analytics JavaScript...

As a friend pointed out, those websites have something of an "anti-aesthetic aesthetic". I confess to not minding that at all, but on the other hand, small doesn't have to mean ugly. More and more personal blogs and websites have adopted a small web approach but are more typographically appealing:

* [Armin Ronacher's Thoughts and Writings](https://lucumr.pocoo.org/)
* [Chris Wellons' "Null program" blog](https://nullprogram.com/)
* [Eric Radman's BSD and SQL blog](http://eradman.com/)
* [Hugo Tunius' programming blog](https://hugotunius.se/)
* [James Hague's "Programming in the Twenty-First Century"](https://prog21.dadgum.com/)
* [Julia Evans' programming blog](https://jvns.ca/)

There are many, many more. Programmer Sijmen Mulder created a nice list of [text-only websites](https://sjmulder.nl/en/textonly.html) -- not quite the same thing as *small*, but it definitely overlaps!

However, **it's not just about raw size,** but about an "ethos of small". It's caring about the users of your site: that your pages download fast, are easy to read, have interesting content, and don't load scads of JavaScript for Google or Facebook's trackers. Building a website from scratch is not everyone's cup of tea, but for those of us who do it, maybe we can promote templates and tools that produce small sites that encourage quality over quantity.

For this website, I lovingly crafted each byte of HTML and CSS by hand, like a hipster creating a craft beer. Seriously though, if your focus is good content, it's not hard to create a simple template from scratch with just a few lines of HTML and CSS. It will be small and fast, and it'll be yours.

Loading this essay transfers about 23KB (56KB uncompressed), including the favicon and analytics script. It's small, fast, and readable on desktop or mobile. I don't think it's too bad looking, but I'm primarily aiming for a minimalist design focussed on the content.

In addition to making sure your HTML and CSS are small, be sure to compress your images properly. Two basic things here: don't upload ultra-high resolution images straight from your camera, and use a reasonable amount of JPEG compression for photos (and PNG for screenshots or vector art). Even for large images, you can usually use 75% or 80% compression and still have an image without JPEG noise. For example, the large 1920x775 image on the top of my [side business's homepage](https://giftyweddings.com/) is only 300KB.

Speaking of hero images, you don't need big irrelevant images at the top of your blog posts. They just add hundreds of kilobytes (even megabytes) to your page weight, and don't provide value. And please don't scatter your article with animated GIFs: if there's something animated on the screen, I can hardly concentrate enough to read the text -- and I'm [not the](https://news.ycombinator.com/item?id=26057078) [only one](https://news.ycombinator.com/item?id=11210860). Include relevant, non-stock images that provide value equal to their weight in bytes. Bare text is okay, too, like a magazine article.

[IndieWeb.org](https://indieweb.org/) is a great resource here, though they use the term "indie" rather than "small". This movement looks more organic than the [Small Technology Foundation](https://small-tech.org/) (which has even been [critiqued](https://news.ycombinator.com/item?id=24269071) as "digital green-washing"), and their wiki has a lot more real content. IndieWeb also promotes local [Homebrew Website Clubs](https://indieweb.org/Homebrew_Website_Club) and [IndieWebCamp](https://indieweb.org/IndieWebCamps) meetups.


## Emphasize server-side, not JavaScript

JavaScript is a mixed blessing for the web, and more often than not a bane for *small* websites: it adds to the download size and time, it can be a performance killer, it's bad for accessibility, and if you don't hold it right, it's [bad for search engines](https://benhoyt.com/writings/seo-for-software-engineers/). Plus, if your website is content-heavy, it probably isn't adding much.

Don't get me wrong: JavaScript is sometimes unavoidable, and is great where it's great. If you're developing a browser-based application like Gmail or Google Maps, you should almost certainly be using JavaScript. But for your next blog, brochure website, or project documentation site, please consider plain HTML and CSS.

If your site -- like a lot of sites -- is somewhere in between and contains some light interaction, consider using JavaScript only for the parts of the page that need it. There's no need to overhaul your whole site using React and Redux just to add a form. Letting your server generate HTML is still an effective way to create fast websites.

[Stack Overflow](https://stackoverflow.com/) is a case in point. From day one, they've made [performance a feature](https://blog.codinghorror.com/performance-is-a-feature/) by rendering their pages on the server, and by measuring and reducing render time. I'm sure the Stack Overflow code has changed quite a lot since the Jeff Atwood days -- it now makes a ton of extra requests for advertising purposes -- but the content still loads fast.

[Hacker News](https://news.ycombinator.com/) (there's that site again) is a server-side classic. With only [one tiny JavaScript file](https://news.ycombinator.com/hn.js) for voting, the HTML generated on the server does the rest. And [apparently](https://news.ycombinator.com/item?id=23876281) it still runs on a single machine.

Around fifteen years ago there was this great idea called [progressive enhancement](https://alistapart.com/article/understandingprogressiveenhancement/). The idea was to serve usable HTML content to everyone, but users with JavaScript enabled or fast internet connections would get an enhanced version with a more streamlined user interface. In fact, Hacker News itself uses progressive enhancement: even in 2021, you can still turn off JavaScript and use the voting buttons. It's a bit clunkier because voting now requires a page reload, but it works fine.

Is progressive enhancement still relevant in 2021? Arguably not, though some die-hards still turn JavaScript off, or at least enable it only for sites they trust. However, I think it's the *mentality* that's most important: it shows the developer cares about performance, size, and alternative users. If Hacker News voting didn't work without JavaScript, I don't think that would be a big problem -- but it shows a certain kind of nerdish care that it does work. Plus, the JavaScript they do have is only 2KB (5KB uncompressed).

Compare that to the 8MB (14MB uncompressed) that the [Reddit homepage](https://www.reddit.com/) loads. And this across 201 requests -- I kid you not! -- most of which is JavaScript to power all the ads and tracking. Lovely...

You don't need a "framework" to develop this way, of course, but there are some tools that make this style of server-side development easier. [Turbolinks](https://github.com/turbolinks/turbolinks) from the Basecamp folks was an early one, and it's now been superseded by [Turbo](https://turbo.hotwire.dev/), which is apparently used to power their email service [Hey](https://hey.com/). I haven't used these personally, but the ideas are clever (and surprisingly old-skool): use standard links and form submissions, [serve plain HTML](https://m.signalvnoise.com/html-over-the-wire/), but speed it up with WebSockets and JavaScript if available. Just today, in fact, someone posted a new article on Hacker News which claims ["The Future of Web Software Is HTML-over-WebSockets"](https://alistapart.com/article/the-future-of-web-software-is-html-over-websockets/). If Hey is anything to go by, this technique is fast!

On the other hand, sometimes you can *reduce* overall complexity by using JavaScript for the whole page if you're going to need it anyway. For example, the registry pages on my wedding registry website are rendered on the client (they actually [use Elm](https://benhoyt.com/writings/learning-elm/), which compiles to JavaScript). I do need the interactivity of JavaScript (it's more "single page application" than mere content), but I don't need server-side rendering or good SEO for these pages. The homepage is a simple server-rendered template, but the registry pages are fully client-rendered.


## Static sites and site generators

Another thing there's been renewed interest in recently is static websites (these used to be called just "websites"). You upload some static HTML (and CSS and JavaScript) to a static file server, and that's it.

Improving on that, there are many "static site generators" available. These are tools that generate a static site from simple templates, so that you don't have to copy your site's header and footer into every HTML file by hand. When you add an article or make a change, run the script to re-generate.  If you're hosting a simple site or blog or even a news site, this is a great way to go. It's content, after all, not an interactive application.

I use [GitHub Pages](https://pages.github.com/) on this site just because it's a free host that supports SSL, and automatically builds your site using the [Jekyll](https://jekyllrb.com/) static site generator whenever you push a change. I have a standard header and include the same CSS across all pages easily, though you can have multiple templates or "layouts" if you want. Because most people only view one or two articles on my site, I include my CSS inline. With HTTP/2, this doesn't make much difference, but Lighthouse showed around 200ms with inline CSS, 300ms with external CSS.

Here's an example of what a simple Jekyll page looks like (the start of this essay, in fact):

```
    ---
    layout: default
    title: "The small web is beautiful"
    permalink: /writings/the-small-web-is-beautiful/
    description: A vision for the "small web", small software, and ...
    ---
    Markdown text here.
```

I've also used [Hugo](https://gohugo.io/), which is a really fast static site generator written in Go -- it generates even large sites with thousands of pages in a few seconds. And there are [many other options](https://staticsitegenerators.net/) available.



## Fewer dependencies

There's nothing that blows up the size of your software (or JavaScript bundle) like third party dependencies. I always find a web project's `node_modules` directory hard to look at -- just the sheer volume of stuff in there makes me sad.

Different languages seem to have different "dependency cultures". JavaScript, of course, is notorious for an "if it can be a library, it should be" attitude, resulting in the [left-pad disaster](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/) as well as other minuscule libraries like the 3-line [`isarray`](https://github.com/juliangruber/isarray/blob/c9b0c5b4f44d366c9f51c7e85e70339bdeaa97b0/index.js#L3-L5). There are also big, heavy packages like [`Moment.js`](https://momentjs.com/), which takes [160KB even when minified](https://momentjs.com/docs/#/use-it/webpack/). There are ways to shrink it down if you don't need all locales, but it's not the default, so most people don't (you're probably better off choosing a more modular approach like [`date-fns`](https://date-fns.org/)).

Go now has good dependency management with the recent [modules tooling](https://golang.org/doc/modules/managing-dependencies), but it also has a culture of "use the standard library if you can". Russ Cox wrote an excellent essay about the downsides of not being careful with your dependencies: [Our Software Dependency Problem](https://research.swtch.com/deps). Go co-creator Rob Pike even made this one of his [Go proverbs](https://go-proverbs.github.io/): "A little copying is better than a little dependency." You can probably guess by now, but I like this minimalist approach: apart from reducing the number of points of failure, it makes programs smaller.

Python, Ruby, Java, and C# seem to be somewhere in between: people use a fair number of dependencies, but from what I've seen there's more care taken and it doesn't get as out of hand as `node_modules`. Admittedly it is a little unfair, as Python (and those other languages) have standard libraries that have more in them than JavaScript's.

The website [YouMightNotNeedjQuery.com](http://youmightnotneedjquery.com/) shows how many of the tasks you think you might need a library for are actually quite simple to do with plain JavaScript. For example, in one of my projects I use a function like the following to make an API request with plain old `XMLHttpRequest`:

```javascript
function postJson(url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.DONE) {
            callback(xhr.status, JSON.parse(xhr.responseText));
        }
    };
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}
```

The moral of the story: think twice before adding dependencies. You'll keep your websites and programs smaller and more reliable, and you'll thank Russ Cox later.


## Small analytics

Most website owners want some form of analytics to see how many visitors are coming to their site, and from where. The go-to tool is Google Analytics: it's easy to set up and the UI is pretty comprehensive. But there's a cost: it adds a significant amount of weight to your page (19KB of JavaScript, 46KB uncompressed), and it sends a *lot* of user data for Google to collect.

Once again, there's been renewed interest in smaller, more privacy-friendly analytics systems in recent times. Just this morning I read a provocative article that was highly-voted on Hacker News called ["Google Analytics: Stop feeding the beast"](https://casparwre.de/blog/stop-using-google-analytics/).

Last year I wrote two articles for LWN on the subject, so I won't say too much more here:

* [Lightweight alternatives to Google Analytics](https://lwn.net/Articles/822568/): replacing it with lightweight open source and privacy-conscious alternatives, specifically [GoatCounter](https://www.goatcounter.com/) and [Plausible](https://plausible.io/).
* [More alternatives to Google Analytics](https://lwn.net/Articles/824294/): some heavier alternatives, and a brief look at log-based analytics tools.

For this website I use GoatCounter, which is available as a low-cost hosted service (free for non-commercial use) or as a self-hosted tool. I really like what Martin is doing here, and how small and simple the tool is: no bells and whistles, just the basic traffic numbers that most people want.


## Small architectures (not microservices)

Small websites are great for users, but small architectures are great for developers. A small, simple codebase is easy to maintain, and will have fewer bugs than a large, sprawling system with lots of interaction points.

I contend that the "microservices everywhere" buzz is a big problem. Microservices may be used successfully at Google and Amazon, but most companies don't need to build that way. They introduce complexity in the code, API definitions, networking, deployment, server infrastructure, monitoring, database transactions -- just about every aspect of a system is made more complex. Why is that?

* Code: you have lots of little repositories, possibly in different languages, and each has to have some way to talk to the other services (JSON over HTTP, gRPC, etc). With a monolithic system, it's all in one language (much better for a small team), calling other modules is just a function call, and system-wide refactoring is comparatively easy (especially in a statically typed language like Go or Java).
* API definitions: with many services talking to each other, suddenly you need standardized interfaces for how they communicate. You spend a lot of time setting up gRPC or JSON schema definitions. In a single codebase, a function signature *is* the API definition.
* Networking: with microservices, a function call is a network call, and you spend time setting up your network infrastructure, thinking about timeouts and retries, and maybe even designing inter-service authentication. In monolithic systems, you only worry about networking when talking to your database, cloud provider, and users.
* Deployment: at a previous company I worked at, once we started building with microservices, suddenly we needed fancy deployment tooling and a dedicated infrastructure team to manage it all. You can get by with a lot less if you're only deploying a few services.
* Server infrastructure: you'll probably need to set up new infrastructure -- lots of small virtual machines, or a Kubernetes-based system. Kubernetes in itself is a complex distributed application (even [Google admits](https://www.theregister.com/2021/02/25/google_kubernetes_autopilot/) it's too complex), and it takes a lot of work -- or a lot of money -- to run properly.
* Monitoring: to debug issues, you'll need costly distributed-monitoring software like Datadog to see what's going on. When an outage occurs, you'll scramble to determine which service is responsible, which team to page, and so on. Compare that with a simple stack trace or single-service issue.
* Database transactions: these are difficult to impossible in a microservices architecture. You may be able to design your way out of them, but that's not easy either. With a monolith, just type `BEGIN ... COMMIT`, or however your database library spells it.

It's been said before, but **microservices solve a people problem, not a technical one**. But beware of [Conway's Law](https://en.wikipedia.org/wiki/Conway%27s_law): your architecture will mimic your company structure. Or the reverse -- you'll have to hire and reorg so that your company structure matches the architecture that microservices require: lots of engineers on lots of small teams, with each team managing a couple of microservices.

That doesn't mean microservices are always the wrong choice: they may be necessary in huge engineering organizations. However, if you're working at such a company, you've probably already been using microservices for years. If you're not "Google size", you should think twice before copying their development practices.

What's the alternative? The term "monolith" has a bad rap, but I agree with David at Basecamp that [monoliths can be majestic](https://m.signalvnoise.com/the-majestic-monolith/). Basecamp is a large, monolithic application, and they run it with just a dozen programmers. David is quick to point out that "the Majestic Monolith doesn't pretend to provide a failsafe architectural road to glory". You still have to think, design, and write good code.

Thankfully, people are bouncing back from the cargo culting. Just do a search for ["why not microservices"](https://duckduckgo.com/?t=canonical&q=why+not+microservices&ia=web) and you'll find lots of good articles on the subject. One of the recent ones I've read is from Tailscale: [Modules, monoliths, and microservices](https://tailscale.com/blog/modules-monoliths-and-microservices/).

So what's my advice?

* Unless your company name is Google or Amazon, start with a monolith.
* Once it starts having problems, optimize or refactor the pain points.
* If it's still having issues, buy a bigger server.
* If you have a specific technical reason to split it up, fix that problem.
* If there are still problems, split off only the component that needs splitting off. You'll have two services to deploy and monitor, but that's far simpler than going all-in on microservices.

Okay, so this became more of an anti-microservices rant than I was planning, but so be it.

In terms of counter-examples, Stack Overflow once again comes to mind. They're one of the web's busiest sites, but they have a relatively simple, two-tier [architecture](https://stackexchange.com/performance) that they've scaled vertically -- in other words, big servers with lots of RAM, rather than hundreds of small servers. They have 9 web servers and 4 very chunky SQL servers, with a few additional servers for their tag engine, Redis, Elasticsearch, and HAProxy. This architecture helps them get great performance and the ability to develop with a small team.

My own side business, [GiftyWeddings.com](https://giftyweddings.com/), only gets a small amount of traffic, so it's nothing like Stack Overflow, but it uses a Go HTTP server with SQLite on one of the smallest EC2 instances available, [t2.micro](https://aws.amazon.com/ec2/instance-types/t2/). It costs about $8 per month, and I only have one tiny piece of infrastructure to maintain. I deploy using [Ansible](https://www.ansible.com/) -- a tool that is another good example of simple architecture and boils down to "just use ssh".

Speaking of SQLite, there's a growing number of developers who advocate using SQLite to run their websites. SQLite's ["when to use SQLite"](https://sqlite.org/whentouse.html) page says "any site that gets fewer than 100K hits/day should work fine with SQLite. The 100K hits/day figure is a conservative estimate, not a hard upper bound. SQLite has been demonstrated to work with 10 times that amount of traffic." Here are some other SQLite success stories:

* [Litestream](https://litestream.io/) is an open source tool that provides streaming replication for SQLite. Read author Ben Johnson's article, [Why I Built Litestream](https://litestream.io/blog/why-i-built-litestream/).
* Go developer David Crawshaw has an article about what he calls ["one process programming"](https://crawshaw.io/blog/one-process-programming-notes) (with Go and SQLite), that can be summed up with his phrase "don't use N computers when 1 will do". He also created a [Go SQLite library](https://github.com/crawshaw/sqlite) that supports more SQLite-specific features than the other drivers.
* Peewee ORM author Charles Leifer wrote an article ["Five reasons you should use SQLite in 2016"](https://charlesleifer.com/blog/five-reasons-you-should-use-sqlite-in-2016/) that's still very relevant in 2021. It ends with "I hope you'll give SQLite a try. Don't believe the <abbr title="Fear, uncertainty, and doubt">FUD</abbr> about it not being production-worthy, or not being suitable for use in web-applications."
* Sam Eaton of [Crave Cookie](https://cravecookie.com/) runs a $200,000 per month side business (wow!) using a single server and SQLite. Read his [Indie Hackers interview](https://www.indiehackers.com/podcast/166-sam-eaton-of-crave-cookie).


## Summing up

Companies will do what companies do, and continue to make flashy-looking, bloated websites that "convert" well. Maybe you can have an influence at work, and come home to your better half and say "honey, I shrunk the web". Or maybe you'll just focus on the small web for your personal projects. (Disclaimer: I mostly do the latter -- as part of my day job, I work on [Juju](https://jaas.ai/), which is not a small system by most measures.)

Either way, I believe the "small web" is a compelling term and a compelling aesthetic. Not necessarily in the visual sense, but in the sense that you built it yourself, you understand all of it, and you run it on a single server or static file host.

There are thousands of excellent examples of small websites, and hundreds of ways to create simple architectures -- this essay touches on only a few of the ones I'm passionate about. I'd love to hear your own ideas and stories! Comment over at [Lobsters](https://lobste.rs/s/d6qwff/small_web_is_beautiful) or [Hacker News](https://news.ycombinator.com/item?id=26305585) or [programming Reddit](https://www.reddit.com/r/programming/comments/lvfdq9/the_small_web_is_beautiful/).


{% include sponsor.html %}
