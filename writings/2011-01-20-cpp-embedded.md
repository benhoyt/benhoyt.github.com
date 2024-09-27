---
layout: default
title: "Should you use C++ for an embedded project?"
permalink: /writings/cpp-embedded/
description: "Should you use C++ for an embedded project?"
canonical_url: https://blog.brush.co.nz/2011/01/cpp-embedded/
---
<h1>Should you use C++ for an embedded project?</h1>
<p class="subtitle">January 2011</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2011/01/cpp-embedded/)


<p>Recently I was asked whether to use C or C++ for an embedded project. Let’s assume a sizeable project with an ARM7-based microcontroller and roughly 16KB of RAM. Here is my answer, and I hope it’s useful for you.</p>

<p>One good reason to go with C++ might be that you have a ready team of programmers who are already fluent in it. This would be a strong pull, but if they are not fluent in the embedded world particularly, then this article may help them choose a subset of C++ suitable for an embedded environment.</p>

<p><a href="http://www.stroustrup.com/bs_faq.html#really-say-that">As the guy said</a>, C makes it easy for you to shoot yourself in the foot, but C++, being much more complex and powerful, allows you to blow your whole leg off. This is true especially in embedded situations.</p>

<p>If you’ve only used C for embedded projects, you’ll be able to get started and into the project much more quickly if you stick with C, and other people could take over more easily. You won’t spend time learning the ins and outs of C++.</p>

<p>C has the advantage of being very direct and “what you see is what you get”. For example, in C this line of code adds two numbers together:</p>

<blockquote><pre>
int x = y + z;
</pre>
</blockquote>

<p>But in C++ a very similar-looking line:</p>

<blockquote><pre>
MyType x = y + z;
</pre>
</blockquote>

<p>This calls a constructor (which could do anything), calls the + operator of y’s class which (if overloaded) could do anything, possibly throws an exception, possibly allocates memory, etc. You just don’t know, unless your coding style guide lays down the law about what you can and can’t do (more on that soon).</p>

<p>On the other hand, there are definitely some good features in C++’s favour that make programming better, especially for larger projects. Classes, namespaces, templates, scoping … but the language has a ton of powerful features as well as quirks, so when you’re embedding C++ you have to choose a subset of the language and stick with it.</p>

<p>For instance, for embedding C++ in an ARM7-sized processor, you might come up with a list something like:</p>

<ul>
<li>Use function overloading, default arguments, and references.
<li>Use namespaces and classes.
<li>Use templates for specific things X, Y, and Z.
<li>Use RAII and scoping for things like allocation, locking, etc.
<li>Use inheritance and virtual functions, but sparingly, only as required.
<li>Use C++ style casts, but not <code>dynamic_cast</code>.
</li></li></li></li></li></li></ul>

<ul>
<li>Don’t use <code>new</code>, exception on boot-up. Don’t use <code>delete</code>. Use storage pools and “placement new” where appropriate.
<li>Don’t use the STL (Standard Template Library).
<li>Don’t use exceptions or run-time type information.
<li>Don’t do operator overloading (far too many quirks and memory management problems).
<li>Don’t use friends or friend classes.
</li></li></li></li></li></ul>

<p>If you haven’t used C++ before, you’ll definitely want to learn it before getting too far in. Following some links in my C++ blog articles may be helpful here:</p>

<ul>
<li><a href="/writings/cpp-1/">C++ for C programmers, part 1 of 2</a> — the non-object oriented features</li>
<li><a href="/writings/cpp-2/">C++ for C programmers, part 2 of 2</a> — the OO features</li>
<li><a href="/writings/raii-acdc/">RAII, AC/DC, and the “with” statement</a></li>
<li><a href="/writings/protothreads/">Protothreads and C++</a> — protothreads (lightweight pseudo-threads) are useful for embedded systems</li>
</ul>

<p>That said, you can’t learn it just by reading about it, so you need to start coding.</p>

<p><b>In conclusion, for a small embedded job I’d pick C first for its simplicity, directness, and the fact more people know it. For a larger project, I’d pick C++ — it can make embedded life nicer, but only if you carefully choose a subset and have a good coding standard.</b></p>

<hr/>

<p>Further reading:</p>

<ul>
<li><a href="http://www.stroustrup.com/abstraction-and-machine.pdf">Abstraction and the C++ machine model [PDF]</a> — a paper by the creator of C++ on using C++ in embedded systems</li>
<li><a href="http://www.pdfio.com/k-1236188.html">C++ for Embedded: Dos and Don’ts [PDF]</a> — an article with some good points above moving from C to C++ for embedded code</li>
<li><a href="http://thread.gmane.org/gmane.comp.version-control.git/57643/focus=57918">Linus Torvalds’ rant on why Linux isn’t written in C++</a> — some good points, but not a level-headed discussion of the topic</li>
</ul>



<h2>Comments</h2>

<h3>todd <span style="padding-left: 1em; color: #bbb;">20 Jan 2011, 11:05</span></h3>

<p>Here’s the <a href="http://www.possibility.com/Cpp/CppCodingStandard.html#embedded" rel="nofollow">response I wrote in my coding standard</a>. The short answer is yes and it can be done quite successfully:</p>

<blockquote>
<p>Oh yes you can. I’ve used C++ on several embedded systems as have many others. And if you can’t why not? Please don’t give in to vague feelings and prejudice. An attitude best shown with a short exchange:</p>
<p>Rube: Our packet driver is slow. We’re only getting 100 packets per second.<br/>
Me: Good thing you didn’t do it in C++ huh?<br/>
Rube: Oh yah, it would have been really slow then!<br/>
Me: (smiled secretly to myself)
</p>
<p>My initial response was prompted by a general unacceptance of C++ in the project and blaming C++ for all problems. Of course all the parts written in C and assembly had no problems :-) Embedded systems shops tend to be hardware driven companies and tend not to know much about software development, thus any new fangled concepts like OO and C++ are ridiculed without verbally accessible reasons. Counter arguments like code that is fast and small and reusable don’t make a dent. Examples like improving the speed of a driver by inlining certain methods and not hacking the code to death gently roll into the bit bucket.</p>
</blockquote>

<p>Then there’s more specific recommendations.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">20 Jan 2011, 14:09</span></h3>

<p>Thanks, Todd. Those are some really helpful recommendations.</p>

<h3>Volkan YAZICI <span style="padding-left: 1em; color: #bbb;">21 Jan 2011, 02:47</span></h3>

<p>Can you elaborate your answer on «Don’t use delete. Use storage pools and “placement new” where appropriate.» phrase?</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">21 Jan 2011, 04:42</span></h3>

<p>@Volkan, sure. “Placement new” is a way of telling new not to allocate memory straight from the heap, but use a location (or memory allocation method) that you choose. This is useful for 1) allocating a hardware register-driven object at a specific memory address, and 2) using storage pools.</p>

<p>Storage pools are handy for example if you’re writing a driver for a packet-based protocol, and want to allocate packet buffers of the same size from a larger pool of memory. This means you can keep track of memory allocation/deallocation of the packets, and eliminate memory fragmentation, among other things.</p>

<p>There’s much more about this in Marshall Cline’s C++ FAQ:</p>

<ul>
<li><a href="http://www.parashift.com/c++-faq-lite/dtors.html#faq-11.10" rel="nofollow">http://www.parashift.com/c++-faq-lite/dtors.html#faq-11.10</a></li>
<li><a href="http://www.parashift.com/c++-faq-lite/dtors.html#faq-11.14" rel="nofollow">http://www.parashift.com/c++-faq-lite/dtors.html#faq-11.14</a></li>
</ul>

<h3>Coder <span style="padding-left: 1em; color: #bbb;">4 Jun 2011, 06:47</span></h3>

<p>Very interesting article, however it can be kind of confusing with all the different aspects depending on the approach or project that you are working on. Thanks for an interesting article!! :-)</p>

