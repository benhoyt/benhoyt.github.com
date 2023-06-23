---
layout: default
title: "Designing Pythonic library APIs"
permalink: /writings/python-api-design/
description: "Principles I've found useful for designing good Python library APIs, including structure, naming, error handling, and type annotations."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">June 2023</p>


> Summary: This article describes some principles I've found useful for designing good Python library APIs, including structure, naming, error handling, type annotations, and more. It's a written version of a talk I gave in June 2023 at the Christchurch Python meetup.
>
> **Go to:** [Pythonic](#what-does-pythonic-mean) \| [Structure](#module-and-package-structure) \| [Globals](#avoid-global-configuration-and-state) \| [Naming](#naming) \| [Errors](#errors-and-exceptions) \| [Versions](#versioning-and-backwards-compatibility) \| [Types](#type-annotations) \| [Expressiveness](#pythons-expressiveness-be-careful)
>
> Or just skip to the [takeaways](#takeaways).


Let's start with some code. What do you think this snippet does?

```python
manager = urllib.request.HTTPPasswordMgrWithDefaultRealm()
manager.add_password(None, 'https://httpbin.org/', 'usr', 'pwd')
handler = urllib.request.HTTPBasicAuthHandler(manager)
opener = urllib.request.build_opener(handler)
response = opener.open('https://httpbin.org/basic-auth/usr/pwd')
print(response.status)
```

As you probably figured out, it makes an HTTP request to an httpbin.org URL with a username and password.

But is `urllib.request` a good API?

No, it's terrible! You have to learn about "managers" and "handlers" and "openers". There are two ultra-long names, `HTTPPasswordMgrWithDefaultRealm` (what a mouthful!) and `HTTPBasicAuthHandler`.

This kind of code is why the [Requests](https://docs.python-requests.org/en/latest/index.html) library was born, back in 2011. In fact, if you've looked at the Requests documentation, you probably know that this example is taken from the comparison linked at the top of their docs (updated based on an [official how-to](https://docs.python.org/3/howto/urllib2.html#id5)).

Here's how you'd make that same HTTP call with the Requests API:

```python
response = requests.get('https://httpbin.org/basic-auth/usr/pwd',
                        auth=('usr', 'pwd'))
print(response.status_code)
```

Now that's a nice API.

The standard library version requires boilerplate, multiple layers of Java-like classes, and five lines of code. The Requests version is one simple function call with an `auth` argument.

There's a slightly simpler way to do it with the standard library, but you have to *bypass* `urllib.request`'s Basic Authentication API and add the `Authorization` header yourself:

```python
request = urllib.request.Request('https://httpbin.org/basic-auth/usr/pwd')
encoded_auth = base64.b64encode(username.encode() + b':' + password.encode())
request.add_header('Authorization', b'Basic ' + encoded_auth)
response = urllib.request.urlopen(request)
print(response.status)
```

Something is wrong when the low-level API is easier to use than the high-level API that's supposedly built for the exact task at hand.

An easy-to-use API is what sold Requests back in 2011, and that's what continues to sell it today. I'll be using Requests as an example several times in this article, almost always in a positive way. Python's built-in HTTP handling has gotten a little better, but not much.

I'll include several "takeaways" in this article, but this is the overall theme:

**Takeaway: Good API design is very important to users.**

Requests didn't start perfect and complete right away. I dug back to the first commits in the Requests git repository, and the [first real commit](https://github.com/psf/requests/commit/d8b19573f38aa84db95a7e4d1f1c0a2fa26517eb) is as follows (formatting modified slightly):

```python
import urllib2

class Request(object):
    """The :class:`Request` object. It's awesome."""

class Response(object):
    """The :class:`Request` object. It's awesome."""

class AuthObject(object):
    """The :class:`AuthObject` is a simple HTTP Authentication token. ..."""
    def __init__(self, username, password):
        self.username = username
        self.password = password

def get():    pass
def post():   pass
def put():    pass
def delete(): pass
```

The author, Kenneth Reitz, clearly had a lot of implementing to do. But you can see the outline of the basic API already in place: the `Request` and `Response` objects, and the simple HTTP method functions.

In a flurry of commits over the course of the next few weeks, he implemented the first version of the library and refined the API.

**Takeaway: When creating a library, start with a good base and iterate.**

In this article, we're going to look at several principles for making well-designed library APIs in Python. But first, let's briefly discuss what we mean by a *Pythonic* API.


## What does "Pythonic" mean?

That's a tricky one, because people mean different things by the word. What I mean by "Pythonic" are the ways of designing functions and classes that have become fairly standard among Python developers.

Following the official [Python Style Guide (PEP 8)](https://peps.python.org/pep-0008/) is a good start. It covers code formatting, import syntax, commenting, naming things, and various programming recommendations. I think everyone who writes Python should read it and follow it. Definitely people who write libraries should.

Then there's ["The Zen of Python"](https://peps.python.org/pep-0020/). This is a somewhat humorous, Zen-like set of sentences about what good Python should be like. However, just like Zen Buddhism, it contains a number of paradoxes (even contradictions).

Here's the first few sentences of the Zen of Python:

<p style="margin-left: 2em">Beautiful is better than ugly.<br>
<b>Explicit is better than implicit.</b><br>
Simple is better than complex.<br>
Complex is better than complicated.<br>
<b>Flat is better than nested.</b><br>
Sparse is better than dense.<br>
Readability counts.</p>

All of these are important, but I've made bold two that I think are particularly important for designing good library APIs.

The other thing about "Pythonic" is that's it's *Python*. That should be obvious, but you'd be surprised at the number of people that come from (say) Java and keep writing Java-ish code even when they've got Python at their disposal.

In Python we like to keep things simple. We also have many more tools at our disposal to create nice APIs, such as keyword arguments (more on them later).

**Takeaway: Try to follow PEP 8 and grok PEP 20. This is the way.**

Before we go further, let's take a quick look at the Python standard library: is it Pythonic?

It's a funny question, because you'd think what's built in to Python would be the most Pythonic of all. But not all of it is that great!

The Python standard library was designed over several decades, by many different people, and as such, it has a number of things in it that probably wouldn't be considered Pythonic today.

Here are some examples of poor APIs in the standard library:

* The [email](https://docs.python.org/3/library/email.html) package, for example [`email.mime.multipart.MIMEMultipart`](https://docs.python.org/3/library/email.mime.html#email.mime.multipart.MIMEMultipart). The Zen of Python just told us that "flat is better than nested", but this name has four levels of nesting! Why not `email.MultipartMessage`, or even just `email.Multipart`?
* [`threading.Thread`](https://docs.python.org/3/library/threading.html#threading.Thread) is a personal bugbear of mine: the first parameter to the `Thread` class, `group`, is unused. The docs say that it's "reserved for future extension" ... but it's been reserved [for 26 years](https://github.com/python/cpython/commit/7f5013a9a9678e86bff00c97f98e7a92c515b94d#diff-d1c5cf336d96c5218c47d110f306277ec598127d8d038550c9ec8cdf45db8bd2R503)!
* [`unittest`](https://docs.python.org/3/library/unittest.html): not a huge deal, but this is a good example of naming that contradicts PEP 8, where functions would be named (for example) `assert_equal` instead of `assertEqual`. In addition, `unittest` requires you to learn a whole new set of functions, instead of just saying `assert a == b` ([pytest](https://docs.pytest.org/) simplifies this).
* [`urllib.request`](https://docs.python.org/3/library/urllib.request.html): we've already seen how unbeautiful this one is.

On the other hand, there are many well-designed modules too:

* [`collections`](https://docs.python.org/3/library/collections.html): these classes are really nice to use. Two of my favourite tools in the standard library are [`defaultdict`](https://docs.python.org/3/library/collections.html#collections.defaultdict) and [`Counter`](https://docs.python.org/3/library/collections.html#collections.Counter).
* [`csv`](https://docs.python.org/3/library/csv.html): does what it says on the tin, and is easy to use. If you haven't tried [`DictReader`](https://docs.python.org/3/library/csv.html#csv.DictReader) before, check it out!
* [`datetime`](https://docs.python.org/3/library/datetime.html): definitely not perfect (is any time library?), but overall this has a set of pretty nice types with some good use of operator overloading.
* [`json`](https://docs.python.org/3/library/json.html): very straight-forward to use, with [`dump`](https://docs.python.org/3/library/json.html#json.dump) and [`load`](https://docs.python.org/3/library/json.html#json.load) doing most of what you need, and a bunch of keyword arguments when you need to configure them.
* And many more...

**Takeaway: The standard library isn't always the best example to follow.**


## Module and package structure

First, some Python terminology:

* Module: a single `.py` file that exposes an API (functions, classes, and so on)
* Package: a bunch of modules in a directory, along with an `__init__.py`

So how should you structure your files, modules, and packages?

Let's come back to Requests. Everyone who uses Requests just types `import requests` and then uses `requests.get()` or `requests.Session` and the like. The `get()` function is actually implemented in `api.py`, and `Session` is implemented in `sessions.py`, but you don't need to know that or import the submodules.

Here's how that's achieved:

```python
# requests/__init__.py
from .api import delete, get, post, put, ...
from .sessions import Session

# requests/api.py
def get(url, params=None, **kwargs):
    return request("get", url, params=params, **kwargs)

# requests/sessions.py
class Session:
    ...
```

I recommend always starting with a single `.py` file: it's simple and easy-to-navigate. There are even some medium-sized libraries done this way, for example the web framework [Bottle](https://bottlepy.org/docs/dev/) is famously implemented in a [single `bottle.py` file](https://github.com/bottlepy/bottle/blob/master/bottle.py).

Let's say you're designing a fish ’n’ chips ordering library. (We'll be using this example a lot -- that's why this article has *takeaways*!) You code up the first version in a single file:

```python
# fishnchips.py (library code)
class Shop:
    ...

def order(chips=None, fish=None):
    ...

# app.py (user code)
import fishnchips
fishnchips.order(chips=1, fish=2)
```

There's a `Shop` class (presumably with a bunch of methods) and a top-level `order` function. Users will just `import fishnchips` and then use `fishnchips.order()`, as shown in `app.py`.

But what if your library starts getting very large, and you want to split up the implementation into multiple files? You change to a package (a directory with an `__init__.py`), like this:

```python
# fishnchips/__init__.py
from .api import order
from .shop import Shop

# fishnchips/api.py
def order(chips=None, fish=None):
    ...

# fishnchips/shop.py
class Shop:
    ...
```

Now your library has three files, but because we're importing the relevant items to the top level in `__init__.py`, users can still say `import fishnchips` and use `fishnchips.order()` as before.

They don't have to `import fishnchips.api` or `import fishnchips.shop`. Your new version is fully backwards-compatible with the old, single-file implementation. You've completely changed the layout of the code, but the API hasn't changed!

**Takeaway: Expose a clean API; file structure is an implementation detail.**

Another aspect of package design is nesting. We already talked about `email.mime.multipart.MIMEMultipart`. A lot of Django APIs have the same issue. Here's one example, picked from the Django docs more or less at random:

```python
from django.core.files import File
from django.core.files.images import ImageFile

file = File(f)
image = ImageFile(f)
```

The `ImageFile` import shown here is four levels of import deep! Django dot core dot files dot images dot ImageFile.

So I thought, maybe there are several different kinds of `ImageFile` in Django, and they want to keep them all straight using deep namespaces. But no -- I grepped the Django source, and there's only the one. Same with `File`. So the four or five levels of namespace is completely unnecessary; `django.ImageFile` would have been fine.

I realise Django is a huge library with many components, so maybe two levels of nesting is reasonable, but surely not four or five. The late Aaron Swartz made a similar point about Django in his 2005 blog post, ["Rewriting Reddit"](http://www.aaronsw.com/weblog/rewritingreddit) -- see the paragraph that starts with "Another Django goal".

Recently in a library I maintain for work, we made a [change](https://github.com/canonical/operator/pull/910) to pull all the items defined in submodules up to the top level in `__init__.py`, making the class names significantly easier to discover. Instead of users having to guess, "Hmm, was `ActiveStatus` in the `ops.charm` or `ops.model` submodule?", we now recommend simply using `import ops` and then `ops.ActiveStatus`. All the classes users need are right there.

**Takeaway: Flat is better than nested.**

Now here's a question for you: which do you think is better, this code:

```python
from fishnchips import order

...

def eat_takeaways():
    meal = order(chips=1)
    ingest(meal)

def ingest(meal):
    ...
```

Or this code? I'll wait for you to spot the difference.

```python
import fishnchips

...

def eat_takeaways():
    meal = fishnchips.order(chips=1)
    ingest(meal)

def ingest(meal):
    ...
```

I highly recommend designing your library to be used like the second example.

With the first version, when `order()` is called, you can't tell where it's ordering from. Is it McDonald's, or fish ’n’ chips? Is `order` a function defined in this file, or did I import it?

With the second version, you can immediately see that you're ordering using the `fishnchips` module, without having to scroll to the top of the file to see where it was imported.

You do have to put some thought into your module design to make it usable this way. For example, don't name the function `order_fishnchips`, because `fishnchips` is already in the module name. You don't want people to have to say `fishnchips.order_fishnchips()`, as that's redundant.

We can see Requests was designed this way too: `requests.get()` reads nicely and makes sense. You're not meant to do `from requests import get`, because `get()` without the context of the module name doesn't have enough meaning.

**Takeaway: Design your library to be used as `import lib ... lib.Thing()` rather than `from lib import LibThing ... LibThing()`.**


## Avoid global configuration and state

First up, what do I mean by global configuration?

Let's say your `fishnchips` library places an order using a web API. Well, you'll want a timeout. But what should the default timeout be? You go ahead and add a "constant":

```python
# fishnchips.py
DEFAULT_TIMEOUT = 10

def order(..., timeout=None):
    if timeout is None:
        timeout = DEFAULT_TIMEOUT
    ...
```

Whenever someone calls `order()` without a timeout, they'll get the default timeout of 10 seconds.

But what if you're on a team, and someone else is using the `fishnchips` module in the program too, and this person lives right next to the fish ’n’ chip shop, so they set `fishnchips.DEFAULT_TIMEOUT = 1`. Then all of your calls to `order()` will have that same low default, which isn't what you expected.

Instead of exposing global configuration like `DEFAULT_TIMEOUT`, mark that private, like `_default_timeout`, to clearly indicate it shouldn't be used outside the module. Or just use a keyword argument with a constant so they can't change it at all:

```python
def order(..., timeout=10):
    ...
```

If someone wants to make an order with a different timeout, they can just call `order(..., timeout=1)` explicitly or wrap it in their own function. You can also use [`functools.partial`](https://docs.python.org/3/library/functools.html#functools.partial) for this kind of thing, to "freeze" specific arguments:

```python
import functools

order_fast = functools.partial(fishnchips.order, timeout=1)

# calls fishnchips.order with supplied arguments, and timeout=1
order_fast(...)
```

Then the other person using `fishnchips.order` will still get the timeout they expect. The `functools.partial` approach is basically equivalent to the following, but it avoids the noisy `*args` and `**kwargs`:

```python
def order_fast(*args, **kwargs):
    return fishnchips.order(*args, **kwargs, timeout=1)
```

**Takeaway: Avoid global configuration; use good defaults and let the user override them.**

Another thing to avoid is global state, where your library stores a bunch of stuff in module-level variables in an attempt to make the library easy to use.

For example, say you're creating a URL routing library, `routa`, with an `add()` function that adds a URL route:

```python
# routa.py
_urls = []

def add(pattern, func):
    _urls.append((pattern, func))

def match(url):
    ...

# app.py
routa.add('/', home_page)
routa.add('/contact', contact_page)
```

This is all very nice when the user only needs one router, but what if all of a sudden they need two, one for the HTML pages and one for the JSON API? The `add()` calls will stomp on each other, because there's only a single `_urls` list.

So how do we fix this? The sensible way is to add a `Router` class.

```python
# routa.py
class Router:
    def __init__(self):
        self._urls = []

    def add(self, pattern, func):
        self._urls.append((pattern, func))

    def match(self, url):
        ...

# app.py
router = routa.Router()
router.add('/', home_page)
router.add('/contact', contact_page)
```

It's a few more lines of code in the library, and it's only a single line of code more in the user's app. But it makes the library much more usable, and users can have as many routers as they want without them stomping on each other.

There's a really interesting talk by Jack Diederich called ["Stop Writing Classes"](https://www.youtube.com/watch?v=o9pEzgHorH0). One of his points is that classes in Python are often unnecessary boilerplate -- especially if they're classes with only two methods, one of which is `__init__`!

However, when your library needs state to remember things between function calls, a class is usually the right tool for the job. Consider Requests again, with the following example:

```python
session = requests.Session()
session.auth = ('usr', 'pwd')
session.headers = {'User-Agent': 'mylib/1.0'}

session.get('https://example.com/foo')
session.get('https://example.com/bar')
```

The code doesn't use `requests.get()` directly, but first creates a `requests.Session`. There are two advantages to that:

1. You can attach custom authentication or custom headers to every request. That's handy, though if it were just that, you could do it with `functools.partial` or a wrapper function.
2. The Session will reuse TCP connections, significantly speeding up multiple requests to the same domain.

With TLS (`https://` URLs) -- which is almost everything these days -- this can be really significant. I did this for requests from New Zealand to England a while ago, and it sped up subsequent requests from 1 second each to about 0.3 seconds each, because Requests didn't have to set up the TLS connection each time.

**Takeaway: Avoid global state; use a class instead.**


## Naming

We've talked a little bit about naming already, but naming is hard!

When naming variables, sometimes people use names that are too short. However, when naming API functions, I find people usually use names that are too long.

As we've seen, a name in an API already has the context of the module name as a prefix. Let's look at an example.

Imagine if Bob Just-Out-Of-Uni was designing Requests, and one of his lecturers had said "name a function to explain what it does". He heard, "name a function to explain everything it does", and wrote this:

```python
# requests.py
def send_get_request_and_receive_response():
    ...
```

What's wrong with that? Well, the extra words don't add anything. In fact, they take away clarity: `requests.get()` is easy to see and read, whereas with the longer name the important part, the fact that it's a "get" method, is hidden in the middle of the name.

The word "request" appears twice, once in the module name and once in the function name. And then there's "send" and "receive response". But the entire point of the library is to send requests and receive responses, so that's unnecessary too.

You're left with the short and sweet `requests.get` – perform a GET request – clear and succinct. You can't get any shorter than that. I mean, you could make it `requests.g` -- but that's just silly.

Remember our `fishnchips` library: we could have called the `order` function `order_food` or `order_meal` but this is the fish ’n’ chips library – of course it's food for a meal. So just `fishnchips.order` is plenty.

**Takeaway: Names should be as short as they can be while still being clear.**

Now for a little rabbit trail: you've probably heard that function names should be verbs, because they *do* something, like `get` and `post` (those are HTTP verbs or *methods*). Property and class names should be nouns, because they're things, like `Session` and `Response`. And that's a good rule of thumb.

But sometimes it's tricky. Is "shop" a noun or a verb? What about "order"?

That's right -- they're both! A lot of short words in English are both verbs and nouns, so just like when speaking, you have to tell from the context.

However, in Python, we can also use capitalisation to add meaning: if we had a `shop` function, it would have a lowercase `s`. And if we had an `Order` class, it would have an uppercase `O`. Which is kind of a nice way to distinguish that comes straight from PEP 8.

**Takeaway: Function names should be verbs and classes nouns, but don't get hung up on this.**

Let's talk about privacy for a bit.

In Python, names that start with an underscore, like `_private`, are private by convention. Users can still access them, but they're saying, "I know this is a bad idea, but I'm going to access `_private` anyway." When you're writing a library, it's fair game to change or remove `_private` in a new version, even if the new version is supposed to be backwards-compatible. If a user is accessing `_private`, they're on their own.

Don't bother about making things "extra private" with a double-underscore prefix, like `__extra_private`. Python does a very simple form of name-mangling when you do this, but it tends to cause more issues than it fixes, and people who want to can easily work around it, so it's still not really private. A single underscore is plenty.

Using double underscores for your private parts is also *confusing*: it looks like a magic method, but it's not (all Python magic methods have double underscores, like `__init__`).

**Takeaway: Being `_private` is fine; `__extra_privacy` is unnecessary.**


## Errors and exceptions

In Python, errors should almost always be raised as exceptions.

To start with, there's a large [built-in exception hierarchy](https://docs.python.org/3/library/exceptions.html#exception-hierarchy) that you can use for core programming errors like `TypeError` or `ValueError`. For example, we could add some range checking to our `fishnchips.order` function:

```python
def order(chips=None, fish=None):
    if chips is None and fish is None:
        raise ValueError('nothing to order!')
    if chips <= 0:
        raise ValueError('"chips" must be greater than zero')
    if fish <= 0:
        raise ValueError('"fish" must be greater than zero')
    ...
```

Using `ValueError` is fine here -- there's no *value* in defining a custom exception type.

If you're creating something that maps very well to standard operations, like a filesystem library, you might want to reuse [`OSError` subclasses](https://docs.python.org/3/library/exceptions.html#os-exceptions) like [`FileNotFoundError`](https://docs.python.org/3/library/exceptions.html#FileNotFoundError) or [`PermissionError`](https://docs.python.org/3/library/exceptions.html#PermissionError).

However, when you're building a new library, it's usually best to create a custom class for all of your library's exceptions, and raise meaningful subclasses of this. Your base class should inherit from `Exception`. For example, in our fish ’n’ chips library, you might do:

```python
class Error(Exception):
    """Base class for all of this library's exceptions."""

class NetworkError(Error):
    """Low-level networking error."""

class APIError(Error):
    """Error talking to the shop's API."""
```

This makes it easy for users of the library to catch any exception it can raise. For example, if your library can raise [`ssl.SSLError`](https://docs.python.org/3/library/ssl.html#ssl.SSLError) when it's calling an HTTP API, it's probably best to catch that and re-raise as `fishnchips.NetworkError`.

You can even make your exceptions inherit from your exception base class *and* a standard library exception. For example, Requests has an [exception hierarchy](https://requests.readthedocs.io/en/latest/user/quickstart/#errors-and-exceptions) where exceptions like [`InvalidURL`](https://github.com/psf/requests/blob/6e5b15d542a4e85945fd72066bb6cecbc3a82191/requests/exceptions.py#L97) inherit from both the `RequestException` base class and the built-in `ValueError`:

```python
class InvalidURL(RequestException, ValueError):
    """The URL provided was somehow invalid."""
```

The other good reason to create custom exceptions is to provide additional information. For example, you might add an `OrderError` which provides information from the HTTP 4xx response:

```python
class OrderError(Error):
    def __init__(self, code, chef_name, message):
        self.code = code
        self.chef_name = chef_name
        self.message = message

def order(chips=None, fish=None):
    quantities = {'chips': chips, 'fish': fish}
    try:
        response = requests.post(_shop_url, json=quantities)
    except requests.RequestException as e:
        raise NetworkError(f'Network error: {e}')
    if 500 <= response.status_code <= 599:
        raise APIError(f'API Error {response.status_code}: {response.text}')
    if 400 <= response.status_code <= 499:
        data = response.json()
        raise OrderError(
            code=response.status_code,
            chef_name=data['chef_name'],
            message=data['error_message'],
        )
```

If there's a low-level exception like `requests.Timeout`, that will be caught by the `except requests.RequestException` block and re-raised as `NetworkError`.

If there's an HTTP 5xx server error talking to the web API, we raise `APIError`.

And if there's an HTTP 4xx client error talking to the web API, we raise `OrderError`, our new custom exception type. It has three attributes: the HTTP status code, the chef's name, and a message (two of the fields come from the response JSON).

Now users can catch `OrderError` and use the details to do something helpful, like print a nice error message:

```python
try:
    fishnchips.order(chips=1, fish=2)
except fishnchips.OrderError as e:
    print(f'Error with order: {e.chef_name} said {e.message}', file=sys.stderr)
    sys.exit(1)
except fishnchips.Error as e:
    print(f'Unexpected error, please contact us: {e}', file=sys.stderr)
    sys.exit(1)
```

One interesting case of an error *not* being an exception is actually from Requests:

```python
>>> response = requests.get('https://benhoyt.com/resume/')
>>> response.status_code
404
>>> response.raise_for_status()
Traceback (most recent call last):
  ...
requests.exceptions.HTTPError: 404 Client Error: ...
```

This page doesn't exist, so it's a 404 error -- my resume lives at `/cv/`, not `/resume/`. But Requests doesn't raise an exception, unless you explicitly call `response.raise_for_status()`.

I guess they made the decision early on that if an HTTP request completes, *even if it's an HTTP-level error*, the Requests library should treat that as successful.

I actually think this is one of the few design flaws in the Requests API design. A 4xx or 5xx HTTP status code *is* an error, so it should be an exception. With the current approach, it's too easy to do this:

```python
response = requests.get('https://benhoyt.com/resume/')
pathlib.Path('resume.html').write_text(response.text)
```

We've forgotten to check `response.status_code`, so this code silently writes my 404 page HTML to `resume.html`. You can "fix" it by checking the `status_code` attribute or calling `raise_for_status`, but the API design means it's easy to forget. APIs should be designed so that it's hard to make mistakes.

**Takeaway: If an error occurs, raise a custom exception; use built-in exceptions if appropriate.**


## Versioning and backwards-compatibility

If you're publishing changes to your library on the [Python Package Index (PyPI)](https://pypi.org/), you should always bump up the version number and write release notes about what changed. But there's a lot of nuance in that.

You've probably heard of [semantic versioning](https://semver.org/), or "semver" for short. This is where you have a version number like 1.2.3, where 1 is the *major* version, 2 is the *minor* version, and 3 is the *patch* version.

The semver spec says you should increment the:

* Major version when you make incompatible API changes
* Minor version when you add functionality in a backward compatible manner
* Patch version when you make backward compatible bug fixes

It's pretty easy to do. Just make your version first 1.0.0, and go from there. When you add a new class or function, bump it up to 1.1.0, then 1.2.0, and so on. It's common for the middle number to go past 9 and even get very high, like 1.42.0 or 1.365.0.

Remember that you're making your API for users, so you want to be *very* slow to update the major version. If your users want to upgrade to a new major version, they'll likely have to change their code. This is a real pain, so don't do it often!

This is a bit opinionated, but I think you should only ship a new major version when you're completely changing the structure of the API.

**Takeaway: Only break backwards compatibility if you're overhauling your API.**

The nice thing is that Python has some great features for keeping things backwards-compatible: two of the main ones are *keyword arguments* and *dynamic typing*.

Let's go back to our fish ’n’ chip library. Here's version one -- you can order a number of scoops of chips and a number of fish:

```python
def order(chips=None, fish=None):
    """Place an order.

    Args:
        chips: number of scoops of chips
        fish: number of fish
    """
```

But then let's say our fish ’n’ chip shop gets fancy, and they want to start serving *crumbed* fish. So now there are two types of fish: battered and crumbed.

We need to change the API to allow the user to specify what type of fish. The simplest way to do it is by adding a keyword argument. The default is still battered, but a caller can ask for `fish_type='crumbed'` if they want:

```python
def order(chips=None, fish=None, fish_type='battered'):
    """Place an order.

    Args:
        chips: number of scoops of chips
        fish: number of fish
        fish_type: type of fish, 'battered' or 'crumbed'
    """

# example usage:
fishnchips.order(chips=1, fish=2, fish_type='crumbed')
```

The cool thing about keyword arguments is that you, as a library author, can add as many as you want, and each one can have a sensible default. So we could add a `timeout` argument, and any number of new foods, like `onion_rings` and `hotdogs`.

You could even use an [enum](https://docs.python.org/3/library/enum.html) for the fish type, like `FishType.CRUMBED`. It's a bit more verbose, but the interpreter will catch it if you spelled it wrong.

Another approach is to take advantage of dynamic typing, and allow `fish` to be either an integer, or a tuple of (quantity, type), so you could ask for "2 crumbed fish":

```python
def order(chips=None, fish=None):
    """Place an order.

    Args:
        chips: number of scoops of chips
        fish: either the number of fish, or a tuple of (quantity, type),
            where type is 'battered' or 'crumbed'
    """

# example usage:
fishnchips.order(chips=1, fish=(2, 'crumbed'))
```

I think this API is a bit better. But what if Mum wants crumbed and Dad wants battered? Let's also allow a *list* of tuples, so they can each have their own type of fish:

```python
def order(chips=None, fish=None):
    """Place an order.

    Args:
        chips: number of scoops of chips
        fish: either the number of fish,
           a tuple of (quantity, type),
           or a list of such tuples
    """

# example usage:
fishnchips.order(chips=1, fish=[(1, 'crumbed'), (1, 'battered')])
```

It's kind of a complicated signature, but this sort of thing is fairly common in Python, and it makes the easy thing easy, but the hard thing doable. All of these changes are backwards-compatible, which is great for existing users.

**Takeaway: Keyword arguments and dynamic typing are great for backwards compatibility.**


## Type annotations

I'll state up-front that I have mixed feelings about type annotations in Python. I'll start with the negatives:

* They were bolted on late in the game, and it shows. The original [Type Hints PEP](https://peps.python.org/pep-0484/) came 23 years after Python was created.
* They make for unwieldy signatures for dynamically-typed arguments, which are common in Python.
* The annotation syntax is constantly being updated.
* There are multiple type checkers, none of which quite agree.

As an example of how they can quickly get unwieldy, let's look at the "fish type" example from earlier, where the optional `fish` argument can be an integer, a tuple, or a list of tuples. Here's what the signature would look like:

```python
def order(
        chips: int | None = None,
        fish: int | tuple[int, str] | list[tuple[int, str]] | None = None,
    ):
```

For something fairly simple, that's a lot of (ahem) *typing*!

There's an excellent post on the Python sub-Reddit, rather dramatically titled ["Why Type Hinting Sucks!"](https://www.reddit.com/r/Python/comments/10zdidm/why_type_hinting_sucks/), where the author shows just how many knots you can get yourself tied in when trying to write correct type signatures in the face of duck typing. The author goes through 10 increasingly absurd attempts at annotating a simple function that adds two numbers.

The example above also shows how quickly the syntax changes: the above uses the new `x | y` syntax for unions (added in Python 3.10), and the `list[T]` syntax instead of `typing.List[T]` (added in Python 3.9). Just a couple of versions ago you would have had to write this:

```python
from typing import List, Optional, Tuple, Union

def order(
        chips: Optional[int] = None,
        fish: Optional[Union[int, Tuple[int, str], List[Tuple[int, str]]]] = None,
    ):
```

Even as I was writing this I saw a post about [PEP 695](https://peps.python.org/pep-0695/), which proposes a new syntax for type parameters (generic types). It will be included in Python 3.12, along with two other proposals introducing new syntax for [method overrides](https://peps.python.org/pep-0698/) and using [`TypedDict` for `**kwargs`](https://peps.python.org/pep-0692/).

But I must be fair -- there's definitely a positive side to type annotations:

* They help catch bugs. You need fewer tests if you have type checking.
* They make refactoring easier and safer.
* They document what types are acceptable.
* They help your IDE provide better navigation and auto-completion.

Those last two points in particular make them useful for users of your library.

On balance, I definitely think it's the right thing to do in 2023 to ship your library with type annotations.

And of course, don't just use them, but run [Pyright](https://microsoft.github.io/pyright/) or [MyPy](https://www.mypy-lang.org/) over your library's code on every commit. (At the moment I don't have a strong reason to prefer one or the other).

**Takeaway: Use type annotations at least for your public API; your users will thank you.**

There's a ton more to say about types and type annotations in Python, but here I'll just mention one other modern Python tool: data classes.

I'm sure we've all written "data classes" like this:

```python
class User:
    def __init__(self, username, display_name, active):
        self.username = username
        self.display_name = display_name
        self.active = active
```

And then we discovered `collections.namedtuple`, and started using that instead:

```python
User = collections.namedtuple('User', ['username', 'display_name', 'active'])
```

However, we didn't really want a *tuple* (the fields of which are indexable and iterable), we wanted a "struct" or "plain old data class". Well, as of Python 3.7 there is a `dataclasses` module. You use it like this:

```python
from dataclasses import dataclass

@dataclass
class User:
    username: str
    display_name: str
    active: bool
```

It's not only shorter and sweeter than an ordinary class, you get a lot of things for free: type annotations on the fields, an automatically-generated `__init__`, `__repr__`, and `__eq__`, and even `__match_args__` for [pattern matching](/writings/python-pattern-matching/).

So definitely check out the `dataclasses` module if you have classes which are mostly data. There's nothing stopping you adding methods to them too.

**Takeaway: Use `@dataclass` for classes which are (mostly) data.**


## Python's expressiveness: be careful!

I want to leave you with one last thought: Python is almost infinitely flexible. You can overload operators like `a+b` and `a[b]`, you can make a simple attribute lookup delete someone's hard drive, you can dynamically import packages by name at runtime, you can create a domain-specific language only you can read, and on and on.

But just because you can doesn't mean you should! Programming might be magic, but too much magic is confusing and hard to reason about.

Here are my rules of thumb:

* Only override math operators like `a+b` if you're creating a number type.
* Only override indexing operators like `a[b]` if you're creating an indexable collection.
* Property getters and setters "look cheap", so they should *be* cheap. For example, don't perform I/O or raise exceptions.
* If the type signature is too hard to write, it might be a bad idea.

**Takeaway: Python's expressiveness is boundless; don't use too much of it!**


## Takeaways

There's a lot more that could be said. In fact, you could probably write an entire book about API design. But that's enough for now!

I'll conclude by listing all the takeaways in one place:

* Good API design is very important to users.
* When creating a library, start with a good base and iterate.
* Try to follow PEP 8 and grok PEP 20. This is the way.
* The standard library isn't always the best example to follow.
* Expose a clean API; file structure is an implementation detail.
* Flat is better than nested.
* Design your library to be used as `import lib ... lib.Thing()` rather than `from lib import LibThing ... LibThing()`.
* Avoid global configuration; use good defaults and let the user override them.
* Avoid global state; use a class instead.
* Names should be as short as they can be while still being clear.
* Function names should be verbs and classes nouns, but don't get hung up on this.
* Being `_private` is fine; `__extra_privacy` is unnecessary.
* If an error occurs, raise an exception; use custom exceptions where appropriate.
* Only break backwards compatibility if you're overhauling your API.
* Keyword arguments and dynamic typing are great for backwards compatibility.
* Use type annotations at least for your public API; your users will thank you.
* Use `@dataclass` for classes which are (mostly) data.
* Python's expressiveness is boundless; don't use too much of it!

Happy designing! Please send your own API design ideas or any other feedback. <!-- TODO: You can discuss this on Hacker News or programming reddit. -->


{% include sponsor.html %}
