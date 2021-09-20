---
title: 'Saving 9 GB of RAM with Python __slots__'
layout: default
permalink: /writings/save-ram-with-python-slots/
description: Describes the huge memory savings we got using __slots__ on a single class
canonical_url: http://tech.oyster.com/save-ram-with-python-slots/
---
<h1>Saving 9 GB of RAM with Python \_\_slots\_\_</h1>
<p class="subtitle">November 2013</p>

> [Original article on tech.oyster.com]({{ page.canonical_url }})

We&#8217;ve [mentioned before][1] how Oyster.com&#8217;s Python-based web servers cache huge amounts of static content in huge Python dicts (hash tables). Well, we recently saved over 2 GB in each of four 6 GB server processes with a single line of code &#8212; using [`__slots__`][2] on our `Image` class.

Here&#8217;s a screenshot of RAM usage before and after deploying this change on one of our servers:

![Screenshot of RAM usage before and after](/images/physical-memory-usage-history.png)

We allocate about a million instances of a class like the following:

```python
class Image(object):
    def __init__(self, id, caption, url):
        self.id = id
        self.caption = caption
        self.url = url
        self._setup()

    # ... other methods ...
```

By default Python uses a dict to store an object&#8217;s instance attributes. Which is usually fine, and it allows fully dynamic things like setting arbitrary new attributes at runtime.

However, for small classes that have a few fixed attributes known at &#8220;compile time&#8221;, the dict is a waste of RAM, and this makes a real difference when you&#8217;re creating a million of them. You can tell Python not to use a dict, and only allocate space for a fixed set of attributes, by settings `__slots__` on the class to a fixed list of attribute names:

```python
class Image(object):
    __slots__ = ['id', 'caption', 'url']

    def __init__(self, id, caption, url):
        self.id = id
        self.caption = caption
        self.url = url
        self._setup()

    # ... other methods ...
```

Note that you can also use [collections.namedtuple][3], which allows attribute access, but only takes the space of a tuple, so it&#8217;s similar to using `__slots__` on a class. However, to me it always [feels weird][4] to inherit from a namedtuple class. Also, if you want a custom initializer you have to override `__new__` rather than `__init__`.

**Warning:** Don&#8217;t prematurely optimize and use this everywhere! It&#8217;s not great for code maintenance, and it really only saves you when you have thousands of instances.

 [1]: http://tech.oyster.com/pythons-garbage-collector/
 [2]: http://docs.python.org/2/reference/datamodel.html#slots
 [3]: http://docs.python.org/2/library/collections.html#collections.namedtuple
 [4]: http://stackoverflow.com/questions/4071765/in-python-how-do-i-call-the-super-class-when-its-a-one-off-namedtuple