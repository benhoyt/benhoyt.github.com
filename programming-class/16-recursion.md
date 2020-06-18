---
layout: default
title: "Session 16: Recursion"
permalink: /programming-class/16-recursion/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">May 2017</p>

> These are my "teaching notes" for the sixteenth and last session of my [Computers and Programming Class](/programming-class/).


Basic recursion
---------------

To define and name a function, we use "def":

```python
def multiply(n):
    return n * (n - 1)
```

And then if we call `multiply(5)` what would it return? Yep, it would calculate `5 * (5 - 1)` or `5 * 4`, which is 20, and give us that.

But what would happen if we call the very function we're defining?

```python
def multiply(n):
    return n * multiply(n - 1)
```

Then something like `multiply(3)` would try to calculate:

```python
3 * multiply(3 - 1)
3 * 2 * multiply(2 - 1)
3 * 2 * 1 * multiply(1 - 1)
3 * 2 * 1 * 0 * multiply(0 - 1)
3 * 2 * 1 * 0 * (-1) * multiply(-1 - 1) ...
...
```

It would start multiplying them out, but then never finish, because it's defined in terms of itself. It's like defining a word in the dictionary using the word -- for example, imagine if you looked up "vehicle" in the dictionary and it said, "noun. A vehicle that takes people places."

This is called recursion, and it's a *very* useful concept in computer programming, but we are missing one thing above -- the "termination condition". In other words, when to stop.

What if we told it to finish when n was 1? Let's try that:

```python
def multiply(n):
    if n == 1:
        return 1
    else:
        return n * multiply(n - 1)
```

Then if we do `multiply(3)` it would calculate:

```python
3 * multiply(3 - 1)
3 * 2 * multiply(2 - 1)
3 * 2 * 1
3 * 2
6
```

Or what about `multiply(4)`?

```python
4 * multiply(4 - 1)
4 * 3 * multiply(3 - 1)
4 * 3 * 2 * multiply(2 - 1)
4 * 3 * 2 * 1
4 * 3 * 2
4 * 6
24
```

This function is actually an important mathematical function that you'll learn about if you take math in college. It's called "factorial". From what we've just seen, can someone explain to me in their own words what the factorial of a number is? For example, the factorial of 4.

Okay, so how do we translate the kind of funky recursive way to write `factorial` into a straight-forward loop? Let's try it with a for loop:

```python
def factorial(n):
    result = 1
    for i in range(n, 1, -1):
        result = result * i
    return result
```

Fibonacci
---------

[Only do this if there's going to be time for sorting.]

Let's try another mathematical thing: the fibonacci series. A series in math is simply a sequence of numbers where the next number is calculate from the previous numbers in a certain way. The fibonacci series is defined to start with 1 and 2, and then each further number in the sequence is the sum of the previous two:

    1, 2, ...
    1, 2, 3, 5, 8, 13, 21, ...

Again, this is a really important sequence in mathematics. Let's try to define it using recursion:

```python
def fib(n):
    if n <= 2:
        return n
    else:
        return fib(n - 2) + fib(n - 1)
```

What happens if we ask for `fib(5)`?

```python
fib(3) + fib(4)
fib(1) + fib(2) + fib(4)
1 + 2 + fib(4)
3 + fib(4)
3 + fib(2) + fib(3)
3 + 2 + fib(3)
5 + fib(3)
5 + fib(1) + fib(2)
5 + 1 + 2
8
```

This recursive definition of factorial is kind of cute, but it's making the computer do a fair bit of extra work. Is there a way to do this without recursion using a `for` loop? [Let them try]

```python
def fib(n):
    if n <= 2:
        return n
    previous = 1
    current = 2
    for i in range(n - 2):
        temp = current
        current = previous + current
        previous = temp
    return current
```


Sorting
-------

Let's say we have a list of numbers, like this:

```python
numbers = [5, 0, 10, 3, 9, 4]
```

And we want to put it in sorted order, like this:

```python
[0, 3, 4, 5, 9, 10]
```

Well, there's a built-in function in Python called `sorted()` that does just that. But how does that function work? If `sorted()` didn't exist, how would we write it ourselves?

Consider a stack of shuffled cards. How would you sort it? [Solicit answers.]

There are many different ways for computers to sort things. In fact, books have been written on the subject. And most of them are recursive. We're going to look briefly at what's called *merge sort*. Here's how you do a merge sort:

1. If there's only one card in the pile, you're done.
2. Otherwise, split the pile into two, A and B.
3. Use merge sort to sort pile A.
4. Use merge sort to sort pile B.
5. Merge the two sorted piled together, keeping them ordered.

So you can see step 1 is the "termination condition" -- it tells you when to stop. Step 2 breaks the task in two halves. And step 3 and 4 are the mind-bending steps: they're telling you that one of the steps in a merge sort is doing a merge sort. It's like a dictionary using a word in its own definition!

[Do this with a pack of cards.]

What would code for this look like? Let's try it:

```python
def sort(lst):
    if len(lst) <= 1:
        return lst[:]                       # step 1
    else:
        half = len(lst) // 2                # step 2
        a = lst[:half]
        b = lst[half:]
        sorted_a = sort(a)                  # step 3
        sorted_b = sort(b)                  # step 4
        merged = merge(sorted_a, sorted_b)  # step 5
        return merged

# They don't really need to see this
def merge(a, b):
    result = []
    i = 0
    j = 0
    while i < len(a) or j < len(b):
        if i < len(a) and (j >= len(b) or a[i] < b[j]):
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    return result
```

That's all folks!
