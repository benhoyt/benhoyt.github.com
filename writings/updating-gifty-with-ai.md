---
layout: default
title: "Updating a side project with AI in 275 commits"
permalink: /writings/updating-gifty-with-ai/
description: "I used an AI agent to make a big update to my GiftyWeddings.com website, taking it from a gift registry to a full website builder in 275 commits."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">August 2026</p>


Recently [my employer](https://canonical.com/) had its mid-year break, where everyone gets two weeks off at roughly the same time. As a manager, I'd been using AI tools mostly for code review and technical exploration, rather than coding proper, and I wanted to change that.

So I spent my time off hacking on my side project, [Gifty Weddings](https://giftyweddings.com/). I'd previously moved it to a [Go backend in 2016](https://benhoyt.com/writings/gifty/) and an [Elm frontend in 2019](https://benhoyt.com/writings/learning-elm/). But now I had two goals:

1. Upgrade it from just a wedding gift registry to a wedding website builder.
2. Learn how to write high-quality code with AI tools.

At my coworkers' recommendation, I used Claude Code with Opus 5 for most of the coding. For smaller tasks, I used [Pi](https://pi.dev/) with the open-weight GLM 5.2 model. I also used my brain.

I jest, but I do think *using one's brain* is a big part of what separates churning out slop from building a product you can be proud of. We're still engineers.

In this article I'll talk about my skepticism of AI, but also what I think contributed to the success of this project, and why I had fun doing it.


## My skepticism

I've been quite skeptical about AI for a while, first in the early days when an AI chatbot [fell in love](https://www.nytimes.com/2023/02/16/technology/bing-chatbot-microsoft-chatgpt.html) with a New York Times journalist, then even more when I started having to deal with tons of AI slop being served up by "contributors".

I had tried it for coding back in 2024 and was not impressed. At that point, I spent more time fixing up what it did than I would have spent doing it myself.

More recently, I gave it another try to build my wife's [interior design website](https://goldberryinteriors.com/) in basically one shot, and then to fix various bugs in [GoAWK](https://github.com/benhoyt/goawk) (including one where Opus 4.6 was [rather indecisive](https://benhoyt.com/writings/indecisive-ai-agent/)).

Both of those times, I was impressed: in the website case, because I don't love writing CSS, and in the bug-fixing case, because it really sped up the process and gave me good ideas.


## My approach

I'm starting with the fact that I'm a **fairly experienced web developer**. This means I can guide the process and review the agent's output effectively. As a side note, one of my biggest concerns with AI is that new developers will be tempted to shortcut this hard-won experience.

I was also **building on a foundation** of existing work. I started with the CSS stylesheet from my old site (which in turn is based on [Skeleton](http://getskeleton.com/)), most of an SQL database schema, and a plan of what I wanted to build. In addition, I wrote the initial Go server and several packages by hand, based heavily on the old Gifty codebase. I seeded it with the kind of code I wanted.

From there I switched to **iterative development**, rather than trying to do it in one shot: I had technical and creative control at every stage. For each code change, I would suggest the feature -- usually with a prompt of a few sentences -- and then review the code output as well as test the feature in my browser.

I did a **moderate level of code review**. I had to give up some of my *code craftsmanship* -- its code style wasn't perfect, or at least not how I'd have done it in many cases. I'd point out bugs, of course, and challenge structural issues, but for the most part I was pretty happy with the code it wrote.

However, I **didn't thoroughly review the tests**. AI agents seem to write a *lot* of tests -- sometimes way too many, and I deleted several I didn't think paid for themselves. At first I'd review some of the details, but by the end I was skimming tests pretty lightly.

I learned a number of things along the way:

* LLMs write really verbose comments. I had to continually tell it to be succinct or write one-line summaries. In one "tersify comments" commit, I reduced about 2500 comment lines to 1500.
* Claude's ability to write HTML and CSS got a lot better when I asked it to install a headless browser and take its own screenshots. Before that I'd have to take screenshots and upload them manually. Now it had superpowers: it started the server, added fake data using the app's real forms, then used Chromium to save PNG screenshots and "looked" at them.
* That said, taking and processing screenshots on every change used a lot of tokens. I ended up asking it to do that only when making significant frontend changes.
* Even sandboxed in a container (I use Canonical's [Workshop](https://ubuntu.com/workshop)), Claude does annoying stuff. Several times it ran a program like `rm -rf $SOMEVAR/*.png`, but `SOMEVAR` wasn't set and it deleted the test photos I was using. I added some rules to its memory to try to get it to stop -- but yes, always run LLMs in a container or VM.
* Don't do all your work in one session. I started this way, but the context got really long, and I soon exceeded Claude Pro's various limits. So I learned about [compaction](https://earendil.com/posts/compaction-in-pi/) and started new sessions regularly.

Now let's look at the features I built.


## Features

Gifty allows a couple to create a simple, multi-page wedding website with photos, text, and a gift registry. (Old Gifty only supported the registry part.)

<img class="screenshot" alt="A sample Gifty website" src="/images/giftyweb.jpg">

Couples can write text in Markdown sections, upload photos (they're downsized and [stored on Tigris](https://benhoyt.com/writings/flyio-and-tigris/)), add and reorder pages, and so on. And of course I charge a little something; payments are handled using Stripe.

Guests can view a couple's website and cross off gifts on the couple's registry.

But my favourite feature, copied from old Gifty: couples can **try it out with a single click**.


## Tech stack

I love keeping things simple, so I used the following tech:

* A Go backend with as few non-stdlib dependencies as possible: the AWS SDK for uploads, the Stripe SDK, an image-resizing library, a Markdown renderer, the `modernc.org/sqlite` module, and the "almost stdlib" `golang.org/x/crypto` module.
* The wonderful SQLite database.
* [Htmx](https://htmx.org/) for the more dynamic parts: the gift registry and the page editing support.
* And a few lines of vanilla JavaScript where it made sense.

It's hosted on [Fly.io](https://fly.io/), a service I highly recommend for this kind of thing: `fly deploy` makes it so easy, and it's inexpensive.


## Colour me grateful

Finishing the new website took about 10 full days. I'm very thankful for AI tools, particularly Claude in this case. I said to my wife it probably would have taken me about **three times as long** without AI.

One of the things that impressed me most was Claude porting the old gift registry system, a Go JSON API with an Elm frontend, to the new version -- Go HTML endpoints with a quite different htmx frontend. It did this almost perfectly in one shot, which was a pleasant surprise for me and a big time-saver.

One other thing it did in basically one shot (with a few follow-up bug fixes) was produce a migration tool, to migrate the old Gifty database to the new. It's not rocket science, as the databases are similar, but there are a few structural differences, and I expected this to take more iterations.

But why, given my overall AI skepticism, did I enjoy it so much? I think there are two reasons:

First, I like building things. I had a useful and nice-looking website finished in about 10 days.

Second, I enjoy the craft of programming, and I still felt I was getting that. I would think of the next feature, ask AI to code it, review the code, fix bugs, and commit it. Rinse and repeat 275 times. Smaller features would take 10-15 minutes, larger ones an hour or two, but it felt great to be making constant progress towards the goal.

I still have plenty of concerns, and I hope we don't use them to build a [tower to reach heaven](https://lucumr.pocoo.org/2026/7/13/the-tower-keeps-rising/) so God has to take us down a peg or two. But I'm grateful for the new tools.

One last thing: if you're getting married soon or know someone who is, I'd love it if you pointed them to the new [GiftyWeddings.com](https://giftyweddings.com/). If you want to get married but don't have anyone yet -- sorry, but that's another website!
