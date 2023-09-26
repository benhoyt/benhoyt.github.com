---
layout: default
title: "How (not) to apply for a software job"
permalink: /writings/how-to-apply/
description: "Advice for how to (and how not to) apply for a software engineering job, particularly for the written parts of the interview process. As a bonus, some tips for your resume/CV."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">September 2023</p>


> **Go to:** [ChatGPT](#dont-use-chatgpt) \| [Flowery prose](#dont-use-flowery-prose) \| [Tell](#dont-tell-show) \| [Generics](#dont-be-generic) \| [Buzzwords](#dont-play-buzzword-bingo) \| [Instructions](#dont-ignore-instructions) \| [Resume tips](#some-resume-tips)

I review a lot of resumes and written interviews, and many of them are badly written. This article describes a few things *not* to do when applying for a software engineering role.

I work for Canonical (see my [endnote](#endnote) about our process), but this is advice that I believe is good when applying at any company.

Most of this is *writing* advice, useful when writing your resume, cover letter, and any other written parts of a job application. In fact, I'd argue that most of it applies to any kind of non-fiction writing.

To set the scene, remember who you're writing for: a busy hiring manager or an engineer who's been tasked with reviewing your application (and hundreds of others). They have to make a decision based on limited information, and they want to hire people who stand out, who've built things, and who can communicate well.


## Don't use ChatGPT

I know it's just a tool, but hear me out. Initially I qualified "Don't use ChatGPT" with "or if you do, use it carefully". But my strong recommendation is: just don't. At least as of September 2023, all it'll make you do is sound like a robot.

When candidates first started (obviously) using AI for their applications, I would rule them out for "cheating". Since then, I've changed my approach: I evaluate all submissions as if they were written by humans, and if a submission is bad, I reject it.

The thing is, all the submissions that clearly use AI tools are terrible: they might have perfect grammar, but they're incredibly boring, and they contain little or nothing from the candidate's experience.

One of the questions my company asks is a fairly open-ended one: "Describe your experience with software operations and running services in production". Here's a representative ChatGPT answer:

> I bring 5 years of experience in software operations and managing services in production. In my previous roles, I've played pivotal roles in deploying and maintaining production services, leveraging a diverse set of technologies and tools such as Python and Golang. I've successfully overseen deployment and release management processes, implemented robust monitoring solutions to ensure system health, and effectively managed incidents, emphasizing quick resolution and root cause analysis. My experience also includes scalability initiatives to accommodate increased demand and optimization efforts to enhance system performance.

Why is that so horrible? It's flowery, passive prose with no specifics. There's nothing interesting or personal, and it could describe almost any software engineer.

Compare that to an engaging, personalised answer:

> I learned to program by building a website to track car parts for my uncle's mechanics shop (using PHP and MySQL). I added a simple health check system to ping the website every minute and send me an email if an error occurred. Soon after starting my first real job I automated many of their on-call procedures using Ansible and Python scripts. More recently I was on a team in charge of three microservices, running on an EKS cluster managed by Terraform. I set up Datadog logging and monitoring for the company, and I was part of an on-call rotation shared with the DevOps team.

Specific, engaging, and real! It could still be improved, for example, by describing how the automation helped the team: "this cut down our deployment time from 2 hours to 15 minutes". But it's already a lot better than the first version.

If you're not a native English speaker, that's okay -- I'd much rather see imperfect writing that reflects your experience than flawless prose that doesn't.

Do better prompts help ChatGPT sound more real? Yes, a better prompt can improve the wording. However, it's not going to magically write text based on your personal experience. You can definitely use a spelling and grammar checker on your writing, but please, make sure it's *your* writing.


## Don't use flowery prose

Don't write phrases like that one above: "leveraging a diverse set of technologies and tools such as Python and Golang". Your point will get lost in a sea of big words. Just say "I used Python and Go" -- the reviewer will thank you for it.

As another example, one candidate said something similar to the following. They:

* had a *profound mastery* of Java (they're not [James Gosling](https://en.wikipedia.org/wiki/James_Gosling))
* their *journey commenced* (they're not [Bilbo Baggins](https://en.wikipedia.org/wiki/Bilbo_Baggins))
* they *skillfully constructed* programs (they're not [Stradivarius](https://en.wikipedia.org/wiki/Stradivarius))
* they *extended their expertise* (not only an expert, but an extended one)
* they *crafted* Lambda functions (I prefer artisanal Lambdas)
* they *leveraged* Spring Boot (or did they just *use* it?)
* they *swiftly adapted* (this is getting old)
* they *meticulously* read documentation (good, I will hire them as a proof-reader)
* they *embraced* object-oriented programming (like everyone in the 90's)
* and they *brought forth robust experience* (but do they bring robust [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) experience?)

I suspected ChatGPT, but I'm not sure -- they may have just been using a thesaurus. Whatever the case, please don't turn up the adverbs and adjectives to 11.

I recommend leaving out the over-the-top modifiers and rewriting that list as follows:

* I'm experienced with Java
* I started
* I built
* I learned
* I wrote Lambda functions
* I used Spring Boot
* I adapted
* I read the docs
* I use object-oriented programming (or drop that entirely)
* I gained experience


## Don't tell. Show!

This one is simple: don't tell readers what to think, show them what you've done. The bad examples above aren't just flowery prose, they also tell instead of show.

Saying "I skillfully constructed programs" is telling readers what to think about you; writing "I built a fast subset of POSIX Make in 500 lines of Java" is showing them what you've built. If it's open source and you can link to the GitHub repo, all the better.

Remember, you're writing for a hiring manager, who wants to see specific things you've accomplished.


## Don't be generic

Another of our interview questions is "How would you approach the design and implementation of new features for a production service?"

A lot of candidates (again, possibly with the help of AI tools) instead answer this question: "How would a textbook define the Software Development Life Cycle." But we want to hear about *your* experience, with technical details in your own words.

This paragraph is far too generic:

> Designing and implementing new software starts with gathering requirements, writing a specification, seeking feedback from stakeholders, and then a quality implementation. After it's implemented, automated testing and manual QA are important. Then we deploy the software and make sure to monitor it properly.

Try something like this instead:

> I really like succinct specs and some up-front planning. When I was designing the new auth service, for example, I wrote a 3-page spec that included an architecture diagram and a brief description of the API endpoints. Before deploying to production, I think it's important to load test a real server, so I set up a similar staging environment and measured how many concurrent requests it could serve. Once in production, monitoring is crucial: I've used Datadog as well as open-source tools like Prometheus to detect and diagnose issues.

In short, don't be generic. Unless of course you're writing about [parametric polymorphism](https://en.wikipedia.org/wiki/Parametric_polymorphism). (Sorry, couldn't resist.)


## Don't play buzzword bingo

This is closely connected to flowery prose and being generic: try not to use business jargon that doesn't mean much. I saw something like this earlier today:

> Conducted comprehensive data interpretation and analysis to derive actionable insights that provide client value.

Apart from sounding like a parody from *The Office*, this says basically nothing. Almost everyone who works in front of a computer "interprets and analyses data", and hopefully "derives actionable insights" that provide value to clients.

Using buzzwords might sound clever to some, but I think it merely disguises the fact that you're not saying much.

If you work as a data scientist, say something like this instead:

> In my role as a data scientist at Sunnyville Hospital, I analyze huge amounts of data from medical equipment using Python and Pandas (gigabytes per day), to find anomalies that can help doctors improve operating-room procedures.

This explains what your role is, but it also states what field you work in, what tools you use, who your "clients" are, and how you help them.


## Don't ignore instructions

You'd think this one goes without saying, but some candidates don't seem to be good at following instructions.

For example, if the application form says "your written interview should be anonymous to help us reduce bias" and they head it up with their full name, that's not a great sign. We all make mistakes, so I don't discount these submissions just for that, but ignoring instructions won't count in your favour.


## Some resume tips

All of the advice above also applies to what you write in your resume/CV. However, here are a few additional tips specific to resumes.

### Check your GitHub profile

If you link to your GitHub profile, make sure there's decent projects on it. If it's just a bunch of projects like `fork-of-popular-project-i-never-touched`, `random-university-assignment`, and `half-baked-data-science-script`, don't link to your profile at all.

But if you have a couple of well-curated projects you're proud of, by all means, include the profile link.

### Show what you've built

Generalising the advice about your GitHub profile: show what you've built. This is one of the strongest signals startups will look for, and it will work well for established companies too.

If it's a project you've built, link to its website or GitHub project page. If it's some significant contributions to a popular open source project, describe that in a sentence or two and link to your PRs.

But you can also show what you've built at a closed-source company by describing in clear detail what parts of the product you worked on. For example:

> At Shopify, I redesigned their HTML email templates to a design that almost doubled click rate, from 15% to 27%.

### Write in English (or the expected language)

If the application form is in English, make sure your resume and cover letter are in English too. Our company communicates in English, so we require applications to be in that language so all of us can read them.

### Skills: don't include them all

Don't include a "skills" section that lists almost every programming language or framework under the sun:

> Skills: JavaScript, TypeScript, Node.js, React, Java, Kotlin, Python, Django, Flask, R, Rust, PHP, Perl, C/C++, Golang, C#, .NET, Bash, Powershell.

To me that looks like you're a jack of all trades, master of none. I'd much rather see something like this:

> Deep experience with Python and some exposure to C#. Proficient at shell scripting, and quick at picking up new languages as needed.

I've been programming for almost 30 years and have used well over a dozen languages, but on my resume I try to stick to the key ones:

> I’m fluent in Go, Python, C, SQL, and English. I’ve also written a good amount of JavaScript, HTML, C++, and x86 assembly.

### Make it stand out

Make your resume PDF look professional, and not in the lawyers-and-suits sense. Try to give it a touch of good design -- I don't mean by making the background pink and green, but by paying some attention to layout and fonts.

To quote a friend:

> Don't make it look like a Word doc. If I see a wall of text, black-bordered tables, bad fonts and no spacing, it gives me "poor communicator" vibes pretty fast. Googling "resume template" gets some pretty decent options for low effort.

I'm sure there are many other resume tips I could include here -- send me an email if you have suggestions.


## Endnote

I work at Canonical, and we have to choose the best from the tens of thousands of job applications we get every month. A lot has been said online about our interview process, not all of it very kind. I'd love it if our hiring process was shorter, but the written interview part (the part people seem to protest the most) I actually find quite useful.

Interestingly, while I was writing this article, Canonical added the following statement to our application form:

> During this application process I agree to use only my own words. I understand that plagiarism, the use of AI or other generated content will disqualify my application.

I believe avoiding ChatGPT will improve any application, but Canonical now *requires* that you avoid it. I suspect other companies with large numbers of applicants will follow suit.

Canonical's head of documentation wrote an article about [how our written interview also reduces bias](https://canonical.com/blog/written-interviews) in the interview process.

We're a fully remote company, so written communication is important -- it's essential that we evaluate how well someone can relate their experience and convey technical ideas using nothing but words.

And yes, [we're always hiring](https://canonical.com/careers).
