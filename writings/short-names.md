---
layout: default
title: "Names should be as short as possible while still being clear"
permalink: /writings/short-names/
description: "Short, meaningful names that take context into account are better than long, verbose names that don't."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2023</p>


> This mini-article is based on [part of a talk](https://benhoyt.com/writings/python-api-design/#naming) I gave about *Python* API design, but I think the main point holds across programming languages.


Phil Karlton, a programmer who worked at Netscape, [famously said](https://skeptics.stackexchange.com/questions/19836/has-phil-karlton-ever-said-there-are-only-two-hard-things-in-computer-science), "There are only two hard things in Computer Science: cache invalidation and naming things."

It's actually easy to name things. The hard thing is naming them *well*. Maybe if it were harder to name them we'd spend longer choosing good names.

Some developers do use names that are too short. However, I think **the more common mistake is using names that are overly long.**

Long names make it harder to see the important information. For example, imagine if Bob Just-Out-Of-Uni was designing the [Requests](https://docs.python-requests.org/en/latest/index.html) library, and one of his lecturers had said "name a function to explain what it does".

That's not terrible advice, but he heard "name a function to explain everything it does", and wrote this:

```python
# requests.py
def send_get_request_and_receive_response(url):
    ...
```

Using it would look like this:

```python
import requests

response = requests.send_get_request_and_receive_response(url)
```

What's wrong with that? Well, the extra words don't add anything. In fact, they take away clarity: [`requests.get()`](https://docs.python-requests.org/en/latest/user/quickstart/#make-a-request) is easy to see and read, whereas with the longer name the important part -- the fact that it's a "get" method -- is hidden in the middle of the name.

The word "request" appears twice, once in the module name and once in the function name. And then there's "send" and "receive response". But the entire point of the library is to send requests and receive responses, so that's unnecessary too.

You're left with the short and sweet `requests.get()` -- which says "perform a GET request" clearly and succinctly. You can't get any shorter than that. I mean, you could make it `requests.g()` -- but that's just silly.

I'm a [strong advocate](https://benhoyt.com/writings/python-api-file-structure/) of designing your module to be used with the module name as a dotted prefix. Requests follows this: `get()` wouldn't make much sense on its own, but `requests.get()` is clean and clear. You don't get name clashes, because the module name is right there to disambiguate.

In other words, don't name things to explain everything they do; **name things so the meaning is clear in context.**

Using succinct names isn't only important when you're designing a library, but also when you're writing regular code. Local variable names can usually be short, because the context is provided by the surrounding code -- the function or script they're in.

Let's look at an example. Recently I saw this code in a `repository_statistics.py` script:

```python
repository_index_retriever = RepositoryIndexRetriever(args.architecture)
repository_statistics_processor = RepositoryStatisticsProcessor()
for repository_object in repository_index_retriever.retrieve_repositories():
    for repository_file in repository_object.repository_files:
        repository_statistics_processor.increment_repository_file_count(repository_file.name)

for repository_file_name, count in repository_statistics_processor.get_top_n_repositories(10):
    print(repository_file_name, count)
```

So many big words! The simple logic of the code gets lost in verbiage.

Here's how I would rewrite the code (oh, and `RepositoryStatisticsProcessor` was a glorified [`collections.Counter`](https://docs.python.org/3/library/collections.html#collections.Counter), so let's use that):

```python
fetcher = repolib.IndexFetcher(args.arch)
counts = collections.Counter()
for repo in fetcher.get_repos():
    for file in repo.files:
        counts[file.name] += 1

for repo, count in counts.most_common(10):
    print(repo, count)
```

Same structure, but the logic is now much easier to see.

And in Python, you often have one-line list comprehensions or generator expressions. When writing those, you can go even further and use one-letter variable names -- when both uses are on one line, `f` may be just as clear as `file` or `file_object`.

For example, we could change the inner loop to use [`Counter.update`](https://docs.python.org/3/library/collections.html#collections.Counter.update) with a generator expression and a one-letter variable name:

```python
counts.update(f.name for f in repo.files)
```

I'll finish with a quote from Russ Cox, tech lead of the Go project, who states [his variable naming philosophy](https://research.swtch.com/names) this way:

> *A name's length should not exceed its information content.* ... Global names must convey relatively more information, because they appear in a larger variety of contexts. Even so, a short, precise name can say more than a long-winded one: compare `acquire` and `take_ownership`. Make every name tell.

That last sentence is poetry. But I'll conclude by restating my own, more prosaic "variable naming philosophy":

**Names should be as short as possible while still being clear.**


{% include sponsor.html %}
