---
layout: default
title: "Every dependency you add is a supply chain attack waiting to happen"
permalink: /writings/dependencies/
description: "Dependencies are a huge supply chain security risk; the more of them you have, and the more often you update, the bigger the attack surface."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2026</p>


In my essay ["The small web is beautiful"](/writings/the-small-web-is-beautiful/), I discussed how using [fewer dependencies](/writings/the-small-web-is-beautiful/#fewer-dependencies) makes programs smaller. But it also makes them safer.

As we've seen recently, third-party libraries can and do get compromised. We saw this on a grand scale with the [XZ backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor), and we've seen it more recently with the [Trivy incident](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know/) and with [LiteLLM being compromised](https://lwn.net/Articles/1064693/) (which was actually caused by Trivy).

The interesting thing about Trivy is that it's not even a runtime dependency; it's a dev dependency. But a compromise in a dev dependency can still steal credentials and take over projects.

The careful reader may note that my title is not quite accurate. It's not every dependency you add that's a problem; it's every dependency you *update*. When you evaluated the dependency initially (and added its hash to your lockfile), you probably did your due diligence. But your project is using Dependabot, so the dependencies get updated automatically with little review.

You should probably [turn off Dependabot](https://words.filippo.io/dependabot/). In my experience, we get more problems from automatic updates than we would by staying on the old versions until needed.

So, please think twice, or thrice, before adding a new dependency to your project. As the [Go proverb](https://go-proverbs.github.io/) says, "a little copying is better than a little dependency".


{% include sponsor.html %}
