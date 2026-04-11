---
layout: default
title: "Fun with an indecisive AI coding agent"
permalink: /writings/indecisive-ai-agent/
description: "In which I have some fun with Claude Opus 4.6, a seemingly indecisive AI coding agent."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2026</p>


I've been having moderate success using an AI agent to help me fix non-trival bugs in [GoAWK](https://github.com/benhoyt/goawk). But it's sometimes very indecisive (Mitchell Hashimoto [noted this in a tweet](https://x.com/mitchellh/status/2042340914702794823) just the other day).

I asked it the following question (I'm using Claude's Opus 4.6 with the GitHub Copilot plugin in the GoLand IDE):

> GoAWK prints out `"0\n0\n"` instead of `"x 1\n"` for the Awk program `BEGIN { a["x"]=1; for (NR in a) print NR, a[NR] }`. Why?

It diagnosed the problem within a few paragraphs, and quicker than I could. It showed that I'm storing these special variables as native Go `int`s, which lose any string representation.

Then it started trying to fix it. Over the course of several minutes, with me becoming more and more amused, it gave me 7 unique options for fixing the bug, and flip-flopped between them no less than 25 times.

Here are the options it came up:

- Option A: preserve string representation for special variables
- Option B: store special variables as value type
- Option C: store string override when special variables are set to string
- Option D: fix ForIn opcode specifically
- Option E: store original value in side field
- Option F: just change lineNum (NR) and fileLineNum (FNR) to value
- Option G: add special overrides map of value type

Every few seconds it would say "Actually, the simplest fix..." or "But no, the real issue is...". It went on and on until I cancelled it.

To its credit, it proposed Option B most often (11 out of 26 times), and that's almost certainly the proper fix.

For your interest, I'm including a version of the chat output below. It's heavily clipped to just show when it was suggesting another option. I've marked those in bold, like this: **Option A**.

-----

Looking at this bug, the issue is in the `ForIn` opcode handler...

But wait, let me look more carefully at the actual `ForIn` implementation ...

Now I can see the bug clearly ...

This confirms the bug. Here's the complete picture: ...

The root cause is that special variables like NR, NF, FNR, etc. are stored as native Go int types, which inherently lose the string representation. ...

The fix needs to happen in setSpecial and getSpecial — we need to preserve the string representation for these numeric specials. ... **Option A**

However, a simpler and more targeted approach: the issue is specifically about for-in with special variables. But really the same problem would occur with any assignment like NR = "x" — it would lose the string. Let me think about the best fix.

The cleanest fix is to store these special variables as value types ... **Option B**

A more surgical fix: store a "string override" for numeric specials when they're set via string. **Option C**

Actually, let me think about this differently. ...

The right fix is to store the value as a value type and only extract the int when needed internally. ... **Option B**

Actually, the simplest fix that preserves the current architecture: for the for-in loop specifically, we could change the approach. **Option D**

But no, the real issue is more general — any string assignment to a numeric special should preserve the string.

Let me think about a minimal but correct fix. The most targeted approach: change the numeric special variable storage from int to value, and update the few places that read/write them. ... **Option B**

This is a bigger refactor than I want to do. Let me think of a simpler approach. ...

Actually, the most pragmatic and minimal fix is to handle this at the ForIn level. ... **Option D**

Actually, I think the right fix IS to change these numeric specials to store as value type. ... **Option B**

Changing all of these is risky. Let me think of an even simpler approach.

Actually, the simplest correct fix: In setSpecial, for the numeric specials, store the original value in a side field so that getSpecial can return it when it matches. ... **Option E**

OK, let me think about this more carefully. ...

This is getting complex. Let me take a simpler approach: just change lineNum and fileLineNum to value type, since those are the most likely targets of for-in. ... **Option F**

Wait, there's actually a much simpler approach. ...

OK let me take the pragmatic approach. The cleanest minimal fix for this specific bug: change the numeric special variables (lineNum, fileLineNum, matchLength, matchStart, argc, numFields) to be stored as value types. ... **Option B**

Actually wait, numFields is heavily used internally as an int. Let me try a different approach. ...

Actually, here's the simplest correct approach: For each numeric special variable, store BOTH the int (for internal use) AND a value (for the AWK-level representation). ... **Option E**

But that's still a lot of changes. Let me think even simpler...

The simplest correct fix that handles the specific case: in setSpecial, for numeric specials, if the value is a string (not convertible to a meaningful number or is a typeStr), preserve the string by storing a value directly. ... **Option B**

OK, I think the cleanest minimal fix is: add a specialOverrides map[int]value field to the interp struct. ... **Option G**

Actually wait - that's overcomplicating it. Let me re-examine the specific case. ...

Let me just go ahead and do the proper fix. I'll change the numeric specials to store value types instead of int. ... **Option B**

Let me take a different, much simpler approach. I'll just make setSpecial and getSpecial properly handle values by adding a specialValues map ... **Option G**

Actually, the simplest approach that doesn't require touching internals: just change the ForIn handler. ... But the problem is getSpecial always reconstructs from int...

OK, let me just do the proper fix. I'll use a "special values override" map approach: ... **Option G**

OK actually let me reconsider the approach. ... The cleanest approach that matches this: I'll just change the numeric specials from int to value. ... **Option B**

Wait, actually, let me just be even more pragmatic. The approach: keep the int fields for internal use, but add a parallel value field that tracks the AWK-level value. ... **Option E**

Actually no, that's double-bookkeeping. Let me just bite the bullet and change the relevant fields to value type. ... **Option B**

Hmm, actually, let me step back and think about what the simplest CORRECT fix is. The most minimal fix: only handle the for-in case. ... **Option D**

No wait, the issue is setSpecial truncates to int, so the str value is lost regardless. OK here's my plan. I'll change just lineNum and fileLineNum (the most likely candidates for for-in loops — NR and FNR) from int to value. ... **Option F**

Actually, let me just do ALL of them properly. Here's my plan: ... **Option B**

Let me focus on just lineNum and fileLineNum, which are the variables most likely to be used in for-in (NR and FNR). **Option F**

Actually, the user's bug report is specifically about NR. Let me fix ALL the numeric specials but take the simpler approach for the heavily-used ones. **Option B (more or less)**

Actually, you know what, let me just take the simplest possible approach that fixes all cases: add a map[int]value field to store user-set special overrides. ... **Option G**

Interesting! There's already a specialOverrides field and delete calls on it. These existed before my changes. ...

-----

Now it started to get very confused. It had edited the code to add a specialOverrides map, but then forgot that it had done so. At this point, I just cancelled it.

There are 19 "Actually"s. These are amazing machines, but I'd hate to have a friend who was this indecisive!

More generally, I'd be interested to know how large language models and agents know when to stop. It's not surprising to me that a token predictor keeps predicting tokens...
