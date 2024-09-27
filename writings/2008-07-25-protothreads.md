---
layout: default
title: "Protothreads and C++"
permalink: /writings/protothreads/
description: "Protothreads and C++"
canonical_url: https://blog.brush.co.nz/2008/07/protothreads/
---
<h1>Protothreads and C++</h1>
<p class="subtitle">July 2008</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2008/07/protothreads/)


<p>Part of my day job is embedded programming, and recently I’ve discovered Adam Dunkels’ lovely invention: <a href="http://dunkels.com/adam/pt/">protothreads</a>. He calls them <i>lightweight, stackless threads in C</i>. And that they are.</p>

<p>What protothreads give you is the ability to write procedural, thread-style code, but without the overhead of real threads. The kind of thing embedded programmers normally use <code>switch</code> state machines for.</p>

<p><a href="http://dunkels.com/adam/pt/" title="Go to Adam Dunkels' original protothread example"><img style="width:auto" alt="Protothread example" class="right border" height="152" src="/images/brushblog/2008_07_protothread.png" width="190"/></a>The other alternative is full-blown threads, but real threads certainly have their drawbacks. They each need their own stack, for one — and that’s often nasty in embedded systems, where you might only have 2 KB of RAM total. There’s the performance hit of context switching. There’s having to worry about sharing between threads, locking, etc.</p>

<p>Enter protothreads.</p>

<p>One of the cool things about them is that, behind the scenes, they break all the conventions (but not the commandments). Use of the legendary <a href="http://en.wikipedia.org/wiki/Duff%27s_device">Duff’s device</a>, macros that open braces but don’t close them … but they work, they’re fast and portable, and they give you pseudo-threads almost for free.</p>

<p>Because of how they work — perhaps it’s the same for any neat tool — there are a few gotchas:</p>

<ul>
<li>You can use locals, but their values won’t be remembered across waits (you have to use <code>static</code>s for that).</li>
<li>You’ve got to put all your “state change code” in a single function.</li>
<li>And you can’t have a <code>switch</code> of your own spanning the use of the wait macros.</li>
</ul>

<p>You’ll want to <a href="http://dunkels.com/adam/pt/">read more about them</a> and see some examples on Adam Dunkels’ website.</p>

<h4 id="cpp">Protothreads in C++</h4>

<p>But what about this C++ thing? Well, C++ is a more or less a superset of C, so protothreads will work as-is. But if we take C and sprinkle in a dash of ++, we can make them even tastier:</p>

<ul>
<li>You can make a <code>Protothread</code> class, so you don’t need to pass the <code>struct pt*</code> around everywhere.</li>
<li>You can use instance variables where you might have used statics, making your protothreads easy to multi-instance.</li>
<li>You can write classes derived from <code>Protothread</code> that add helper variables and macros to read and wait for timers, specific I/O ports, etc.</li>
</ul>

<p>“Okay, so show us an example.” Fair call.</p>

<p>Below is a C++-style protothread that implements a simple packet protocol. Each packet has a sync byte, a length byte, <i>n</i> data bytes, and a checksum byte. Packets are only processed if they’re good and complete:</p>

<pre class="prettyprint"><code>bool UartThread::Run()
{
    PT_BEGIN();

    while (true) {
        // wait for sync byte
        PT_WAIT_UNTIL(ReadByte(ch));
        if (ch == Sync) {
            // read length byte, ensure packet not too big
            PT_WAIT_UNTIL(ReadByte(ch));
            len = ch;
            if (len &lt;= MaxLength) {
                // read n data bytes
                for (i = 0; i &lt; len; i++) {
                    PT_WAIT_UNTIL(ReadByte(ch));
                    data[i] = ch;
                }
                // read checksum, dispatch packet if valid
                PT_WAIT_UNTIL(ReadByte(ch));
                if (ValidChecksum(data, len, ch))
                    Dispatch(data, len);
            }
        }
    }

    PT_END();
}
</code></pre>

<p>Not bad, eh? Even with comments it’s much shorter and sweeter than the equivalent state machine version (which, incidentally, is pretty much what the protothread macros expand to):</p>

<pre class="prettyprint"><code>bool UartThread::Run()
{
    while (true) {
        switch (state) {
        case StateSync:
            if (!ReadByte(ch))
                return true;
            if (ch != Sync)
                break;
            state = StateLength;

        case StateLength:
            if (!ReadByte(ch))
                return true;
            len = ch;
            if (len &gt; MaxLength) {
                state = StateSync;
                break;
            }
            i = 0;
            state = StateData;

        case StateData:
            while (i &lt; len) {
                if (!ReadByte(ch))
                    return true;
                data[i] = ch;
                i++;
            }
            state = StateChecksum;

        case StateChecksum:
            if (!ReadByte(ch))
                return true;
            if (ValidChecksum(data, len, ch))
                Dispatch(data, len);
            state = StateSync;
        }
    }
}
</code></pre>

<p>So there you go. I know which version I’d rather write and maintain.</p>

<p>Feel free to use the <b><a href="https://raw.github.com/benhoyt/protothreads-cpp/master/Protothread.h">Protothread.h</a></b> header file I put together from Adam Dunkels’ C version — it should have all you need to get started. I’ve left a “protothread scheduler” as an exerciser for the reader, as it would be both simple and application-dependent.</p>

<p>Just a final word: I’m not suggesting protothreads are a replacement for threads — they’re not. But when you need the appearance of threads, or you’re dealing with embedded micros and don’t have screeds of RAM, give them a try.</p>

<hr/>

<p><small>Chris Woods has also implemented a <a href="http://mind-flip.blogware.com/blog/_archives/2007/12/12/3404499.html">version of protothreads in C++,</a> but he’s taken a different approach for the Symbian OS.</small></p>



<h2>Comments</h2>

<h3>name <span style="padding-left: 1em; color: #bbb;">26 Jul 2008, 02:14</span></h3>

<p>Very cool! Do you have a simple example of how to turn local (static) variables into instance variables?</p>

<p>Thanks.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">26 Jul 2008, 09:27</span></h3>

<p>Sure. The example shown above has <code>ch</code>, <code>len</code>, etc as instance variables of the <code>UartThread</code> class.</p>

<p>There’s also the example below from the Protothread.h file I included:</p>

<pre class="prettyprint"><code>class LEDFlasher : public Protothread
{
public:
    virtual bool Run();

private:
    ExpiryTimer _timer;
    uintf _i;
};

bool LEDFlasher::Run()
{
    PT_BEGIN();

    for (_i = 0; _i &lt; 10; _i++)
    {
        SetLED(true);
        _timer.Start(250);
        PT_WAIT_UNTIL(_timer.Expired());

        SetLED(false);
        _timer.Start(750);
        PT_WAIT_UNTIL(_timer.Expired());
    }

    PT_END();
}
</code></pre>

<p>Here I’ve made the loop counter <code>_i</code> and the timer <code>_timer</code> instance variables (instead of <code>static</code> locals inside the <code>Run</code> function), so you can easily have multiple <code>LEDFlasher</code>s. For example:</p>

<pre class="prettyprint"><code>int main()
{
    LEDFlasher flasher1;
    LEDFlasher flasher2;

    while (flasher1.IsRunning() || flasher2.IsRunning()) {
        flasher1.Run();
        flasher2.Run();
    }
    return 0;
}
</code></pre>

<h3>Lucy de Cobham <span style="padding-left: 1em; color: #bbb;">26 Jul 2008, 11:13</span></h3>

<p>The equivalent state machine version is much easier to read and to reason.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">26 Jul 2008, 11:39</span></h3>

<p>I’m unsure why you <a href="http://www.reddit.com/r/programming/comments/6te2w/protothreads_and_c/c04tant" rel="nofollow">think that</a>, Lucy. I certainly find the short, procedural version easier to understand than the state machine — which jumps around, has multiple exit points, etc.</p>

<p>Also, you don’t necessarily need to “understand how protothreads work” on the inside to use them. The <code>WAIT_UNTIL</code> macro simply does what it sounds like — waits until the given condition is true.</p>

<h3>Aaron <span style="padding-left: 1em; color: #bbb;">17 Nov 2012, 14:39</span></h3>

<blockquote>
<p><em>Ben wrote:</em></p>
<p>Also, you don’t necessarily need to “understand how protothreads work”</p>
</blockquote>

<p>This is the core value of coroutine mechanisms – they abstract away implementation mechanics. When someone expresses anxiety over the “gotos” involved, I point out that therevare “gotos” embedded in every procedure call, if statement, or loop. What’s important is the structure of the program at a high level, and these techniques lead to better structure, i my experience.</p>

<h3>Bob <span style="padding-left: 1em; color: #bbb;">18 Sep 2014, 02:41</span></h3>

<p>Do you have any examples of inter-pthread communication?</p>

