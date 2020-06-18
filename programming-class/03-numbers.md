---
layout: default
title: "Session 3: Numbers, Binary, and Computer Math"
permalink: /programming-class/03-numbers/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">October 2016</p>

> These are my "teaching notes" for the third session of my [Computers and Programming Class](/programming-class/).


Everything (digital) is a number
--------------------------------

Computers do everything using numbers: in the [first lesson](../01-introduction/) we looked at how letters and punctuation can be represented as numbers (A = 65, B = 66, etc), and also how images might be represented as lists of numbers. Once you've converted something to numbers, you can use a computer to process it. What is the name for "converting something to numbers"? (Digitizing.)

What do you think you can't represent as numbers? (Physical objects -- you can't turn a hamburger into numbers. Emotions. Wisdom. Intelligence -- maybe?)

So how do computers represent numbers? Using the binary number system, zeros and ones. And in the electronic components -- the CPU we looked at last week -- these zeros and ones get converted into electrical signals: 5 volts means one, 0 volts means zero.


Binary numbers
--------------

So the binary number system, or simply *binary*, uses only two digits: 0 and 1. What's the regular number system that we use called? How many digits does it have? What are the digits? (Decimal, 10, 0 through 9.)

Binary is just like decimal, but simpler, because there's only two digits instead of ten. Decimal is sometimes called *base 10* because there are 10 digits and the "basic unit" is 10. Binary is base 2.

With decimal you have a 1's place (the number of 1's), a 10's place (number of 10's), 100's place, etc. With binary you also start with a 1's place, but then what do you think is next? The 2's place. What next? 4's. Next?

So here's an example binary number, and we're going to decode it in a bit:

    01011010

This is an 8-digit binary number. A BInary digiT is also called a *bit*, and an 8-bit number is called a *byte*, probably the most common number size, and the unit that's used to measure amounts of memory. For example, a kilobyte or KB is 1000 bytes -- how many bits?

Anyway, back to our example number, 01010011. The first thing to notice is that binary numbers are usually written with "leading zeros" on the left to make them a certain width (in this case 8 bits). Decimal numbers are sometimes written like this too, for example a zip code of 07034. You can write that as 7034 as well, and it's the same number, but especially in computing it's often nice to make things the same width.

First let's decode a decimal number with the place values -- we don't usually do this, but this is actually what the number means. Take 07034 for example:

    10000 1000  100   10    1
    -------------------------
        0    7    0    3    4

So there are no ten thousands, 7 thousands, no hundreds, 3 tens, and 4 ones. Seven thousand and thirty-four. Or you could say "seven thousands and thirty and four", or 7000 + 30 + 4, and you add them together and you get the number, 7034.

So let's write our binary number again, but with the binary place values shown:

    128 64 32 16  8  4  2  1 
    ------------------------
      0  1  0  1  1  0  1  0

So how many 128's are there? How many 64's? How many 32's, 16's, 8's, 4's, 2's, and 1's? Who wants to have a go at finding out what this number is in decimal? Well, just add them all up: 64 + 16 + 8 + 2, which is 90.

Okay, so let's do another one: any volunteers? What about 01000011? (67) One more: what about 11111111? (255)

Let's go the other way now. How would we turn 42 decimal into binary? Well, is there a 128 in it? A 64? A 32? Yep, one 32. What's left after the 32? Yep, 10, so is there a 16 in what's left? No. An 8? Yep, an 8. And what's left now. Yep, just 2, so there's a 2 in what's left, and that's it. Here's our number with the binary place values:

    128 64 32 16  8  4  2  1 
    ------------------------
      0  0  1  0  1  0  1  0

So now you know how to convert binary numbers to ordinary decimal numbers and back again!

What about computer math? For example, how do computers add or multiply two binary numbers?


Binary addition
---------------

Binary addition is just like the addition you hopefully still learn in math: you write the two numbers you're adding on top of each other, then you start at the right and add each column, carrying if you need to. In binary, you only need to carry if it's 1 plus 1, which is decimal 2 or "10" in binary. So you write a zero in the answer, and then carry the 1.

Let's add two 4-digit binary numbers, 0111 and 0100:

      0111 (7)
      0100 (4)
    + ----
      1011 (11)

Easy, right? One more, 1111 and 0001:

      1111 (15)
      0001 (1)
    + ----
     10000 (16)

Woohoo, we carried so much we went from 4-bit numbers to a 5-bit number! Now we have the smallest 5-bit number, which is 16 decimal. What's the largest 5-bit number?

Computers do this same thing but with electronic signals and transistors. Draw an example CPU diagram: arithmetic logic unit (ALU), registers, control unit. Then expand a bit on the ALU.


Hexadecimal
-----------

TODO


Binary multiplication
---------------------

TODO


Homework
--------

Your homework for next week is to write your first name in binary, using the ASCII encoding for the letters. If you go to [www.asciitable.com](http://www.asciitable.com/) you'll see a table of the punctuation, numbers, and letters, along with the number that represents them in the ASCII code. For example, big `A` is 65, big `B` is 66, little `a` is 97, etc. Each letter will be encoded as eight bits (a *byte*).

Bonus points if you then convert the binary to hexadecimal.

So for example, with my name being "Benjamin", I'd get something like this:

    B - 0100 0010 - 42 hex
    e - 0110 0101 - 65 hex
    ...

See you next time!

