---
layout: default
title: "Session 6: Introduction to Python"
permalink: /programming-class/06-intro-to-python/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">December 2016</p>

> These are my "teaching notes" for the sixth session of my [Computers and Programming Class](/programming-class/).


What is a program?
------------------

A program (at least for our purposes) is a sequence of instructions that tell the computer what to do. One kind of program is basically like a recipe: it takes some input, executes some commands using that input, and gives you some output. When you're cooking or baking with a recipe, what are the inputs? What are the commands? What are the outputs?

(Example: baking a cake. Inputs are the ingredients, you're the computer that executes the recipe's instructions, and the output is the cake! There might also be some outputs you don't care much about, like the egg shells, or the dirty dishes -- it's the same with computer programs.)

When programmers work with programs, we're dealing with the *source code*, and that's what we're going to focus on in the rest of this course. We'll be using a programming language called "Python", so the source code is simply text -- the Python commands that the computer executes when you run.

When we write a program, we'll type the text (the source code) into a file and save it out as a `.py` file, for example `my_program.py`. Then we can run the program, or execute the Python instructions, using the Python interpreter. The Python interpreter turns the Python source code into instructions the computer can understand, and then executes them.


Some elements of a Python program
---------------------------------

Here's a few lines of source code -- a complete Python program:

    print('A cool picture:')
    for i in range(20):
        double = i * 2
        print('.' * double)
    print('All done!')

(What do you think this program does?)

Explain the different elements of the program:

* keywords: `for`, `in` -- these are special words that affect the structure of the program in some way; above we have a "for loop"
* operators: `=`, `*` -- special symbols
* expressions: `i * 2`
* names: `i`, `double` -- often called *variables*, these are words you make up to name things
* functions: `print(...)` -- functions are names with parentheses around them; functions take some inputs, do something with those inputs, and produce output or give you back a value

Note that this program doesn't take any inputs, it just runs the commands which print something out on the screen (output).


Python value and data types
---------------------------

The computer itself can only deal with one kind of data: numbers. However, as we saw in previous lessons, pretty much anything can be represented as numbers: letters, text, photos, lists of things, etc. Python has several *data types* it lets you use, some of the important ones are:

    1234            # number (integer)
    12.34           # number (floating point, what often call "decimals")
    'abc'           # string of characters
    "Hello world!"  # another string (single or double quotes are the same)
    [1, 2, 3]       # list (of numbers)
    ['the', 'end']  # list (of strings)
    [0.5, 'abc', 7] # list (of different types)

There are other data types too, but we'll cover those another time.


Names ("variables")
-------------------

If you want to remember some value or calculation later, you can give it a name, or "assign" the value to a name as it's called. For example, say you want to multiply two numbers:

    256 * 256

But then you want to keep that result and use it later, maybe use it a few times. You'd assign it to a name, like so:

    big_number = 256 * 256

Note that names can't have spaces in them (this is the case in almost all programming languages). In Python, people usually make these names lowercase, and use `_` (underscore) to separate words. Names can be as long or short as you want:

    n = 16 * 16
    this_is_a_very_long_name_for_a_small_number = 1 + 1

When you're writing code, use names that make sense to you, and that will make sense to someone looking at the code later.

How do we use these names, or "variables" as they're often called? Well, simply type the name where you would otherwise type the number or value:

    bigger_number = big_number * 10
    biggest_number = (big_number + big_number) * 1000

You can also "re-assign" a name:

    n = 1
    n = n + 5
    n = n * 10

What's `n` now?


A simple program
----------------

Putting it all together, here is a simple program which lets the user type in a temperature in degrees Fahrenheit, then it converts it to Celcius and prints out the result:

    temp = input('Enter a temperature in degrees Fahrenheit: ')
    f = float(temp)
    c = (f - 32) * 5 / 9
    print('The equivalent in degrees Celcius is:', c)

(Show them some more stuff in the Python REPL, IDLE, and turtle graphics.)


Homework
--------

For next week's homework, I'd like you to do two things:

1) Download Python (version 3.5) from [www.python.org](https://www.python.org/) and install it on your computer. Python runs on Windows, macOS, and Linux.
2) Run "IDLE", the Python interpreter and editor.
3) Write a small program using IDLE to print something cool on the screen, using what you've learned today (or other stuff on the web if you like).

Once you've written the program and saved it to a file on your hard drive, please email me and include the file ("source code") as an attachment.
