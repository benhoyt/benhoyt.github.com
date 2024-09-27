---
layout: default
title: "Ten quirky things about Python"
permalink: /writings/ten-python-quirkies/
description: "Ten quirky things about Python"
canonical_url: https://blog.brush.co.nz/2008/01/ten-python-quirkies/
---
<h1>Ten quirky things about Python</h1>
<p class="subtitle">January 2008</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2008/01/ten-python-quirkies/)


<p>Just thought I’d share a bunch of neat (and weird) things I’ve noticed about the <a href="http://python.org/">Python programming language</a>:</p>

<ul>
<li>You can <a href="http://docs.python.org/ref/comparisons.html">chain comparisons</a> as in <code>assert 3.14 &lt; pi &lt; 3.15</code>. It’s a neat equivalent of <code>assert pi &gt; 3.14 and pi &lt; 3.15</code> that you can’t do in most other languages.</li>
</ul>

<p><a href="http://python.org/" title="Go to the Python home page"><img style="width:auto" alt="Python Logo" class="right" height="75" src="/images/brushblog/2008_01_pylogo.png" width="75"/></a></p>

<ul>
<li><p>Ints don’t overflow at 31 (or 32) bits, they just get promoted to longs automatically. And long in Python doesn’t mean 64 bits, it means arbitrarily long (albeit somewhat slower). In fact, it looks like in Python 3000 <a href="http://www.python.org/dev/peps/pep-0237/">there won’t even be the int/long distinction</a>.</p></li>
<li><p>Default values are only evaluated once, at compile-time, not run-time. Try <code>def func(A=[]): A.append(42); return A</code> and the A-list will grow between calls. The Python tutorial <a href="http://docs.python.org/tut/node6.html#SECTION006710000000000000000">has more</a>.</p></li>
<li><p><span id="strcat">When</span> concatenating strings, <code>''.join(list)</code> is <a href="http://www.skymind.com/~ocrow/python_string/">much faster</a> than <code>for x in list: s += x</code>. In fact, the <code>join</code> is O(N) whereas the <code>+=</code> is O(N²). There’s been a <a href="http://mail.python.org/pipermail/python-dev/2004-August/046686.html">lot of debate</a> about making this faster, and it looks like it <a href="http://svn.python.org/view/python/trunk/Python/ceval.c?rev=36830&amp;view=diff&amp;r1=36830&amp;r2=36829&amp;p1=python/trunk/Python/ceval.c&amp;p2=/python/trunk/Python/ceval.c">should be faster in Python 2.5</a>, but <a href="/wp-content/uploads/2017/10/2008_01_strcat.py_.txt">my tests</a> show otherwise. Any ideas why?</p></li>
<li><p>The syntax of <code>print &gt;&gt;file, values</code> is just plain weird. Not to mention the spacing “features” of <code>print</code>. I’m glad to hear that for Python 3000 they’re making print a function, and one with <a href="http://www.python.org/dev/peps/pep-3105/">more sensible habits</a>.</p></li>
<li><p>You can create a one-element tuple with <code>(x,)</code>. Tuples are normally written <code>(x, y, z)</code>, but if you go <code>(x)</code> Python sees it as just a parenthesised value.</p></li>
<li><p>And for all those times you reference methods of integer literals, you can go <code>(5).__str__</code>. You’d think it’d be just <code>5.__str__</code>, but the parser thinks the <code>5.</code> is a float and then gets stuck.</p></li>
<li><p>You can use <a href="http://docs.python.org/lib/built-in-funcs.html#l2h-57">properties</a> instead of getter and setter functions. For <a href="http://pyserial.sourceforge.net/">example</a>, <code>serial.baudrate = 19200</code> can set <code>serial._baud</code> as well as running some code to set your serial port’s bit rate.</p></li>
<li><p>An <a href="http://docs.python.org/tut/node6.html#SECTION006400000000000000000"><code>else:</code> clause</a> after a <code>for</code> loop will be executed only if the loop doesn’t end via <code>break</code>. Quite useful for search loops and the like — in other languages you often need an extra test after the loop.</p></li>
<li><p>You tell me yours. Ha! You thought you were going to escape. :-)</p></li>
</ul>



<h2>Comments</h2>

<h3>she <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 22:28</span></h3>

<p>i am sure people will come and dont like you for showing quirks, but then again nothing can beat critique in the same spirit like C++ FQAs to C** FAQs ;)</p>

<h3>JJM <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 22:29</span></h3>

<pre><code>def f1(b): 
    if b:
        return 1
    else:
        return 0

def f2(b):
    return 1 if b else 0

def f3(b):
    return b and 1 or 0

def f3bug(b):
    return b and 0 or 1
    # must use f1 or f2 idiom because bool(0) == False</code></pre>

<h3>JJM <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 22:31</span></h3>

<p>whitespace? quirk? nah</p>

<h3>RMD <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 23:14</span></h3>

<ul>
<li>Bool values are actually strange integers. </li>
</ul>

<pre><code>&gt;&gt;&gt; a==b
True
&gt;&gt;&gt; a+b
2</code></pre>

<p>So you think a and b are ones? Ha, ha!</p>

<pre><code>&gt;&gt;&gt; str(a)==str(b)
False      &lt; ---- quirk!!! :-)
&gt;&gt;&gt; a
1
&gt;&gt;&gt; b
True</code></pre>

<p>... surprise!</p>

<ul>
<li>It gets even quirkier when you mix bools and ints as dictionary keys:</li>
</ul>

<pre><code>&gt;&gt;&gt; a,b = {},{}
&gt;&gt;&gt; a[True], b[1] = 1, 1
&gt;&gt;&gt; a[1] , b[True] = 42, 42
&gt;&gt;&gt; a, b
({True:42}, {1:42})</code></pre>

<p>Quirky!</p>

<h3>rt <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 23:22</span></h3>

<p>Actually for creating tuples it is the comma that decides it not the parentheses plus comma e.g.</p>

<pre><code>&gt;&gt;&gt; x = 1,
&gt;&gt;&gt; x
(1,)
&gt;&gt;&gt; len(x)
1</code></pre>

<h3>JM <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 23:53</span></h3>

<p>Whitespace supports spaces, tabs or… a mix of both.</p>

<h3>perl hacker <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 23:53</span></h3>

<p>Yay – nice to see that there are some of the coolest features of perl in python :)</p>

<h3>JM <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 23:55</span></h3>

<p>Provides access to real threads but… the GIL only allows one thread (in most cases) to execute at a time.</p>

<h3>ajordan <span style="padding-left: 1em; color: #bbb;">16 Jan 2008, 23:58</span></h3>

<p>A variable is defined outside a function and used in several places within that function. Now, if you do one assignment of that variable within the function to something of a different type, the type of the variable changes for all uses within the function, even the ones before the assignment! I call that “spooky action at a distance”.</p>

<h3>Alfie <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 00:22</span></h3>

<p>Perl can also do For::Else ;p</p>

<p><a href="http://search.cpan.org/dist/For-Else/lib/For/Else.pm" rel="nofollow">http://search.cpan.org/dist/For-Else/lib/For/Else.pm</a></p>

<h3>JJM <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 01:47</span></h3>

<p>@rt: dicts can only use hashable types as keys.</p>

<pre><code>id(1) != id(True)
hash(1) == hash(True)</code></pre>

<h3>Justin <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 01:54</span></h3>

<p>In fact, you don’t even need parenthesis to make a tuple — the comma defines a tuple.  </p>

<p>So, this produces a tuple of length 1 as well:</p>

<pre><code>1,</code></pre>

<p>Tuples are defined by the comma, not by the braces :-)</p>

<h3>David <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 02:28</span></h3>

<p>If you want to print WITHOUT a newline you can just add an extra comma after the arguments to ‘print’.
Examples.</p>

<pre><code>print 'Hello'
print ', World'
# Will end up on TWO lines.</code></pre>

<pre><code>print 'Hello', # &lt;-- notice the comma
print ', World'
# Will end up on ONE line.</code></pre>

<h3>Jonathan Mark <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 03:27</span></h3>

<p>(1) The depth limit, normally 500, on recursions.</p>

<p>(2) The need to pass ‘self’ as a parameter when calling an object’s member functions.</p>

<p>(3) The leading and trailing double underscores look funny.</p>

<p>(4) One-line lambdas but no anonymous blocks as in Ruby.</p>

<h3>Peter <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 03:48</span></h3>

<p>How about this one?</p>

<pre><code>import decimal
x = decimal.Decimal(1)
x &lt; 2.0   # returns False!</code></pre>

<h3>Joe <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 04:09</span></h3>

<p>Hey what does python say is 4 divided by 5?  0</p>

<p>How many underscores does it take to create a basic class?  4 for each item</p>

<p>How many orders of magnitude slower is python than Java or C++? 1-2</p>

<p>How many drag &amp; drop gui designers and IDEs are there for python similar in class to Visual Studio, Netbeans, or Eclipse?  0</p>

<h3>Shannon <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 05:04</span></h3>

<p>How can “for x in list: s += x” be O(n^2)?  Seems rather unlikely…</p>

<h3>paddy3118 <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 05:07</span></h3>

<p>Some of the quirks, I too would say are quirks. Some in fact are under review/changed in Python3.0; but some are just the consistent way that Python does things that may not be the same as other languages, such as dividing two integers to produce an integer –  why not?
How many orders of magnitude slower is Java or C++ development compared to python?  1-2 ;-)
How many drag &amp; drop 500Mb GUI designers  IDE’s and repetitive code generators are required for Python development?  – None!</p>

<h3>SB <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 05:13</span></h3>

<p>Joe, some of your comments are misleading.  Care to provide examples / explanations?</p>

<h3>Reggie Drake <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 05:28</span></h3>

<p>Closed over variables are (unintentionally, it seems) read-only. Say you want to write a function that creates a counter function, something like this:</p>

<pre><code>def makeCounter():
    current = 0
    def counter():
        current += 1
        return current
    return counter</code></pre>

<p>Because assigning to a variable will create that variable in the current scope (unless declared global), <code>current += 1</code> will create a new variable (and then complain that it is unbound), instead of using the existing variable in the parent scope.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 06:37</span></h3>

<p>Great comments, guys. Peter, that Decimal quirk sure is quirky!</p>

<p>Sorry about the code formatting, guys — I’ve fixed up a bunch of them. I’m using WordPress with PHP Markdown, but the combo isn’t exactly perfect (understatement).</p>

<p>In my tests it looks like you can insert nice code, but you have to precede it with a normal text sentence/paragraph and then a black line. (Oh, and each code line prefixed with 4 spaces, as per markdown syntax.) Let’s try it:</p>

<pre><code># there was a blank line just above this
def square(n):
    return n * 2
</code></pre>

<h3>Paddy3118 <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 06:47</span></h3>

<p>You can store function state in function attributes .</p>

<pre><code>def makeCounter():
    def counter():
        counter.current += 1
        return counter.current
    counter.current = 0
    return counter</code></pre>

<p>Although most people would use a class in Python.</p>

<p>— Paddy.</p>

<h3>abhik <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 07:10</span></h3>

<p>About string concatenation:</p>

<p>python strings are immutable. So when you do “for x in list: s+=x” a new string is created len(list) times. ”.join(list) only creates a string once. I don’t quite see how the first case is O(n^2) though. They’re both O(n) in terms of number of concatenations but the first case involves many more mallocs.</p>

<h3>omegian <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 07:24</span></h3>

<p>O(n^2) because the memory allocations go like this:
1
12
123
1234
12345
123456
1234567
12345678</p>

<p>As you can see, memory foot print grows quadratically:
O(n(n-1)/2) = n^2</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 07:45</span></h3>

<p>Omegian, yeah, that’s right. Though isn’t the speed related more to the “copying footprint” than the memory footprint? Allocating the memory isn’t the N^2 part, but the copying is.</p>

<p>When you do <code>''.join('a' for i in range(N))</code> it has to copy only <code>N</code> bytes. But when you do <code>for i in range(N): s += 'a'</code> it has to copy <code>1+2+3+...+N</code> bytes = O(N^2) bytes, as you’ve calculated for the memory footprint.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 08:52</span></h3>

<p>Inspired by <a href="http://programming.reddit.com/info/65mm7/comments/c02wx3a" rel="nofollow">keernerd’s comment</a> on programming.reddit, “<code>{}.get</code> as switch” could be quite a useful construct, for things like:</p>

<pre><code>for i in range(5):
    print {0: 'no things', 1: 'one thing'}.get(i, '%d things' % i)
</code></pre>

<p>It’s <em>fairly</em> clear, I reckon. BTW, some of the <a href="http://programming.reddit.com/info/65mm7/comments/" rel="nofollow">other comments</a> over at reddit are pretty interesting, too.</p>

<h3>Tom <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 09:51</span></h3>

<p>This page has been added to <a href="http://techze.us" rel="nofollow">TechZe.us</a>.  Feel free to submit future content to the list.</p>

<h3>Sven Helmberger <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 12:08</span></h3>

<p>@Joe:
1. in ipython:</p>

<p>4/5 is 0</p>

<p>divides an integer number by an integer which gives 0 in most programming languages.. one migh argue that / should convert to float but I’m not sure if that would work..</p>

<p>4./5 is 0.80000000000000004
shows the usual float representation bugs</p>

<ol>
<li><p>syntax nitpicking?</p></li>
<li><p>psyco can speed up python, c extensions can speed up python, jython should be comparable in speed to similar java code.. but speed is usually not the reason you go for python…</p></li>
<li><p>wxglade.. glade.. and i bet there are others..</p></li>
</ol>

<h3>Peter Hosey <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 18:48</span></h3>

<blockquote>
<p>There’s been a lot of debate about making this faster, and it looks like it should be faster in Python 2.5, but my tests show otherwise. Any ideas why?</p>
</blockquote>

<p>Because the optimization only applies to string literals (<code>'foo' + 'bar' + 'baz'</code>). If you add to a non-literal, such as a variable containing a string, you don’t get the optimization.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 19:57</span></h3>

<p>Hi Peter, if you look at the <a href="http://mail.python.org/pipermail/python-dev/2004-August/046686.html" rel="nofollow">Python-dev discussion</a> and at the <a href="http://svn.python.org/view/python/trunk/Misc/NEWS?rev=36830&amp;view=diff&amp;r1=36830&amp;r2=36829&amp;p1=python/trunk/Misc/NEWS&amp;p2=/python/trunk/Misc/NEWS" rel="nofollow">changelog</a> and <a href="http://svn.python.org/view/python/trunk/Python/ceval.c?rev=36830&amp;view=diff&amp;r1=36830&amp;r2=36829&amp;p1=python/trunk/Python/ceval.c&amp;p2=/python/trunk/Python/ceval.c" rel="nofollow">patch</a>, it seems clear that <code>s=s+t</code> and <code>s+=t</code> are the cases it speeds up, not actually the string literal case you mention. So I guess I’m still stuck as to why my Python 2.5.1 doesn’t do <code>s+=t</code> in linear time … :-)</p>

<h3>Reid <span style="padding-left: 1em; color: #bbb;">17 Jan 2008, 22:29</span></h3>

<p>For loops and if blocks don’t create their own scope. i.e.:</p>

<pre><code>ls = []
for x in range(5):
    ls.append(lambda: x)

for l in ls:
    print l(),</code></pre>

<p>Writes: 44444. You would expect: 01234</p>

<p>This is because for loops don’t create their own scope, and when you create the lambda, it keeps a pointer to x, which is the same x as all the others.</p>

<h3>arkanes <span style="padding-left: 1em; color: #bbb;">18 Jan 2008, 10:31</span></h3>

<p>Continual string appending is still O(N^2), the optimization just gives a (significant) constant factor speedup. </p>

<p>It still has to do a resize and a reallocation for every string append, what the optimization does is save the destruction of the old string object and the creation of a new one. Try using a global instead of the local (so something else holds a reference to it and the optimization can’t be used) to see the difference.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">18 Jan 2008, 10:43</span></h3>

<p>Ah, thanks arkanes. I didn’t look at the ceval.c patch closely enough. :-( Below is a test with seconds elapsed for <code>s+=x</code> with s as a local and as a global.</p>

<pre><code>---- N = 10000
plus 0.000
plusglobal 0.063
---- N = 20000
plus 0.000
plusglobal 0.281
---- N = 40000
plus 0.016
plusglobal 1.109
---- N = 80000
plus 0.031
plusglobal 4.891
---- N = 160000
plus 0.125
plusglobal 60.797
</code></pre>

<p>So it’s not an order change, but yeah, sure is a speedup. :-)</p>

<h3>JMC <span style="padding-left: 1em; color: #bbb;">18 Jan 2008, 16:34</span></h3>

<p>some of these are pretty cool features. thanks guys!</p>

<h3>verte <span style="padding-left: 1em; color: #bbb;">24 Apr 2008, 18:38</span></h3>

<p>Jonathan Mark:
“The need to pass ’self’ as a parameter when calling an object’s member functions.”</p>

<p>You don’t need to pass it, it is passed automatically. you need to receive it. The only other way to do so is to add a new reserved keyword to the language, which is ugly.</p>

<p>Joe:
“Hey what does python say is 4 divided by 5? 0”</p>

<p>fixed in 3.0, or you can “from __future__ import division” today. use // to get integer division again. Note that the behaviour you mention is exactly how integer division works in most languages.</p>

<p>“How many drag &amp; drop gui designers and IDEs are there for python similar in class to Visual Studio, Netbeans, or Eclipse? 0”</p>

<p>While I’m not a fan of drag &amp; drop gui designers and haven’t used either, what about Glade? and… Eclipse? I’ve no doubt that there is a reasonable way to use Visual Studio with IronPython, too.</p>

<p>There are a few quirks that usually take a few mistakes for people to learn. These stem from ‘every name is a reference’, mutability, and scoping rules, mostly. For example, a = 3; b = a; a = 7 leaves b == 3. However, a = [3];b = a; a[0] = 7 leaves b == [7].</p>

<p>This is because = rebinds the left hand side to point at the object referred to on the right hand side. In the first case, a is rebound to refer at a new integer object with value 7, and in the latter case a and b still refer to the same list, but the first element of the list has been rebound to the new integer object.</p>

<p>A lot of expressiveness comes from this mechanism. You end up with no desire for an ugly ‘pointer type’, and you don’t have to worry about immutable objects like strings changing under your feet. But it seems like this trips up a lot of new Python programmers.</p>

<p>Also, name binding occurs in the local scope, so a = 3 binds the name a to 3 in the local scope. However, you can refer to and even mutate objects referred to by names in other scopes without any extra effort- eg, if a = [3] in the global scope, and in a function with no local name a, you do a[0] = 7, it will change the object referred to by the global name. Although if you use raw integers as in the above example, it will bind a new local variable a instead. To bind the global name, you will have to tell the function to treat that name global. [This is quite neat in that functions can’t accidentally trip on ‘global’ variables without knowing of their existence.]</p>

<p>[and unfortunately, what I’ve written is a bit thick for a Python beginner, although the concept is not.]</p>

<h3>tolo <span style="padding-left: 1em; color: #bbb;">15 Aug 2015, 02:12</span></h3>

<p>a = 100
b = 1000
a is 100 and b is 1000</p>

<blockquote>
<blockquote>
<p>False</p>
</blockquote>
</blockquote>

<p>a is 100</p>

<blockquote>
<blockquote>
<p>True
    b is 1000
    False</p>
</blockquote>
</blockquote>

