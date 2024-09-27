---
layout: default
title: "Recursive decent parsing [sic]"
permalink: /writings/recursive-decent/
description: "Recursive decent parsing [sic]"
canonical_url: https://blog.brush.co.nz/2007/11/recursive-decent/
---
<h1>Recursive decent parsing [sic]</h1>
<p class="subtitle">November 2007</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2007/11/recursive-decent/)


<p>Someone pointed out that <a href="http://decenturl.com/">DecentURL</a> didn’t detect recursive redirects, so I fixed the problem … by implementing a “recursive <i>decent</i> parser”.</p>

<p>Sorry, couldn’t help myself. :-) This blog entry does have a better point.</p>

<p><a href="http://catb.org/~esr/jargon/html/R/recursion.html"><img style="width:auto" alt="Recursion" class="right border" height="83" src="/images/brushblog/2007_11_recursion.png" width="156"/></a>If you’re like me and learned to program by means other than a great and glorious Computer Science course, you didn’t learn about <a href="http://en.wikipedia.org/wiki/Recursive_descent_parser">recursive descent parsers</a> till late in life. At least, I didn’t.</p>

<p>I knew about grammars and had seen many a <a href="http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form">BNF grammar</a>, but what I didn’t know was that a BNF grammar pretty much <em>is</em> the parser. Take a grammar, make a few syntactic changes, and you have a parsing program.</p>

<p>The fact that it’s defined recursively means it automatically takes care of precedence and storing intermediate values — you get all that for free. Easy when you know how, but not immediately obvious, apparently not even to compiler writers early on in the history of computing (search down to “A little philosophy” in <a href="http://compilers.iecc.com/crenshaw/tutor4.txt">Let’s Build A Computer, Part IV</a>).</p>

<p>Anyway, below is some sample C code. Save it out as <code><a href="/wp-content/uploads/2017/10/2007_11_calc.c.txt" title="Don't click this">calc.c</a></code>, compile it, and you’ll have a <strong>simple expression calculator</strong> that’ll solve things like <code>4*(5+5)+2</code> at the drop of a hat. Note that you can use <code>getc()</code> and <code>ungetc()</code> for the look-ahead, but it’s typical for simple parsers to use a global “current char” variable, which I’ve called simply <code>c</code>: <span id="more-67"></span></p>

<hr/>

<pre class="prettyprint"><code>/* Simple expression parser and calculator

The grammar in BNF-ish notation
-------------------------------
expression:  ['+'|'-'] term ['+'|'-' term]*
term:        factor ['*'|'/' factor]*
factor:      '(' expression ')' | number
number:      digit [digit]*

*/

#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;
#include &lt;ctype.h&gt;

int c;
int expression(void);

void error(char *msg) {
    puts(msg);
    exit(1);
}

void next(void) {
    c = getchar();
    if (c==EOF) error("char expected");
}

int number(void) {
    int n;

    if (!isdigit(c)) error("digit expected");
    n = 0;
    do {
        n = n*10 + c-'0';
        next();
    } while (isdigit(c));
    return n;
}

int factor(void) {
    int n;

    if (c=='(') {
        next();
        n = expression();
        if (c!=')') error(") expected");
        next();
    } else
        n = number();
    return n;
}

int term(void) {
    int op, n, m;

    n = factor();
    while ((op=c)=='*' || op=='/') {
        next();
        m = factor();
        n = op=='*' ? n*m : n/m;
    }
    return n;
}

int expression(void) {
    int sign, op, n, m;

    if ((sign = c=='-') || c=='+') next();
    n = term();
    if (sign) n = -n;
    while ((op=c)=='+' || op=='-') {
        next();
        m = term();
        n = op=='+' ? n+m : n-m;
    }
    return n;
}

int main(void) {
    next();
    printf("%d\n", expression());
    return 0;
}
</code></pre>



<h2>Comments</h2>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">7 Nov 2007, 18:10</span></h3>

<p>See also the Forth version, <a href="http://blog.brush.co.nz/wp-content/uploads/2017/10/2007_11_calc.fs_.txt" rel="nofollow"><code>calc.fs</code></a>. Use something like <a href="http://www.jwdt.com/~paysan/gforth.html" rel="nofollow">Gforth</a> to run it.</p>

<h3>angel <span style="padding-left: 1em; color: #bbb;">8 Jun 2008, 23:56</span></h3>

<p>Hi Ben,
(-200)*(500/23)+123-90/2+(40) gives -4082. Why?</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">9 Jun 2008, 07:29</span></h3>

<p>Hi angel, isn’t that correct? 500/23 is 21, and -200*21 = -4200. That plus 123-45+40 = -4082.</p>

