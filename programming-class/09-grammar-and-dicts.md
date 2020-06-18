---
layout: default
title: "Session 9: Grammar and Dictionaries"
permalink: /programming-class/09-grammar-and-dicts/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2017</p>

> These are my "teaching notes" for the ninth session of my [Computers and Programming Class](/programming-class/).


Language grammar
----------------

So I thought I'd say a few more things about the *grammar* of Python. When you speak or write in a human language, you're following some sort of grammar. The nice thing about humans is they're very forgiving -- they can understand you even if you speak with bad grammar.

For example, my wife's mother tongue is Afrikaans, a language based on Dutch. I learned quite a lot of Afrikaans when we were going out and after we were married, but I'm still far from fluent. In particular, my grammar is not nearly native. So I'll say the equivalent of something like "I am go to store to milk get" ... and while she smiles at my funky grammar, she understands me perfectly: "I'm going to the store to get milk".

Python, and all programming languages, have a very strict grammar, and if you get one thing slightly wrong, they'll have no idea what you mean. They'll say Syntax Error, or even worse, just do the wrong thing.

So I'm going to look at the parts of Python that we've learned already and look at the grammar more closely. Let's take this program:

    biggest = 0
    numbers = []
    for i in range(5):
        number = int(input('Type a number: '))
        numbers.append(number)
        if number > biggest:
            biggest = number
    print(number)
    print(biggest)

What are the parts of the grammar here?

* statements: one per line (are there other ways to separate statements?)
* assignment: VARIABLE_NAME = EXPRESSION
* variable names: start with a letter or underscore, followed by any number of letters, digits, or underscores
* expressions: numbers, strings, lists, function calls, or combinations of those
* numbers: one or more digits
* strings: ' ANY_CHARACTERS_EXCEPT_QUOTE '
* lists: [ COMMA_SEPARATED_LIST ]
* for loop: for VARIABLE_NAME in ITERABLE: BLOCK
* function call: FUNCTION_NAME(PARAMETERS)
* built-in functions: `range()`, `int()`, `input()`
  - Python doesn't care what you name your own variables or functions, but the built-in functions have to be spelt right, otherwise Python doesn't know what you're talking about
* method call: like a function call but with `variable.` in front:
  VARIABLE_NAME.METHOD_NAME(PARAMETERS)
* if statement: if CONDITIONAL: BLOCK
* conditional: LEFT OPERATOR RIGHT
  - number > biggest
  - number <= 10
  - 'x' in string
* compound conditional: LEFT and RIGHT, LEFT or RIGHT
  - number >= 10 and number <= 100
  - word.endswith('s') and word != 'sheep'


Variable names vs functions
---------------------------

I noticed some of you wrote things like this in your homework:

    numbers = []
    number = int(input('Type a number: '))
    numbers.append(input)

But what is `input` here? Remember, variables are names that you make up, Python doesn't care as long as you spell it the same way each time. Assigning a variable like `x = 1234` says "remember this number for me, and call it `x`".

However, some functions, like `int()` and `range()` and `input()` are built in -- these are *not* names you make up, so you have to spell them and use them according to the rules of Python.


Dictionaries
------------

Last week we learned about the `list` data type, a "container" that can hold a bunch of other values in an ordered list. Today we're going to learn about another container data type: the `dict`, or dictionary. A dict holds other values too, but in a mapping of key-value pairs. What does that mean? Let's see:

    ages = {
        'Ben': 35,
        'Lauren': 16,
        'Brandon': 17,
        ...
    }

Each item in a dictionary is a key-value pair. Here the key is a string (a person's first name) and the value it corresponds to is an integer (their age). And we've called the overall dictionary `ages`.

Just like an English dictionary, you can look things up in it. Here we can look up someone's age by their first name. Here's how you do that:

    >>> ages['Ben']
    35

But what about this?

    >>> ages['Billy']
    ... KeyError ...

We can also check whether a key is in the dictionary or not:

    >>> 'Ben' in ages
    True
    >>> 'Xyz' in ages:
    False
    >>> if 'Brandon' in ages: print("We have Brandon's age!")
    We have Brandon's age!

To put something new in a dictionary, how do you think we do that?

    >>> ages['Newguy'] = 20
    >>> ages['Very New Guy'] = 10


Homework
--------

Your homework for next time is two things:

1) Do part of an online Python tutorial that I'll send you next week.

2) Write a program that uses a dictionary to get the counts of unique words in some input that you type. You can use the `string.split()` function to split a string into a list of words. For example:

    Type some text: the box the fox the camel on the fox
    the 4
    fox 2
    box 1
    camel 1
    on 1
