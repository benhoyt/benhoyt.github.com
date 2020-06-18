---
layout: default
title: "Session 14: Review Quiz"
permalink: /programming-class/14-review-quiz/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2017</p>

<style>
p.question { font-weight: bold; }
ol { list-style-type: lower-alpha; }
</style>

> These are my "teaching notes" for the fourteenth session of my [Computers and Programming Class](/programming-class/), which was a programming quiz based on the material I had already taught.


Notes for the instructor
------------------------

* Please split the class up into two teams so they can compete with each other
* Give the first question to the first team, the second question to the second team, etc
* If the team being asked the question gets it wrong, let the other team have a chance at that question
* For every correct answer, that team gets a point
* At the end of the quiz, the team with the most points wins
* When writing code on the whiteboard, write it exactly as is, with all punctuation intact
* Sometimes more than one answer kind of works -- in these cases, give the best answer; there's only one best answer


The quiz
--------

**1. What is a "computer"?**

1. Someone who computes
2. A device that adds and multiplies numbers really fast
3. A machine that can be told to follow a sequence of instructions
4. All of the above

Answer: (d). All of the above. The word originally meant a person who computes with numbers, but now we use it to mean a machine that follows instructions (a program), and most of the instructions are simply adding and multiplying numbers.


**2. What does RAM stand for?**

1. Readily Available Memory
2. Rare Art Module
3. Random Access Memory
4. Read-Actuated Memory

Answer: (c). Random Access Memory. It's called that because unlike a hard drive, the computer can access any random memory location instantly -- there's no waiting for moving parts to get into the right place to read it.


**3. Why is the programming language Python called "Python"?**

1. Because it's as slippery as a snake
2. After the British comedy show "Monty Python"
3. Because its logo is a python snake
4. Because it's good at drawing pie charts

Answer: (b). After the British comedy show "Monty Python". The original designer has quite a sense of humour, and many of the examples in the documentation are funny words or lines taken from the comedy show.


**4. How many instructions per second can modern computers execute?**

1. 50 thousand
2. 4 million
3. 2 billion
4. 10 trillion

Answer: (c). About two billion. When you see that a computer is so many gigahertz, the "giga" means billion ("mega" is million). And the "hertz" is not about pain -- it's a scientific term that means "number of times per second".


**5. What part of the computer computes and executes the instructions?**

1. The CPU (central processing unit)
2. The power supply
3. The RAM (random access memory)
4. The hard drive

Answer: (a). The CPU (central processing unit). This is the little black "chip" that does the adding and multiplying, and executes the instructions in each program. The RAM could also be considered part of the "brain" of the computer -- but it's the computer's memory, not the computation part.


**6. What are the place values in a 4-bit binary number, from right to left?**

1. 2, 4, 6, 8
2. 1, 2, 4, 8
3. 0, 1, 2, 3
4. 2, 4, 8, 16

Answer: (b). Just like decimal, the right-most place is the "one's place". Then each place to the left multiplies the value by two, so 1, 2, 4, and 8.


**7. What is the decimal value of the binary number 1101?**

1. 15
2. 7
3. 12
4. 13

Answer: (d). There's a 1 in the one's place, four's place, and eight's place, so 1+4+8, which is 13.


**8. What is the binary value of the decimal number 9? [Read answers as one-zero-zero-one, not one-thousand-and-one]**

1. 1001
2. 0111
3. 1000
4. 0101

Answer: (a). 9 is an 8 plus a 1, so there's 1 in the eight's place and in the one's place, which is 1001.


**9. What is "caching"?**

1. A programmer taking money to the bank
2. Storing a result in memory so it's quick to access next time
3. The CPU accessing a "memory bank"
4. Saving a result to disk


Answer: (b). Storing the result of a calculation or operation in memory so it's much quicker to access next time you need it. For example, some web page files are "cached" so that the website is faster to access the second time around.


**10. How do you make text bold in an HTML web page?**

1. &lt;a&gt;
2. &lt;b&gt;
3. &lt;bold&gt;
4. &lt;p&gt;

Answer: (b). HTML has many "tags", and the one to make text bold is &lt;b&gt;. Other tags are: &lt;a&gt; to make an anchor or link, &lt;p&gt; to make a paragraph, and &lt;i&gt; to make italics.


**11. What does the following Python program do? [Write the two lines of code exactly as is on the whiteboard]**

    for i in range(5):
        print(i)

1. Print the letter "i" on the screen five times
2. Print "SyntaxError"
3. Print the numbers from 0 through 4
4. Print the numbers from 1 through 5

Answer: (c). The `for i in range(5)` part makes the variable `i` count from 0 through 4. Then the `print(i)` prints the variable `i` each time around the loop. So the code prints the numbers from 0 through 4.


**12. What is a variable in Python?**

1. A name for a number, string, or other object
2. A list of words
3. Something that changes over time
4. The name "x" or "y" in a program

Answer: (a). A variable is a name the programmer gives to an object, usually a number, string, list, or dictionary. You can set the same name to refer to another object, hence it's called "vary-able".


**13. What does the "input" function do?**

1. Reads a Python program from disk and executes it
2. Gets input from a keyboard or mouse
3. Prints dots on the screen
4. Prints a string on the screen and waits for the user to type something

Answer: (d). The input function prints a "prompt" on the screen and then waits for the user to type something. It returns what the person typed as a string that you can use in your program.


**14. What does the following line of code do? [Write it on the whiteboard]**

    print(31 % 3)

1. Does nothing
2. Prints `31 % 3`
3. Prints `10`
4. Prints `1`

Answer: (d). The `%` symbol means "divide and give me the remainder". 31 divided by 3 is 10 remainder 1, so the remainder of `1` is printed on the screen.


**15. After the following line of code, what will `len(lst)` be?**

    lst = ['foo', 'bar', 42]

1. `'four'`
2. 3
3. 42
4. 4

Answer: (b). The `len` function returns the length of a list, meaning the number of items in the object. There are three items in this object, so it gives the number 3.


**16. What does the following "turtle" program draw?**

    left(180)
    for i in range(5):
        forward(100)
        left(45)

1. The letter "C"
2. A pentagon shape
3. The letter "O"
4. A square

Answer: (a). First the turtle turns 180 degrees so it's facing left. Then it repeats the following five times: go forward 100 pixels and turn left by 45 degrees. This will draw the shape of the letter "C".


**17. What does the DNS (Domain Name System) do?**

1. Routes packets across the internet
2. Gives you the IP address for a domain name
3. A system that converts domain names into digital form
4. Removes the "www" part of a domain name

Answer: (b). The Domain Name System is a global system that gives you an internet address (IP address) for a given domain name. For example, it might tell you that the IP address of www.facebook.com is 31.13.71.36.


**18. What does the following Python program do? [Write it on the whiteboard]**

    n = 1234
    if n % 2 == 0 and n < 1000:
        print('yes')
    else:
        print('no')

1. Prints `yes`
2. Prints `no`
3. Prints `yes no`
4. Doesn't print anything

Answer: (b). It prints `no`. The variable `n` is 1234, which divided by 2 gives a remainder of 0, so `n % 2 == 0` is true. But `n` is not less than 1000, so the entire "if statement" is false, because both parts have to be true due to the `and`. So it goes to the `else` part and prints `no`.


**19. What does the following program do? [Write it on the whiteboard]**

    names = {'Ben': 'Hoyt', 'Steve': 'Germoso'}
    print(names['Steve'])
    print(names['Hoyt'])

1. Prints `Steve` followed by `Ben`
2. Prints `Germoso`
3. Prints `Germoso` followed by `KeyError`
4. Prints `Steve Germoso`

Answer: (c). The first print line will look up the key `Steve` in the dictionary, fetch `Germoso`, and print it. The next print line will try to look up the key `Hoyt` in the dictionary, find that it's not there (`Ben` is a key, `Hoyt` is the value), and fail with a `KeyError`.


**20. Which one of the following is NOT a famous computer scientist?**

1. Ada Lovelace
2. Charles Babbage
3. Donald Knuth
4. Marie Curie

Answer: (d). Marie Curie and her husband were chemists, not computer scientists or programmers. Ada Lovelace was a countess who is considered the first computer programmer; she wrote a program for Charles Babbage's unfinished "difference engine", which was really a computer. Donald Knuth is a contemporary computer scientist who wrote "The Art of Computer Programming".
