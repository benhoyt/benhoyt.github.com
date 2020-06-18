---
title: Writing good commit messages
layout: default
permalink: /writings/writing-good-commit-messages/
description: Why quality commit messages are important and how to write them
canonical_url: https://medium.com/compass-true-north/writing-good-commit-messages-fc33af9d6321
---
<style>
.commit-msg {
    font-family: monospace;
    font-size: 92.5%;
    white-space: pre-wrap;
    background: #f4f4f4;
    padding: 1.2em;
    margin: 1.2em 0;
    word-spacing: 0;
}
</style>

<h1>{{ page.title }}</h1>
<p class="subtitle">September 2018</p>

> [Original article on Compass's tech blog]({{ page.canonical_url }})


At Compass, as we continually improve our engineering practices, sometimes it’s the small things that make a difference. Good commit messages are one of those things.

We try not to do it like this:

![XKCD 1296](/images/git_commit_2x.png)

## Why good commit messages?

Good commit messages are important for a number of reasons:

**Context for the code reviewer:** If a reviewer can see the context and motivation for a change in the commit message, they won’t have to come ask you for it. Or, perhaps more likely than coming to ask you, they’ll do a very cursory review. I believe this is the most important reason for good commit messages: they make code reviews more thorough.

We use Gerrit for code review, and while I’m not a huge fan of Gerrit in general, it’s got a good feature here: it allows you to review and comment on the commit message itself.

**For good history:** Source control itself shows that history is important. And when you’re looking into “why on earth did we do it that way?” six months later, good commit messages are invaluable.

I remember asking a colleague recently why we disabled Sentry in our Python web backend. He couldn’t quite remember, but I dug back into the commits, and sure enough, there was a nice message giving the exact reasons we disabled it, and what would need to be investigated before enabling it again.

**Increases [bus factor](https://en.wikipedia.org/wiki/Bus_factor):** Writing a thorough commit message puts all the context in your head “on paper” before you forget about it. This shares the knowledge with the reviewer, but it also documents it for the rest of the team.

## What is a good commit message?

A good commit message starts with a short, one-line summary of what the fix is. Describe the fix, not the bug. And don’t just repeat or copy-n-paste the Jira issue summary.

Then add a paragraph (or maybe two or three for bigger changes!) explaining the motivation for the change, and how some of the moving parts fit together — this might include what was happening previously and why that didn’t work.

A commit message is like a good code comment: it shouldn’t detail the <i>what</i> or the actual code changes — the diff does that — but the <i>why</i>.

Additionally, add a link to the Jira ticket or supporting information, such as the StackOverflow answer you copied the code from. :-)

In rare-ish cases like a documentation tweak or typo fix, you can omit the detail paragraph and just write a summary line.

The truth is you’ve already spent hours finding the issue and fixing the code. Spending two or three minutes on a good commit message is not much additional effort, but a big win for the code reviewer and the longer-term maintainers.

## Examples of not-so-good commit messages

I’m going to use real examples here, but I’ve tried to pull a good selection from various folks, myself included:

### Just copying the Jira issue summary

<pre class="commit-msg">[CNC-988] Cannot delete agent profile in incorrect geo</pre>

This is something we’ve all done, but it’s a bad habit. This message just lists the Jira ticket and copy-n-pastes the Jira issue summary. Instead, it should be a summary of the fix, with a paragraph explaining more details and motivation. Maybe something like this:

<pre class="commit-msg">Only show profile pages for current geo in editor

Previously we were loading profiles for all geos, which confused the user and made it so they couldn’t delete profile pages on other geos.

Additionally, when the geo dropdown at the top-right is changed, re-fetch the profile pages so the list is up to date. This required a Backbone hack because of X, Y, and Z.

Fixes CNC-988</pre>

### No motivation or context

<pre class="commit-msg">Remove versioning from deploy-assets scripts</pre>

This is a fine summary, but gives no motivation for why the change was necessary. That’s especially important for a small code change like this one was; the code change itself doesn’t provide any motivation.

So the reviewer is left wondering: “Why did Bob do this?” or “Will this mean we can’t use a CDN?”

### No-op messages

<pre class="commit-msg">Update README.md</pre>

Unfortunately GitHub’s UI makes this kind of thing easy to do, making you think it’s an okay practice. It’s not. Even if a change is “only” a README update, you can at least describe it in a one-liner:

<pre class="commit-msg">Add notes about how to build on Linux</pre>

Again, the change probably took 30 minutes, so spending 30 seconds on a decent commit message makes other people’s lives easier.

## Examples of good commit messages

This commit message has an accurate summary line, as well as details of why the change was needed, and a link to memory graphs:

<pre class="commit-msg">Re-enable React server-side rendering

Move render string output directly into template creation portion of the template render call.

By moving the render string out of Koa state, we no longer have memory allocation issues:

Results: https://cl.ly/abcdef123456</pre>

Here’s one for a performance improvement that includes both a good summary and context, as well as benchmark results:

<pre class="commit-msg">Make calls faster by resolving function names at parse time

This avoids a map lookup by string name at runtime when calling a user-defined function, speeding up function calls by at least 10%. Not a huge gain but a fairly simple win, and matches how we’re doing locals and globals.

                   before         after          delta
RecursiveFunc-8    18.4µs ± 1%    16.5µs ± 1%    -10.24%
FuncCall-8         3.42µs ± 1%    3.00µs ± 0%    -12.46%</pre>

Sometimes a short message with a couple of screenshots is enough:

<pre class="commit-msg">Adding loading states for contact bulk operations

Before: https://cl.ly/before12345
After: https://cl.ly/after54321</pre>

One minor point about the message above: it’s considered good git practice to use the imperative mood (yep, I had to look up the term) when writing the summary line. So “Add loading states” rather than “Adding…”. The commit message then describes what this commit will do when applied — following this means a consistent style in your commit messages, and it’s also shorter.

For more on these basic style rules, see [The seven rules of a great Git commit message](https://chris.beams.io/posts/git-commit/#seven-rules).

## To sum up

Remember: include a terse, specific summary line along with motivation and “why” in the details section.

Good commit messages make code reviews more effective, help when tracking things down later, and increase the team’s bus factor.
