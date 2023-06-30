---
layout: default
title: "For Python packages, file structure != API"
permalink: /writings/python-api-file-structure/
description: "When designing Python packages, decoupling the file structure from the package's API makes your package easier to import and use."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">June 2023</p>


> This mini-article is based on [part of a talk](https://benhoyt.com/writings/python-api-design/#module-and-package-structure) I gave about Python API design.

When you're creating a Python package, one of the nice things is that you can just add a `.py` source file to the package directory, and then users can import it right away.

For example, say you're creating a text processing package called `tekst`, and you want to add a `Token` class and a `tokenize` function. You quite rightly implement those in `tekst/tokenizer.py`:

```python
# tekst/tokenizer.py

@dataclass
class Token:
    kind: str
    content: str

def tokenize(text: str) -> Iterable[Token]:
    ...
```

Good so far. But you shouldn't make your users do this:

```python
import tekst.tokenizer

def process(token: tekst.tokenizer.Token):
    ...

tokens = tekst.tokenizer.tokenize('Hello, world')
for token in tokens:
    process(token)
```

Unless your text library is *huge*, all those `tekst.tokenizer.X`'s are unnecessary and repetitive. Of course, users may well do this:

```python
from tekst.tokenizer import Token, tokenize

def process(token: Token):
    ...

tokens = tokenize('Hello, world')
for token in tokens:
    process(token)
```

Which is much easier on the eyes.

However, now there's another problem. Assuming the user's code is more than a few lines, it's unclear where `Token` and `tokenize` come from. Are they locally-defined, or did you import them from some module? If so, which one? You have to scroll to the top and find the imports, or use your IDE's navigation features.

But there's an easy way to solve this: design your package to be used as `import lib ... lib.Thing()`. We need to import `Token` and `tokenize` in our package's `__init__.py`, like so:

```python
# tekst/__init__.py

__all__ = ['Token', 'tokenize', ...]

from .tokenizer import Token, tokenize
```

Then users can make their code relatively concise, but still include the library name as a namespace prefix, making it clear where things came from:

```python
import tekst

def process(token: tekst.Token):
    ...

tokens = tekst.tokenize('Hello, world')
for token in tokens:
    process(token)
...
```

As the [Zen of Python](https://peps.python.org/pep-0020/) says, "Flat is better than nested", and "Namespaces are one honking great idea -- let's do more of those!"

But you've not only followed the Zen of Python, you've **decoupled your file structure from your package's API**. Users get a nice API that's easy to import and easy to read, and you -- the library author -- can put the implementation in whatever files you want.


{% include sponsor.html %}
