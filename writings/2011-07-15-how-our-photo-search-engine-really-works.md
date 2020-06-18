---
title: How our photo search engine really works
layout: default
permalink: /writings/how-our-photo-search-engine-really-works/
description: How I wrote Oyster.com's photo search engine in Python
canonical_url: http://tech.oyster.com/how-our-photo-search-engine-really-works/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2011</p>

> [Original article on tech.oyster.com]({{ page.canonical_url }})

![Oyster Shots](/images/OysterShots.jpg)

Our recently-launched [Oyster Shots][1] is a new tool you can use to search all of our stunning hotel photos by keyword and hotel attributes (location, rating, and hotel type). So far we have about 300,000 published photos, so there&#8217;s a lot to search. Some examples to get you started: [New York City Restaurants and Bars][2], [Dominican Republic Beaches][3], and [Luxury Hotel Bathrooms][4].

If you want to know how to use Oyster Shots, just go to the [landing page][1] and watch the &#8220;How does it work?&#8221; video on the left. But if you&#8217;re a techie and want to know **how it really works under the hood**, read on.

## Tagging our photos

One of the main questions up-front was whether we&#8217;d take a full-text or a tagging approach. Full-text search sounds nice, because you can just plug in a [library][5] and let it do the dirty work. But we don&#8217;t have enough textual data for each photo to make full-text results relevant &#8212; all we have is the photo&#8217;s original folder name, which is also used to generate the captions.

For example, a pool photo might be put into a folder called &#8220;Pool&#8221;, or if the photographer was feeling nice, perhaps &#8220;Pool/Infinity Pool&#8221;. So we generate one or two tags from that data. And we also use the metadata associated with the photo&#8217;s hotel, such as the hotel name, type, and location.

Armed with tags, the next step was to reduce duplication and remove pointless tags with only a few photos, like &#8220;Villa Suite Grand Ocean View Room With Double King Bed&#8221;. We did this via a combination of a manually-prepared &#8220;tag merge spreadsheet&#8221; and some Pythonic scripting goodness.

The tags are all stored in singular form, but the search code recognises plural forms too. This is done via a lookup table created using a pluralize() function (see [ActiveState recipe][6]).

Our tagging isn&#8217;t perfect, of course. One thing it doesn&#8217;t yet handle is synonyms &#8212; our autocomplete provides clues for what the user can type, but at present we more or less force them to use our keywords. For example, you have to type &#8220;new york bathrooms&#8221; and not &#8220;new york restrooms&#8221;. Also on the radar is to allow users to add their own tags.

## Autocomplete

The first piece of back-end technology you use when doing an Oyster Shots search is the autocomplete. We use Ajax (via jQuery) to fetch the autocomplete results as you type. Results need to come back fast, and our Python backend can handle about 3000 calls per second (though of course you won&#8217;t get that across a real HTTP connection).

![Autocomplete results for "Miami P"](/images/MiamiP1.png)

An autocomplete lookup uses sorted indexes with Python&#8217;s built-in &#8220;bisect&#8221; module to do a binary search. Each binary search is of course O(log(N)), where N is the total number of items in the index. Python&#8217;s &#8220;bisect&#8221; module has a [fast C version][7] just to speed things up even further.

We have one index for whole-name matches and one for single-word matches. For example, if we looked at just the Las Vegas sections of the indexes we&#8217;d see something like this:

```python
name_index = [
    ('lasvegas', LocationEntry('Las Vegas')),
    ...
]

word_index = [
    ('las', LocationEntry('Las Vegas')),
    ('vegas', LocationEntry('Las Vegas')),
    ...
]
```

If your query is &#8220;las vegas&#8221;, both indexes will match to give you Las Vegas, but if you just type in &#8220;veg&#8221; or &#8220;vegas&#8221;, the word_index will match and give you results. After the binary search we merge and sort the results: name matches are prioritized over word matches, and each match type has its own priority.

If there are no results, the autocompleter switches to multi-tag matching mode, which chops words off the end of the query until there are matches (if any), and then combines the first result of that with results from matching on the rest of the query to produce multi-tag matches. For example, if you type &#8220;miami p&#8221;, nothing will match directly, so we combine the first result for &#8220;miami&#8221; with results from &#8220;p&#8221;, giving &#8220;Miami + Pool&#8221;, &#8220;Miami + Presidential Suite&#8221;, etc.

## Sorting and searching

The first step here was to read Donald Knuth&#8217;s *The Art of Computer Programming*, Volume 3, [Sorting and Searching][9] &#8212; I did this one morning on my subway commute to work, and then jotted down the answers to all the exercises on the commute home.

Seriously though, the authors of Python have [read Knuth for us][10], and Python&#8217;s dict implementation is probably one of the fastest general-purpose hash table implementations on the planet. Our search code makes use of them liberally &#8212; dict lookups are fast, RAM is cheap, so why not cache 300,000 Image objects with a bunch of dicts? The two main caches map tags to images and hotels to images. Each value is a pre-sorted list of Image objects to speed up the sorting and pagination process.

The code also makes heavy use of Python&#8217;s built-in set objects to keep track of what we&#8217;ve seen, various filter options, etc. Sets use dicts under the covers, so lookups and insertions are both O(1) and fast.

## Performance

Choosing good algorithms and data structures is much more important than which language you&#8217;re programming in. We chose Python because it allows us to iterate and write features quickly. Python compiles to simple and fairly unoptimized byte code, so it&#8217;s not known as a &#8220;fast&#8221; language, but because its data structures and built-ins are heavily optimized and written in C, it&#8217;s &#8220;fast enough&#8221;. (In fact, C++ hash_maps are significantly slower than Python dicts.)

As mentioned above, we&#8217;ve chosen our data structures carefully and made heavy use of dicts to cache things. But you have to be careful &#8212; partly because Python is flexible and dynamically typed, it&#8217;s easy to hide an O(N) or even an O(N<sup>2</sup>) operation where you meant an O(1) one. For example, consider the following (more or less real) code:

```python
for image in images:
    if image.hotel_id in hotel_ids:
        ...
```

If `hotel_ids` is a set, as it should be here, this is an O(len(images)) operation, but if it&#8217;s a list, we&#8217;re talking O(len(images) * len(hotel\_ids)), which could be a very significant difference. You can shoot yourself in the performance foot in any language, but Python&#8217;s conciseness means it&#8217;s relatively easy to hide a really slow operation in a comparatively innocent-looking line of code.

## Up next

So there you have it (or some of it). In our [next blog entry][11], our lead front-end developer Alex will describe the fancy CSS and JavaScript he uses to make the front-end side of Oyster Shots so slick.

 [1]: http://www.oyster.com/shots/
 [2]: http://www.oyster.com/shots/?qa=location%3Anew-york-city+restaurants-and-bars
 [3]: http://www.oyster.com/shots/?qa=location%3Adominican-republic+beach
 [4]: http://www.oyster.com/shots/?qa=tag%3Aluxury+bathroom
 [5]: http://lucene.apache.org/java/docs/index.html
 [6]: http://code.activestate.com/recipes/577781-pluralize-word-convert-singular-word-to-its-plural/
 [7]: http://hg.python.org/cpython/file/71a1f53c8203/Modules/_bisectmodule.c
 [8]: http://www.oyster.com/shots/?qa=location%3Amiami+pool#image=61761
 [9]: http://www-cs-staff.stanford.edu/~uno/taocp.html#vol3
 [10]: http://hg.python.org/cpython/file/71a1f53c8203/Objects/dictobject.c
 [11]: http://tech.oyster.com/oyster-shots-on-the-front-end/