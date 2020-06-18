---
layout: default
title: "Session 7: Control Structures"
permalink: /programming-class/07-control-structures/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">January 2017</p>

> These are my "teaching notes" for the seventh session of my [Computers and Programming Class](/programming-class/).


Conditionals: the `if` statement
--------------------------------

The most basic control stucture is the `if` statement. It tells Python to only run the following code block "if" something is true. If it's not true it'll skip it and jump till the end of the code block.

Here's an example:

    noun = input('Type a noun: ')
    if noun.endswith('s'):
        print('Plural!')

What do you think the above program does?

You can get more complicated and have an `else` -- the first block is executed "if" it's true, "else" the other block is executed:

    number = int(input('Type a number: '))
    if number == 100:
        print('You typed ONE HUNDRED!')
    else:
        print('Boring, you just typed', number)

Okay, now what if we have a bunch of things to try in succession -- enter `elif`. This is just short for "else if", and does what you expect:

    number = int(input('Type a number: '))
    if number == 1:
        print('first')
    elif number == 2:
        print('second')
    elif number == 3:
        print('third')
    elif number <= 20:
        print(number, 'th', sep='')
    else:
        print("Sorry, can't do", number)


Loops: the `for` loop
---------------------

TODO: Fizzbuzz


Loops: the `while` loop
-----------------------

TODO: Guessing game
