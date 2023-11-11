---	
layout: default
title: "Using a Markov chain to generate readable nonsense with 20 lines of Python"
permalink: /writings/markov-chain/
description: "Describes a simple Markov chain algorithm to generate reasonable-sounding but utterly nonsensical text, and presents some example outputs as well as a Python implementation."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2023</p>


> **Go to:** [Algorithm](#the-algorithm) \| [Examples](#some-better-examples) \| [Python implementation](#python-implementation) \| [Conclusion](#conclusion)


I recently learned how to generate text using a simple [Markov chain](https://en.wikipedia.org/wiki/Markov_chain). The generated text is readable but is also complete nonsense; as prose it's not worth much, but for predicting the next word like your phone keyboard's suggestions, it's surprisingly useful.

I learned about this algorithm in chapter 3 of Kernighan and Pike's book [*The Practice of Programming*](https://www.cs.princeton.edu/~bwk/tpop.webpage/), where they implement such a generator in various programming languages to discuss program design and data structures.

Note that this algorithm is only one small use for Markov chains, which are a much more general statistical concept.


## The algorithm

The algorithm is easy to explain: start with an input text whose phrases will be used to generate the output. For every pair of words in the input, record a list of the possible words that come after the word pair.

Once you've built that data structure, you can generate as much or as little output as you want. Start with any pair of words that occurs in the input, and then randomly pick one of the possible third words. Then move along, so the second word in the pair is the word you just generated, randomly pick another word, and so on.

That's all there is to it!

This algorithm uses pairs of words, also called [bigrams](https://en.wikipedia.org/wiki/Bigram). You could generalise the algorithm to use single words or trigrams instead of pairs. However, as *The Practice of Programming* points out:

> Making the prefix shorter tends to produce less coherent prose; making it longer tends
> to reproduce the input text verbatim. For English text, using two words to select a
> third is a good compromise; it seems to recreate the flavor of the input while adding
> its own whimsical touch.

Let's work through an example. For small inputs, you want some repetition for it to work, so as input we'll use the last five of the Ten Commandments from the King James Bible:

> Thou shalt not kill.
>
> Thou shalt not commit adultery.
>
> Thou shalt not steal.
>
> Thou shalt not bear false witness against thy neighbour.
>
> Thou shalt not covet thy neighbours house, thou shalt not covet thy neighbours wife, nor his manservant, nor his maidservant, nor his ox, nor his ass, nor any thing that is thy neighbours.

Here's what the "possible third words" data structure looks like, showing the first few entries with the word pair on the left and the possibilities separated by `|` on the right:

```
shalt not         kill. | commit | steal. | bear | covet | covet
Thou shalt        not | not | not | not | not
nor his           manservant, | maidservant, | ox, | ass,
not covet         thy | thy
covet thy         neighbours | neighbours
thy neighbours    house, | wife,
not kill.         Thou
kill. Thou        shalt
not commit        adultery.
...
```

So if you start with "shalt not", you randomly choose "kill.", "commit", "steal.", "bear", or "covet" as the next word. Because "covet" appears twice in the list of possibilities, it's twice as likely to be chosen as the next word.

You can see how we've included capital letters and punctuation in the words. This keeps the word-splitting simpler, but it also means the generated output will automatically generate "sentences" with capitalization and punctuation that actually occurred in the input. It's quite a neat trick!

What does the generated output look like? Let's try it using the Ten Commandments input above:

> Thou shalt not bear false witness against thy neighbour. Thou shalt
> not commit adultery. Thou shalt not steal. Thou shalt not covet thy
> neighbours house, thou shalt not commit adultery. Thou shalt not covet
> thy neighbours house, thou shalt not steal. Thou shalt not commit
> adultery. Thou shalt not steal. Thou shalt not covet thy neighbours...

As you can see, the problem with using such a small input text is that the output is often a verbatim copy of the input text -- or something randomly close to it.

If you use a larger input text, you get much more interesting output.


## Some better examples

Below are some more fun outputs using larger input texts. We'll generate 100 words from each input. The books were sourced from [Project Gutenberg](https://www.gutenberg.org/).


### Using my articles

Using the [articles I've written](/writings/) as input:

> Especially if you need to return a value, but are now very flat -- almost 5x as fast. Still, if you need a custom exception; use built-in exceptions if appropriate. Only break backwards compatibility if you're on Linux, this uses the x86's SSE/SIMD instructions to process CSV using AWK, such as `NF` are read-only in AWKGo. What does "Pythonic" mean? That's a lot of fun. My recommendation: roll your own type-safe `OrderedMap<int>`. But because Lox strings don't support escape sequences, there's no `null` or `undefined`, and you have it! A minimalist Make in one of its revenue comes from the...

I love how it captures most of my technical interests: performance, idiomatic code, backwards compatibility, AWK, CSV, little languages, and so on. It's no ChatGPT, but if you squint the text looks quite plausible!

Note how the output even includes valid Markdown from the input (though I removed a couple of links).


### Using *Alice in Wonderland*

Here's one using Lewis Carroll's *Alice in Wonderland* as input. The book is more or less nonsense to begin with, so this almost works:

> A large rose-tree stood near the entrance of the cakes, and was
> delighted to find that her flamingo was gone in a great hurry; “and
> their names were Elsie, Lacie, and Tillie; and they can’t prove I did:
> there’s no use denying it. I suppose Dinah’ll be sending me on
> messages next!” And she opened the door began sneezing all at once.
> The Dormouse had closed its eyes again, to see what was going off into
> a large fan in the pool, “and she sits purring so nicely by the hand,
> it hurried off, without waiting for the limited right of replacement...


### Using the Old Testament (from the King James Bible)

Note how the output includes (nonsensical) verse numbers, which were part of the input.

Look for the roast the king of Babylon gets!

> Benjamin, Jaasiel the son of Berachiah, the son of Jehoiakim king of
> Gomorrah, and toward the holy gods is in your own will. 22:30 On the
> south in the porch of the sea, over against the mount out of the LORD
> shall smite the waves thereof. 107:26 They mount up to mount up to
> bury them, them, their children, shewing to the priest; 13:17 And the
> king of Babylon roasted in the name of the dust. 18:1 Then answered
> one of them, did Joshua take, and put his hand over the servants of
> Saul my father nor my life from perishing by...


### Using the New Testament (from the King James Bible)

Kind of funny that the New Testament output starts with "Moses", a key Old Testament figure (but whose name appears 80 times in the New Testament too).

My computer also seems rather heretical: "we have preached the word of the body is the will of man".

And yes, ["throughly"](https://en.wiktionary.org/wiki/throughly) is an (archaic) word.

> Moses, ye would that we dwell in them. 2:11 Wherefore remember, that
> by my voice against them. 20:20 And they said, Is not this he that
> humbleth himself shall be given, and he will throughly purge his
> floor, and gather the wheat into the sea, and get victuals: for we
> have preached the word of the body is the will of man, it shall be:
> but we have sent for me? 10:30 And Jesus went into the kingdom of God.
> 5:6 Let no man may say, Thou fool, that he was nigh to Joppa, and the
> other side. 10:33 But whosoever shall...


### Using *The War of the Worlds*

And one more, for good measure. This is using *The War of the Worlds*, by H. G. Wells.

> At Halliford I had the appearance of that blackness looks on a Derby
> Day. My brother turned down towards the iron gates of Hyde Park. I had
> seen two human skeletons—not bodies, but skeletons, picked clean—and
> in the pit—that the man drove by and stopped at the fugitives, without
> offering to help. The inn was closed, as if by a man on a bicycle,
> children going to seek food, and told him it would be a cope of lead
> to him, therefore. That, indeed, was the dawn of the houses facing the
> river to Shepperton, and the others. An insane resolve possessed...

With insane resolve, let's now look at the Python code I used to implement this.


## Python implementation

First, here's the full program -- it's 24 lines with blanks and comments, 16 without:

```python
import collections, random, sys, textwrap

# Build possibles table indexed by pair of prefix words (w1, w2)
w1 = w2 = ''
possibles = collections.defaultdict(list)
for line in sys.stdin:
    for word in line.split():
        possibles[w1, w2].append(word)
        w1, w2 = w2, word

# Avoid empty possibles lists at end of input
possibles[w1, w2].append('')
possibles[w2, ''].append('')

# Generate randomized output (start with a random capitalized prefix)
w1, w2 = random.choice([k for k in possibles if k[0][:1].isupper()])
output = [w1, w2]
for _ in range(int(sys.argv[1])):
    word = random.choice(possibles[w1, w2])
    output.append(word)
    w1, w2 = w2, word

# Print output wrapped to 70 columns
print(textwrap.fill(' '.join(output)))
```

You can judge for yourself, but I think it's fairly readable.

The program expects the number of words as a command-line argument (`sys.argv[1]`), and the input text on standard input. To run it, use a command like this:

```
$ python3 markov.py 100 <AliceInWonderland.txt 
A large rose-tree stood near the entrance of the cakes, and was
...
```

The code is also available as a GitHub Gist: [markov.py](https://gist.github.com/benhoyt/619cf3113866450aa31d8a2c1f8e01dc). This program is hardly original -- I hereby give you permission to do whatever you want with it.


## Conclusion

I find it fascinating that a simple data structure and a random number generator can produce such interesting output.

I also think the trick of including capital letters and punctuation in the recorded "words" is quite clever. It's not a trick at all, of course, but an elegant design choice that makes the program simpler *and* the output better. I wonder how many similar design choices are hiding in existing programs, waiting to be simplified?

Have fun generating text from your own inputs!


{% include sponsor.html %}
