---
layout: default
title: "Session 8: Lists"
permalink: /programming-class/08-lists/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">January 2017</p>

> These are my "teaching notes" for the eighth session of my [Computers and Programming Class](/programming-class/).


Recap on the homework
---------------------

Good job on the homework! It was quite hard -- your second real program. Remember, I ask this question in programmer job interviews, so if you can solve it, you're doing well.

You probably all saw those "invalid syntax" errors when trying to run your code -- unfortunately IDLE isn't very good at helping you with those. That's not Python itself, but the IDLE editor.

"Syntax" means the formatting and punctuation and spelling of your code. Computer languages aren't like human languages; they're not at all forgiving. If you don't get the spelling and punctuation and indentation just right, your code simply won't run. Well, I guess even in English punctuation is important -- some punctuation can really change the meaning of a sentence. For example, have you heard that story about the guy who was writing credits for his book:

"I thank my parents, Ayn Rand and God."

Oops. Presumably his parents weren't Ayn Rand and God. You see, you need a comma after that "Ayn Rand".

Python -- and almost all computer languages are strict like this -- simply refuses to run your program if you have the syntax wrong.

So a lot of people emailed me for help, which is great. Here are some of the common errors:

* missing colon at the end of `for` and `if` lines (before an indented block)
* wrong indentation; Python blocks work by indentation (compare to English bulleted list)
* not spelling things out, for example `if num % 3 and 5 == 0:` [that actually runs, but what does it mean?]
* logic errors, eg: putting print(num) at the start of the loop instead of in an `else` clause at the end


Lists
-----

So far we've used two main data types: numbers and strings. This week we're going to look at a new data type that's kind of special: the list. A list is what's called a container data type -- that's exactly what it sounds like, you can put other stuff in it. Let's start with a list of numbers:

    numbers = [5, 10, 15, 20]

There are a few ways to create a list, but the simplest is with square brackets around the list, and commas between the items. Now let's try to write a program to add up the numbers in the list.

[Hint: we know how to write a for loop to loop through a range(), can we loop through a list as well? And then we need to add up the numbers to get a count.]

Here's one solution:

    total = 0
    for n in numbers:
        total = total + n

Now it turns out that adding up a bunch of numbers is so common, Python already has a built-in function for it -- `sum()`. So if we need to do the above we can actually just write:

    total = sum(numbers)

But let's go back to lists. What if we want to add something to our list? There are a bunch of list "methods" that help you do things to your list.

    >>> numbers.append(25)
    >>> numbers
    [5, 10, 15, 20, 25]

Lists are extremely useful. They can hold any kind of item, for example, strings, or even a mixture of numbers and strings. Let's write a fun program to build a sentence from lists of subjects, verbs, etc. What we want to do is have the computer pick a random subject, a random verb, etc, and then print out the full sentence.

First let's think of some subjects (nouns) for our sentence:

    import random

    nouns = ['EACHE', 'the cat', 'an elephant', 'Brandon', 'Mrs Hoyt',
             'his homework', 'the fence', 'a huge tiger']
    verbs = ['sat on', 'consumed', 'forgot about', 'wrote to', 'programmed',
             'looked at', 'grumbled about']

    subject = random.choice(nouns)
    verb = random.choice(verbs)
    object = random.choice(nouns)
    print(subject, verb, object)

And now let's add a `for i in range(10): ...` to print 10 random sentences. [Run the code] Cool huh!

You can do a lot of cool stuff with lists. Index into them [go over this], find things in them, etc. [If there's time, with sum_of_squares function.]


Next week's homework
--------------------

Write a program the lets you input five numbers, appending them to a list, and then prints out the list of numbers, followed by the biggest number you type. For example:

    Type a number: 123
    Type a number: 5
    Type a number: 400
    Type a number: 5
    Type a number: 10
    [123, 5, 400, 5, 10]
    400
