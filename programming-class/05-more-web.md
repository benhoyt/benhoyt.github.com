---
layout: default
title: "Session 5: More About the Web"
permalink: /programming-class/05-more-web/
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">November 2016</p>

> These are my "teaching notes" for the fifth session of my [Computers and Programming Class](/programming-class/).


More on HTML
------------

At the end of last week I kind of rushed you through a few things about HTML for your homework assignment. I was going to use this lesson to talk about *software*, but I think the web is important enough that I want to flesh out HTML a bit more. We'll get to software next time.

"HTML" stands for HyperText Markup Language, and "hypertext" basically means you can link from one document to another. I think most of you had links from your page to other pages in your homework, which is great -- *linking* is probably the oldest and most important feature of the web.

Let's break apart an HTML tag:

    <a href="http://example.com/" title="Click here!">
        Link to Example Page
    </a>

* `<a...>`: opening tag for the "anchor tag"
* `href="..."` and `title="value"` are attributes (name="value"); these tell the tag how to behave
  - the `href` value (required) tells the browser where to go if you click on this link
  - the `title` value (optional) makes the browser show that text when you hover over the tag with your mouse
* `</a>` is the closing tag
* "Link to Example Page" is the text between the opening tag and the closing tag, and it's what the link actually says

Even if HTML only had text and links (`<a>` tags), the web would still be an amazing resource. Just think, Wikipedia is actually quite a simple website -- mostly just text and links (and some images). It's the *content* that's really important and valuable. A programmer could make a really basic version of the Wikipedia software in a week or two -- but adding all that information, that's what's unique about a website like Wikipedia.

In fact, back in the early days the web was basically just text and links. The `<img>` tag (for images) was only added later. And then came fancier things like fonts, colors, styles, margins, mobile phone layouts, and all of that great stuff.

However, I would argue that the content and links are the most important part of a web page. If a web page looks elegant and amazing, but doesn't say anything of interest, no one's going to read it.

A few other common tags:

* `<h1>Main heading</h1>`
* `<h2>Smaller heading</h2>` and `<h3>Even smaller heading</h3>`
* `<p>This is a paragraph.</p>`
* `<b>bold</b>`
* `<i>italic</i>`


Dynamic content
---------------

"Static content" is when you have a website that doesn't really change. It's just a bunch of web pages that sit in a folder on the server's hard drive, and the web server serve them up again and again when people browse to the website.

"Dynamic content" is when the web server changes the content it serves you based on various inputs -- for example, it might serve a different page on weekends or if it's a web store and there's a sale on. Or it might serve a "please sign up" page if you're not signed in, and a "dashboard just for you" if you are signed in.

Was the homework you guys did a static web page or a dynamic one? What are some other examples of static web pages and dynamic web page?

Dynamic content is where the web really gets powerful. Just think of when you're browsing Netflix -- it shows different videos to different people, depending on what they've watched and enjoyed in the past. Or Facebook -- it's very dynamic -- it changes all the time as people post.

With a dynamic server, the web server is still serving you HTML at the end of the day, but instead of just *files* behind that HTML, there's a computer program that is working off HTML *templates*, and it grabs the dynamic data and inserts it into the correct places in the template.

Where do you think the data for a dynamic website comes from? (Database. What is a database?)

Here's an example of a dynamic web template:

```
<h1>Netflix: Recommend movies</h1>

<p>Hi ${user.name}, here are some movies we think you'll love:</p>

<ul>
$ for movie in recommended_movies
  <li>
    <a href="/play-movie/${movie.id}">${movie.name}</a>,
    directed by ${movie.director.name}
  </li>
$ end for
</ul>

<footer>It's ${current_time} o'clock.</footer>
```


JavaScript
----------

A very important tool that makes web pages even more dynamic ("interactive") is JavaScript. Anyone heard of JavaScript? What is it?

Yeah, it's a full-blown programming language that sits inside your web browser and can interact with the user and the web page. The original web didn't have JavaScript, and to interact with a dynamic website, you'd have to click a link on the page. That would again talk to the web server, and serve you up some new HTML, and you could read that page and click more links. It was powerful, but a bit too simplistic for a lot of interactive "web applications".

Think of Facebook, when you're messaging someone from within Facebook: you're not clicking links and getting brand new HTML pages from the server all the time -- you type, press enter, and your message is immediately sent, using JavaScript, to the other person. As soon as they send a reply, JavaScript is constantly waiting for messages for you and it'll show them on your screen. All up, Facebook is a very complex web application with a lot of JavaScript.

What's a very simple example of JavaScript on a web page? Here's one: it's a page with just a heading, but when you hover over the heading with your mouse, it'll change the heading text to "You can't catch me!"

```
<h1 onmouseover="this.innerHTML = 'You can\'t catch me!'">
  Gingerbread Man
</h1>
```

Or what about this one?

```
<h1 onmouseover="this.innerHTML = parseInt(this.innerHTML) + 1;">
  0
</h1>

<script>
  setTimeout(function() { alert('GAME OVER!'); }, 10000);
</script>
```

What do you think is happening here? Let's break it apart -- what's going on?

(It might be the world's simplest web page: see how high you can get it to count in one minute.)


Homework
--------

Find real examples of three static websites and three dynamic websites. For each static website, write one sentence why you believe the website is purely static, unchanging HTML. For the dynamic websites, write one sentence on why the website is dynamic and where you think the data is coming from.

This is a best-guess kind of thing: there's actually no 100% fool-proof way to determine whether a website is static or dynamic just from looking at it -- you have to know what the web server is doing. But you can make some good guesses.
