---
layout: default
title: "Session 1: Introduction and History"
permalink: /programming-class/01-introduction/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">September 2016</p>

> These are my "teaching notes" for the first session of my [Computers and Programming Class](/programming-class/).


Course outline
--------------

Today I'll introduce the course and introduce myself, I'll talk about what computers are at a basic level, and I'll give you a bit of history on when and how they were invented.

In the five sessions after this week here's what we'll be doing:

* Next time we'll take a computer apart and look at all the different components inside and talk about how they work: like the main processor, memory, the hard disk, etc.
* In the third session we'll look at ones and zeros: the binary number system and a bit of computer math.
* In session four we'll talk about networks and the internet, and what happens when you go to a website.
* In session five we'll look at *software* and write our first computer program.
* In session six we'll dive deeper into programming languages and start looking at Python, which is the main programming language we'll use for the rest of the course.

That will bring us through to the end of the year, around Christmas. Next year we have ten more sessions where we'll really learn how to program using the Python language. We'll create our own little graphical game in Python, probably our own version of Tetris of Space Invaders or something like that.

In the last session we'll look briefly at GitHub, one of the main sites people use to store and record the history of their computer programs. We'll even build a small website using GitHub Pages.


Expectations
------------

So, what are my expectations for you? Well, first of all -- this class is going to be quite hard. Not impossible, but challenging. You all signed up for this because you have some interest in computers or programming. So do I. In fact, I really love programming and want you to catch something of how cool it is to be able to tell a computer what to do.

I've put a fair bit of time into preparing for this course, so I expect you to pull your weight too. Every week I'll give you some homework. For the first part of the course it won't be much, but next year when we're really getting into the meat of programming there will be an assignment that will take you a couple of hours. But co-op is only every second week, so I don't think one hour of homework each per is too much to ask.

I want to make this real, so there will be consequences if you don't do the work: if you miss the class or the homework you'll get a warning the first couple of times, and if you miss four times, you may be kicked out of the class (and that's standard EACHE policy). You don't necessarily have to get the homework right or even finish it, but you have to show a reasonable attempt. And to keep you motivated there'll be small prizes every week for the three people who do the best homework.

So those are my expectations. But we've got a lot of fun stuff ahead of us, and I think you'll really enjoy the course. Fair enough?


About me
--------

First I want to tell you a bit about myself and how I got into computers and programming.

My Dad has always been into computers as a hobby (and sometimes as a job): in the 1980's he built his own computers. And that wasn't like putting them together out of a couple of off-the-shelf components today ... you would read books, make your own circuit boards, use a little "wire wrapping" tool to join things together. And if you got one wire wrong, it wouldn't work.

Anyway, we had computers in the house since I was a kid. I remember we had a little SEGA console that would load games off a cartridge. I played a lot of Pacman and other games. But my dad and my older brother would figure out how to program the thing.

When I was about 13 or 14, I had my own computer (an IBM 8086 PC) and started learning how to write programs. My dad helped me a lot, and in those days there was no internet, but there were BBSs or "bulletin board systems" you could dial up with your modem and download games and files and programming tutorials. I used those tutorials to make little graphical demos, and with Dad's help I even wrote my own version of the Forth programming language.

I studied electronics at college, but never really enjoyed it that much, so when I was offered a programming job after college, I took it, and have been programming for a living ever since. I got a lot better on the job, and learned a lot of the things I didn't learn at college, like how to write fast programs, how to write code that's well designed so others can read it, and I learned about "data structures" and "algorithms" (we'll talk about those later on in the course).

Now I work at TripAdvisor, the hotel and travel website. I work for a group called Jetsetter, and write code that helps power their website, process images, and control their databases.

I like simple but powerful programs, well-written code, and I really like the Python programming language, which we'll learn about later in this course.


What are computers?
-------------------

A computer is a device that can add and multiply numbers really fast, and can be told to follow a sequence of such instructions called a *program*. Today, all computers are made using electronics, with millions of transistors packed onto a tiny microprocessor or "chip".

Everything your computer does is manipulate numbers, over and over, really fast, and it never gets bored. It does this following a *program*, which is just a list of instructions that tells the computer what to do. Here's an example of a really simple program that prints out all the odd numbers from 1 to 99:

        mov     rax, 1
    again:
        push    rax
        call    print_number
        add     rax, 2
        cmp     rax, 99
        jle     again

Here `rax` is what's called a *register* -- a memory location inside the microprocessor that can hold a single number. Don't worry too much about the specifics like `push` and `call`, but we're starting with the `rax` register set to 1, and then we have a repeated block that it's doing again and again. Each time we print the number, then add two to it, compare it with 99, and jump back to the top (the `again:` label) if it's less than or equal to 99.

That little program is written in *assembly language*, the natural language of the computer, it's "mother tongue" if you like. There are other computer languages that are much easier for people to write, and then they're translated into assembly language before they're run. We're going to be using a language called *Python* later in this course. The same program would look like this in Python:

    for i in range(1, 100, 2):
        print(i)

For a computer, letters are numbers, pictures are lots of numbers, movies are lots and lots and lots of numbers -- everything on your computer has been turned into numbers, because that's the only thing a computer can understand. How do you think letters can be numbers? What about pictures?

What are some examples of computers?

And that's your homework for next session, a very easy assignment: you have to go home and count the number of computers in your home. Not just laptops and mobile phones, but the total number of devices that have computers in them. For example, your TV, or your microwave. Write each down on a piece of paper, like "1. Dad's laptop; 2. TV in basement; etc". And next time the three people who've got the most computers will win a prize.

How can you tell if something has a computer or not? For example, does your oven have a computer in it? Your toaster?


Computer history
----------------

Now for a bit of computer history. When do you think the first computer was invented?

Originally the term *computer* referred to a person who could compute, who could calculate the answer to math equations. However, computers as we know them (*machines* that compute) were really invented starting in the 1800's.

Around 1820, a man named Charles Babbage designed an intricate mechanical computer -- a computer made from gears and wheels and things. He called it the "difference engine" and started building it, but for various reasons never finished. In the 1840's, he designed version two, and made intricate drawings and plans for it, but it was never built, because he couldn't get enough money to pay for it. Interestingly, in 1991 (just a few years ago), the Science Museum in London reconstructed the "difference engine" machine exactly from his drawings, and it worked. It performed a math calculation on a 31-digit number, which is quite a lot of digits even for today!

A woman named Ada Lovelace (she was a countess, in fact) helped Charles Babbage in his work. In fact, she wrote down the first program for Babbage's computers, so in a real sense she was the first computer programmer. She died when she was only 36 years old.

Then in 1880 the United States had a census (the U.S. has one every 10 years), and because of how many new people had moved to the States, counting all the people's info by hand took seven years. And they estimated that for the next census it would take 13 years to count!

An engineer named Herman Hollerith, who worked for the government, decided there must be a better way, and he designed a "tabulating machine" which was used to help count things for the 1890 census -- it saved the government tons of time and money.

Hollerith went on to start a business making tabulating machines: they were simple computers that could count things quickly. They read the information off "punch cards" ... and in my backpack I have an authentic IBM punchcard with real data on it from the 1970's. Anyone using a computer up till about 1970 would have seen hundreds of these.

So computers are older than you think!

The first electronic computer was called the ENIAC, or Electronic Numerical Integrator And Computer, built in 1946 at the University of Pennsylvania. This was before transistors were invented, so it was built using 17,000 vacuum tubes and was about 100 feet long.

"Vacuum tubes" were electronic switches that looked kind of like light bulbs -- they were large and used a lot of power. In 1947 the transistor was invented, and then in 1955 the first computer was built that used transistors. It was *much* smaller than the ENIAC and used about 1/1000th of the power.

The first commercial computers were used mostly by governments, universities, and banks, and were called *mainframes*. These were usually the size of a small room. 

Then in the mid-1960's came *minicomputers*, which were a bit smaller than mainframes, but still the size of a large cabinet. These were more affordable for smaller companies -- they "only" cost about $20,000 of 1970's money.

Then in the 1980's came the *microcomputers*, small computers about the same size as a home computer today. These were also called "personal computers" or PCs. Probably the two most famous personal computers are the Commodore 64 and the IBM PC in the early 1980's -- components that descend from the IBM PC are still used in desktops and laptops today.

In the late 1990's came computers that you could hold in your hand, often called PDAs ("personal digital assistants"), and it wasn't too long after that that we started seeing the modern day *smartphone*: Nokia phones, the BlackBerry, and finally the iPhone and Android phones that we use today.

One thing I should mention is how computer speed increased over time: going from two punch cards per second for an IBM tabulating machine in the early days, to two billion instructions per second today (when you see something like "2.4 GHz" on the specs for a computer, that's roughly what it means). Here's a chart that shows very roughly how computers have gotten ten times faster every two years -- note that this is not 100% accurate, but it's pretty close:

* 1920: 2 (instructions per second, or "Hertz")
* 1930: 20
* 1940: 200
* 1950: 2000 (2 kilohertz)
* 1960: 20,000
* 1970: 200,000
* 1980: 2,000,000 (2 megahertz)
* 1990: 20,000,000
* 2000: 200,000,000
* 2010: 2,000,000,000 (2 gigahertz)

Of course, there's a ton more to the story (like floppy disks, "cathode ray tube" screens, DVDs, USB, etc), but that's a very brief timeline.


Re-iterate homework
-------------------

So remember your homework: list down all the computers in your home on a piece of paper, and bring that to class next week. Not just laptops and phones, but every device with some kind of computer inside it.

Thanks guys. See you next time!
