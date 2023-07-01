---
layout: default
title: "Lookup Tables (Forth Dimensions XIX.3)"
permalink: /writings/forth-lookup-tables/
description: "An article about lookup tables in Forth that I co-authored with Hans Bezemer (creator of 4tH) when I was 16."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">September 1997</p>


> This is an article I co-authored with [Hans Bezemer](https://thebeez.home.xs4all.nl/4tH/thebeez.html) when I was 16. The article was published in the September 1997 issue of *Forth Dimensions*, the Forth programming magazine published by the Forth Interest Group. Hans, the creator of a Forth compiler called "4tH", helped me tune my prose and reduce a little of my zealous-Forther tone. I think I wrote the [Case study II](#case-study-ii-the-for32-decompiler) and [The catch](#the-catch) sections. See the [original PDF](http://forth.org/fd/FD-V19N3.pdf).
>
> To learn more about Forth, read the [Wikipedia article](https://en.wikipedia.org/wiki/Forth_(programming_language)) and then read [*Thinking Forth*](https://thinking-forth.sourceforge.net/).


“Personally, I consider the case statement an
elegant solution to a misguided problem: attempting
an algorithmic expression of what is more aptly
described in a decision table.”

<p style="text-align: right">—Leo Brodie, *Thinking Forth*</p>


## Introduction

If you think this article is going to start a new discussion
about an old controversy, you're dead wrong. Instead, we will
present a new way to solve your problems by using a simple
concept, called *lookup tables*.

When you examine a few random Forth programs, you
will find that this technique is hardly used, apart from the
odd weekdays table. That is a shame, because programs using
lookup tables are easier to design,
easier to debug, and easier to maintain.
Furthermore, they usually are
smaller and run faster. We will provide
a few examples to make our point.

One possible reason for their
relative scarcity is that lookup
tables can be hard to implement in Forth---especially when
strings are concerned. In this article, we will also offer some
possible solutions to that problem.

Some might argue that <abbr title="Object-Oriented Forth">OOF</abbr> or other non-standard extensions
offer even better ways to handle these kind of problems.
However, ANS Forth is neither object oriented nor is
there a Structure Extension (yet), and we consider that discussion 
to be outside the scope of this article.


## What are lookup tables?

Lookup tables are just groups of objects with common
characteristics. Using them means one has to consider the
objects that are used inside a program and which characteristics
they share (and do not share).

An adventure game is a good example. Every room has its
own description and exits. Some exits may be hidden until a
certain condition is met. In a room, there are objects. All objects
have a description. Some may be moved and some may
not. Some may perform an action when certain conditions
are not met.

This is a perfect example of an application that should
use lookup tables. Any other implementation will certainly
be clumsy, hard to debug, and impossible to maintain. An
example of a adventure game using lookup tables can be found
at http://www.IAEhv.nl/users/mhx/adventur.frt \[[restored version](/writings/adventur.frt.txt) thanks to the Wayback Machine\]. This adventure
game was originally designed for <abbr title="Forth Dimensions, XVIII.3">4tH</abbr> and was skillfully
converted to ANS Forth by Marcel Hendrix.


## Why lookup tables?

The use of lookup tables is not limited to a single language
or a single set of problems. We have even successfully
implemented lookup tables in Excel spreadsheets. This significantly
reduced the number of manual manipulations and
checks of large sets of data.

The data in one sheet is confronted with a lookup table,
and automatically produces a “not available” error when an
unknown value is encountered. By searching the appropriate
category in another lookup table, and subsequently sorting
the entire sheet, subtotals can be produced easily. Before
that, all checking and sorting was done manually and
was prone to error.

But lookup tables can be of use in other situations, too.
The Z80 processor is not a high-speed processor, not even by
mid-1980s standards. So when Steve
Townsend of PSION designed the
engine for the <abbr title="Sinclair User, June 1984">Checkered Flag</abbr> game
on the Sinclair Spectrum, he used
lookup tables to link gears, speed,
and engine revolutions, rather than
set formulae. Each alteration of the controls would have made
recalculation necessary, which is a very costly operation on a
3.5 MHz processor without any floating-point hardware.

But if you really want to realize how powerful lookup tables
are, remember that the file system you're working with is
nothing more than a sophisticated set of lookup tables.

Lookup tables are very flexible and can be implemented
in various ways. You can even apply any design method for
relational databases, if you need to. By building your own
search routine, you can define the way you want to access
the lookup tables, e.g., by comparing strings or by finding
the closest approximation to a certain value. The only limit
is your own imagination.


## Case study I: The error handler

One of the co-authors of this article, Hans Bezemer, was
approached by a friend with an unusual problem. He had
been hired by a company to find the source of some error
messages coming from one of their most valued applications.

The company that originally built the application had long
gone bankrupt. The system administrator had examined the
main source of the application, and had been unable to find
these messages. After a short while, his friend had been able
to trace the messages back to a library, and that seemed to be
the end of it.

Then they had offered him to do a follow-up and design
some scheme that would prevent this kind of problem. But
with whatever kind of documentation scheme he had come
up with, it still failed the specification.

Together, they worked out a scheme that was finally accepted.
Instead of giving each programmer the liberty to handle
an error in his own way, a set of centrally maintained tables
was designed. Every error message had to be channelled
through an error-handler, which had the following definition:

```
error-handler     ( c-addr u n1 n2 n3 -- )
\ c-addr u  additional information
\ nl        routine number
\ n2        error number
\ n3        severity
```

The routine number was an index to a centrally maintained
table, with this format:

Routine number | (CELL)
Routine name   | (STRING)

The error number was an index to another centrally maintained
table, with this format:

Error number | (CELL)
Message      | (STRING)

The severity indicated how serious an error was. It had one of
five different values:

Fatal   | (Abort program)
Error   | (Continue, but output is questionable)
Warning | (Attention, will try to recover)
Info    | (Just issuing some user information)
Debug   | (Debugging information)

Of course, numbers have little mnemonic value, so
`CONSTANT`s were added to minimize the chance of human
error, e.g.:

```
0     CONSTANT    S_DEBUG
1     CONSTANT    S_INFO
2     CONSTANT    S_WARN
3     CONSTANT    S_ERROR
4     CONSTANT    S_FATAL

0     CONSTANT    E_SOUTOFRANGE
1     CONSTANT    E_EOUTOFRANGE
2     CONSTANT    E ROUTOFRANGE
3     CONSTANT    E_NODATA
4     CONSTANT    E_ENDOFILE
( etc.)

0     CONSTANT    R_DATAENTRY
1     CONSTANT    R_PROCESS
( etc.)
```

The use of the error-handler was mandatory, although a string
with additional information was allowed. Figure One shows
a typical use of the error-handler.

**Figure One.** Typical use of centralized error handler

```
:     process                 ( c-addr u -- n)
      over over               \ duplicate filename
      file-status 0=          \ check file status
      if                      \ if ok; process the data
            drop drop         \ discard filename
            S" None" R_PROCESS E_DATAOK S_INFO error-handler
            ( other code)
      else                    \ if not ok; issue error
            R_PROCESS E_NODATA S_FATAL error-handler
            -1                \ return dummy value
      then
;
```

The error-handler did several things. First, it checked the
validity of the error, routine, and severity values. Second, it
would match the severity level against the message level. If
the severity level was equal to or greater than the message
level, a message would be issued. Third, it would match the
severity level against the abort level. If the severity level was
equal to or greater than the
abort level, the program
would be terminated.

Every software developer
who wanted to do
business with this company
had to comply with
this scheme from that day
on. It proved to be so
simple that most quality
assurance could be performed
by their own system
administrator (we do
have to confess that Forth
was not the language of
choice in that particular
environment).

Note that the program
returns a dummy value.
The reason for that is two-fold.
First, the original C
compiler issued a warning
when it was omitted.
We don't like warnings, since
you never know whether it
indicates a real error. Second,
an ambiguous condition
would exist if some
smart programmer found a
way to correct the error
and changed the severity from “fatal” to “error.” In Forth, it
could cause a stack underflow or, worse, introduce a hard-to-find bug.


## Case study II: The For32 decompiler

The other co-author, Benjamin Hoyt, recently implemented
a Forth decompiler for his For32 system. He first
thought of implementing the main engine with one large
`CASE` statement. Then it clicked that a lookup table implementation
could have its advantages, and he decided to give it a
whack. He came up with a simple lookup table and, to his
surprise, it worked the first time!

The table he used is basically a two-dimensional array with
the “special case” execution tokens in the first field---e.g.,
`(LIT)`, `(S")`, `(TO)`, and many, many more---and the
decompiling words in the second. To clue you in a bit, Figure
Two provides the definition.

**Figure Two.** Lookup-based decompiler

```
-1 constant EOT                     \ end of table delimiter

( search table for x, if found return corresp. value and true flag)
: search-table                ( x table -- value true | x false )
begin   dup @ EOT =                 \ is it end of table?
      if      drop false  exit      \ no match found
      then    2dup @ <>       \ compare x with value in table
while   [ 2 cells ] literal + \ move to next table entry
repeat  nip  cell+ @  true ;  \ fetch corresponding value
```

Very simple indeed, as you can see. Of course, every lookup
table needs its own search routine. And if you don’t want to
make one yourself, we will give a general definition later on.
Remember that on many (ANS compliant) systems, `CASE` is
not even available. If you have to code `CASE` yourself, take
our advice and make your own search routine. That is a whole
lot simpler than developing an entire `CASE` suite.

Apart from that, every single `OF` ... `ENDOF` pair amounts to
at least a literal, a compare, and two jumps. On some systems,
this can add up to 40 bytes per `OF` ... `ENDOF` pair. A
similar entry in a lookup table needs only eight bytes. For
instance, the difference between the For32 decompiler using
`CASE` and the one using the lookup table amounts to 1.5 Kb.

Another good reason not to use `CASE` is that it often won't
do what you want. `CASE` only compares integers. If you are
not convinced yet, note that lookup tables are usually faster.

Some C compilers (like XL C on the R$/6000) implement
the *select()* statement with a whole slew of jump and compare
instructions. This is rather time-consuming, especially
with a reasonably sized list of items. With a lookup table, the
search is done in a confined area of execution, and a definite
speed increase will be noticed.


## The catch

The subtle elegance of lookup tables may be clear to you
now, but what's the catch? Why are so few Forth programmers
using it? A good question, because there are, in fact,
one or two hitches you may run across.

For instance, take the string-comparing example mentioned
before. Let's say you are coding a macro-command
processor. You decide to implement it with a lookup table.
You've coded your string-compare lookup routine, then you
build your table using `,"`. This word isn’t part of the ANS
Forth standard, but is available in many Forth systems.

```
create command-table  ( -- table )
      ," display"       ' do-display ,
      ," end"           ' do-end ,
      ," save"          ' do-save ,
      ," load"          ' do-load ,
      EOT ,
```

But it dawns on you that you were too hasty. The strings
aren't of equal length, you have alignment problems, and
the whole thing suffers from a complicated and slow search
routine. There are a few solutions to this problem, the simplest
of which involves using fixed-length strings like this:

```
create command-table  ( -- table )
      ," display" ' do-display ,
      ," end    " ' do-end ,
      ," save   " ' do-save ,
      ," load   " ' do-load ,
      EOT ,
```

This simplifies and speeds things up, and may work in some
situations. But what about the space wasted by long/short
string combinations? You can get around this if you define
the strings first, retrieve their addresses, and compile them at
the appropriate field in the table. But that can get pretty ugly:

```
: push-address
      c" load"
      c" save"
      c" end"
      c" display"
;

push-address

create command-table  ( -- table )
      ,     ' do-display ,
      ,     ' do-end ,
      ,     ' do-save ,
      ,     ' do-load ,
      EOT ,
```

Another solution is to write a definition called `M"`. It parses
a string and compiles it into the dictionary, while leaving its
address on the stack. Then you'd create your lookup table by
“comma-ing” all these addresses into it. (See Figure Three.)

**Figure Three.** The `M"` approach

```
\ string compiling suite )

( c-addr u dest -- )
: place 2dup 2>r  char+ swap chars move  2r> c! ;

( c-addr u -- )
: name, here  over 1+ chars allot  place ;

( "ccc<quote>" -- c-addr )
: m" align here [char] " parse  name, ;

( table of macro commands )
m" display"
m" end"
m" save"
m" load"

( the addresses are all on the stack now, in reverse order)
create command-table  ( -- table )
      ,     ' do-load ,
      ,     ' do-save ,
      ,     ' do-end ,
      ,     ' do-display ,
      EOT ,

( search table for string c-addr u)
( give xt true if found else c-addr u false)

: string-search  ( c-addr u table -- xt true | c-addr u false )
begin   dup @ EOT =                      \ is it end of table?
if      drop false  exit                 \ no match found
then dup 2over rot @ count compare       \ compare with c-addr u
while   [ 2 cells] literal +             \ move to next table entry
repeat  nip nip  cell+ @  true ;         \ fetch xt from column 2
```

This may work if you have only a few entries to compile,
but it gets hard to maintain when you have tens of entries.
The problem is that `,"` compiles strings on the spot, `S"` only
temporarily stores a string when in interpretation mode, and
`C"` lacks interpretation semantics all together. You might give
it another try and get something like this:

```
: display-s       c" display" ;
: end-s           c" end" ;
: save-s          c" save" ;
: load-s          c" load" ;

create command-table  ( -- table )
      display-s   ,     ' do-display ,
      end-s       ,     ' do-end ,
      save-s      ,     ' do-save ,
      load-s      ,     ' do-load ,
      EOT ,
```

Okay, this works, too, and it can be maintained with a
little trouble, but it certainly doesn’t feel good with all those
wasted headers. Let's see if we can change that.


## Solutions and implementations

The 4tH compiler is a very different Forth compiler. Some
argue that it is not a Forth compiler at all. We consider this
an academic discussion, in this context.

What does matter is that 4tH provides an easy way to define
lookup tables, having different segments for strings and
integers, and no distinction between compilation and interpretation
semantics. There are a number of ways to implement
some of this functionality in ANS Forth.

You can try to implement the LMI Forth solution. This
compiler features a word called `"`, which roughly behaves like
`C"` with interpretation semantics. When interpreting, it uses
a circular buffer. The trouble is that you never know when
the system is about to wrap around.

Another work-around is to `ALLOT` your own string space
and compile your strings there. The catch is that your environment
is limited by the amount of string space you have
allocated. Once you run out of string space, you have to restart
the system. This is one of the solutions Wil Baden proposed
(Figure Four).

**Figure Four.** A solution from Wil Baden

```
( Reserve  STRING-SPACE  in data-space. )
2000 CONSTANT /STRING-SPACE
CREATE STRING-SPACE           /STRING-SPACE CHARS ALLOT
VARIABLE NEXT-STRING          0 NEXT-STRING !

( caddr n addr -- )
: PLACE 2DUP 2>R CHAR+ SWAP CHARS MOVE 2R> C! ;

( "ccc<quote>" -- caddr )
: STRING" [CHAR] " PARSE
DUP 1+ NEXT-STRING @ + /STRING-SPACE >
      ABORT" String Space Exhausted. "
      STRING-SPACE NEXT-STRING @ CHARS + >R
            DUP 1+ NEXT-STRING +!
            R@ PLACE
      R>
;

CREATE months

      STRING" January" ,   31 ,
      STRING" February" ,  28 ,
      STRING" March" ,     31 ,
      STRING" April" ,     30 ,
      STRING" May" ,       31 ,
      STRING" June" ,      30 ,
      STRING" July" ,      31 ,
      STRING" August" ,    31 ,
      STRING" September" , 30 ,
      STRING" October" ,   31 ,
      STRING" November" ,  30 ,
      STRING" December" ,  31 ,

: .Month 1- 2* CELLS months + @ COUNT TYPE SPACE ;
```

There are several ways to get around the limited string
space. Redefining `/STRING-SPACE` is a possibility. An obvious
way is to allocate the string space in dynamic memory,
and reallocate it when needed. But reallocation could invalidate
all previously compiled addresses, which is definitely
not what we want.

Another ingenious way to use dynamic memory comes
from Marcel Hendrix. He allocates each individual string in
dynamic memory, as demonstrated in the previously mentioned
adventure game.

There are many solutions. Use the one that serves you best.

Still, there is the problem of the search routine. For your
convenience, we present a generic solution that can be implemented
on virtually every Forth system. For the strings, you
either have to create your own solution or use one of ours
(Figure Five).

**Figure Five.** A generic solution

```
\ : th cells + ;

0 Constant NULL

create MonthTable
   1 , "  January " , 31 ,
   2 , " February " , 28 ,
   3 , "   March  " , 31 ,
   4 , "   April  " , 30 ,
   5 , "    May   " , 31 ,
   6 , "   June   " , 30 ,
   7 , "   July   " , 31 ,
   8 , "  August  " , 31 ,
   9 , " September" , 30 ,
   10 , "  October " , 31 ,
   11 , " November " , 30 ,
   12 , " December " , 31 ,
   NULL ,

\ Generic table-search routine

\ Parameters:  n1 = cell value to search
\        a1 =  address of table
\        n2 =  number of fields in table
\        n3 =  number of field to return

\ Returns:  n4 =  value of field
         f  =  true flag if found

: Search-Table       ( n1 a1 n2 n3 -- n4 f )
   swap >r        ( n1 a1 n3 )
   rot rot        ( n3 n1 a1 )
   over over         ( n3 n1 a1 n1 a1 )
   0           ( n3 n1 a1 n1 a1 n2 )
   begin       ( n3 n1 a1 n1 a1 n2)
      swap over   ( n3 n1 a1 n1 n2 a1 n2)
      th       ( n3 n1 a1 n1 n2 a2)
      @ dup    ( n3 n1 a1 n1 n2 n3 n3)
      0> >r    ( n3 n1 a1 n1 n2 n3)
      rot <>      ( n3 n1 a1 n2 f)
      r@ and      ( n3 n1 a1 n2 f)
   while       ( n3 n1 a1 n2)
      r> drop     ( n3 n1 a1 n2)
      r@ +        ( n3 n1 a1 n2+2)
      >r over over   ( n3 n1 a1 n1 a1)
      r>       ( n3 n1 a1 n1 a1 n2+2)
   repeat         ( n3 n1 a1 n2)

   r@ if
      >r rot r>      ( nl a1 n3 n2)
      + th @      ( n1 n4)
      swap drop      ( n3)
   else
      drop drop drop ( n1)
   then

   r>          ( n f)
   r> drop        ( n f)
;

: Search-Month       ( n --)
   MonthTable 3 2 Search-Table

   if
      .
   else
      drop ." Not Found"
   then cr
;
```

We can even go one step further and define a word called
`TABLE`, which `CREATE`s a lookup table that, when executed,
searches itself and returns the required value:

```
( create search table called "name")
( when executed, searches its table for x)

( returning the table value and true if)
( found, else x and false )

: table  ( "name" -- )  create
      does>  ( x -- value true | x false )
search-table ;
```

You can implement different versions with different search
methods for different kinds of lookup tables. That allows you
to create very powerful applications very quickly. Remember,
this is one of the privileges you have when you are using Forth!


## Epilogue

Have you ever thought about implementing a Forth dictionary,
or even a whole Forth system, using lookup tables?
We bet it can be done! In fact, the entire 4tH compiler is
centered around four different lookup tables.

Lookup tables allow you to build fast, small, and easy-to-maintain
applications. In our opinion, this method has not
been used extensively in Forth, partly because there were few
facilities to support it. We hope we have provided enough
material to give you some fresh ideas and to get you started
right away.

> Benjamin Hoyt is a sixth-form student who loves programming as a
> hobby. Before he discovered Forth, he experimented with graphics
> and AdLib programming in 80x86 assembler. Over a year ago, he built
> his first Forth compiler and has stayed loyal to the language ever
> since. He currently uses and is working on his own ANS Forth called
> For32, running under MS-DOS. Another of his major projects at the
> moment is For16, a small, ANS-compliant Forth compiler running
> under MS-DOS.

> Hans “the Beez” Bezemer has been using Forth and C since the mid-1980s.
> He is the author of several shareware programs and the
> freeware 4tH compiler. 4tH is available at ftp.taygeta.com.
