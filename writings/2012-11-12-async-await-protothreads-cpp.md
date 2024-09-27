---
layout: default
title: "C#’s async/await compared to protothreads in C++"
permalink: /writings/async-await-protothreads-cpp/
description: "C#’s async/await compared to protothreads in C++"
canonical_url: https://blog.brush.co.nz/2012/11/async-await-protothreads-cpp/
---
<h1>C#’s async/await compared to protothreads in C++</h1>
<p class="subtitle">November 2012</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2012/11/async-await-protothreads-cpp/)


<p>For different parts of my job, I get to work in both high level and very low level software development — developing a Windows 8 app in C# on the one hand, and writing embedded C++ code for an microcontroller with 4KB of RAM on the other.</p>

<p>In our embedded codebase we’ve been using <a href="https://github.com/benhoyt/protothreads-cpp">our C++ version</a> of Adam Dunkels’ protothreads, and recently I noticed how similar protothreads are to C#’s new <a href="http://msdn.microsoft.com/en-us/library/vstudio/hh191443.aspx">await and async keywords</a>. Both make asynchronous code look like “normal” imperative code with a linear flow, and both unroll to an actual state machine under the covers.</p>

<p>There’s a <a href="http://stackoverflow.com/questions/4047427/visual-studio-async-ctp-how-does-it-work/4047607#4047607">great answer</a> on StackOverflow showing how the C# compiler does this (and you can read more in-depth <a href="http://msdn.microsoft.com/en-us/magazine/hh463583.aspx">here</a>). The example on StackOverflow shows that this C# code:</p>

<pre class="prettyprint"><code>async Task Demo() { 
  var v1 = foo();
  var v2 = await bar();
  more(v1, v2);
}
</code></pre>

<p>Is compiled down to something like this:</p>

<pre class="prettyprint"><code>class _Demo {
  int _v1, _v2;
  int _state = 0; 
  Task&lt;int&gt; _await1;
  public void Step() {
    switch(this._state) {
    case 0: 
      this._v1 = foo();
      this._await1 = bar();
      // When the async operation completes, it will call this method
      this._state = 1;
      op.SetContinuation(Step);
    case 1:
      this._v2 = this._await1.Result; // Get the result of the operation
      more(this._v1, this._v2);
  }
}
</code></pre>

<p>C++ protothreads unroll to state machines in a similar way. For a (slightly more involved) example, see the protothread vs the state machine examples at my <a href="/writings/protothreads/#cpp">original blog entry</a>.</p>

<p>C#’s async/await and protothreads are especially similar when using protothreads in C++, as both convert local variables to member variables so that they’re around next time the protothread is executed. In C#, of course, <code>await</code> is available at the language level, and as a result this is done automagically by the compiler. In C++, PT_WAIT is a macro whose implementation even <a href="http://en.wikipedia.org/wiki/Duff's_device">Duff himself</a> probably wouldn’t care for. And of course, C++ protothreads don’t use continuations.</p>

<p>But they both work very well for their intended use cases! In any case, I thought this similarity was pretty neat — to me C#’s approach with async/await validates the protothread concept, despite the latter being implemented at a much lower level and with hairy macros.</p>

<p>So if you’re doing low-level embedded development, do check out protothreads — either the <a href="http://dunkels.com/adam/pt/">straight C version</a> or the <a href="https://github.com/benhoyt/protothreads-cpp">C++ equivalent</a>.</p>



<h2>Comments</h2>

<h3>Jeff Terrace <span style="padding-left: 1em; color: #bbb;">13 Nov 2012, 04:36</span></h3>

<p>Aren’t they both preceded by the similar system, Tame, outlined in the 2007 paper Events Can Make Sense <a href="http://pdos.csail.mit.edu/papers/tame-usenix07.pdf" rel="nofollow">http://pdos.csail.mit.edu/papers/tame-usenix07.pdf</a></p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">13 Nov 2012, 07:40</span></h3>

<p>Jeff, you probably saw kerneis’ reply on Hacker News, but he said: Definitely not: protothreads (2006) predates Tame (2007). But all of them are somehow (great-)grandchildren of Duff’s device: <a href="http://www.lysator.liu.se/c/duffs-device.html" rel="nofollow">http://www.lysator.liu.se/c/duffs-device.html</a></p>

<h3>Valentin Milea <span style="padding-left: 1em; color: #bbb;">18 Apr 2013, 22:20</span></h3>

<p>Hi, you might find <a href="https://github.com/vmilea/CppAwait" rel="nofollow">CppAwait</a> interesting. It emulates C#’s await on top of stackful coroutines. Not as lightweight as protothreads, but it can deal with local variables, exceptions and composing async tasks.</p>

