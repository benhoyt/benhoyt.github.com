---
layout: default
title: "cdnupload: A multi-licensing experiment"
permalink: /writings/cdnupload/
---
<h1><a href="/writings/cdnupload/">{{ page.title }}</a></h1>
<p class="subtitle">April 2017</p>


<a href="https://cdnupload.com/"><img src="/images/cdnupload-logo.png" style="width: 130px; height: 130px; float: right; margin: 0 0 20px 20px;" title="cdnupload's incredible logo"></a>


I dabble in open source [projects](/projects/) and also run a [small website](https://giftyweddings.com/) that makes me a few dollars, but this is the first time I've tried to combine the two. Inspired by [Sidekiq's story](https://www.indiehackers.com/businesses/sidekiq) on Indie Hackers, I decided to try a similar multi-licensing model for my next project.

**[Enter cdnupload.](https://cdnupload.com/)**


Open and multi-licensed
-----------------------

I'd heard of the [multi-licensing](https://en.wikipedia.org/wiki/Multi-licensing) model before (MySQL), but Sidekiq was the first time I'd seen it used positively. I mean, here's a guy who's been working on a complex, well-tested, and useful system for several years -- why wouldn't some companies pay him for it?

cdnupload is just a command-line tool and Python library, so it's much less complex than Sidekiq. But I figured it was worth a shot. cdnupload was useful to me for [GiftyWeddings.com](https://giftyweddings.com/), so hopefully it'll be useful to a few other companies as well.

I've gone with two basic licenses: you can use cdnupload for free under an AGPL license if your website is open source or you're a non-profit, and you can use it under a well-priced commercial license otherwise. There are two tiers of commercial license, and both come with email support: [$65](https://cdnupload.com/single) for single website use, and [$295](https://cdnupload.com/multi) for a 10-website license.

This model can be summarized with, "If you’re a business making a profit, I am too." Open source is good; open source *and* developers being financially encouraged to work on their projects is even better.

What's to stop people just using it straight off GitHub or PyPI? Nothing technical. But as I say on the project's home page:

> “Can’t I just download it straight from GitHub or PyPI?” Sure you can. But you’ll be depriving <del>my kids of bread and water</del> me and my wife of dinner dates. And more importantly, I won’t be able to fix bugs or add features as quickly, and you won’t get commercial support.


What is cdnupload?
------------------

So what does cdnupload do? It's a command-line tool that uploads your web application's static files to a CDN (actually to the CDN's origin server), and includes content-based hashes in the filenames to allow good caching while avoiding versioning issues.

This allows you to set an essentially infinite `max-age` value for your CDN's `Cache-Control` header, because every time the content of your CSS, JavaScript, or images change, you'll be fetching a new URL.

Because it's a hash based on file content rather than a file version or commit version, files are only uploaded when they've changed. This helps keep deployments fast, especially when you're uploading to a remote origin like Amazon S3.

Out of the box, cdnupload supports uploading to a directory or to Amazon S3, and custom destinations are relatively easy to add by writing a Python class and overriding a few methods.

In addition to uploading files during your deployment, you also need to configure your web server to include the hashes in the filenames. There are a couple of different ways to do this, so just see the [documentation](https://cdnupload.com/docs) for more info.


Thanks for your support
-----------------------

So if you want your static files to load fast for your current (or upcoming) web app, please consider cdnupload. You'll be supporting a good tool and an indie hacker!

**[Learn more at cdnupload.com.](https://cdnupload.com/)**
