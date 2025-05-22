---
layout: default
title: Ben Hoyt’s Resume/CV
permalink: /cv/
---
<h1 id="ben-hoyts-resumecv" class="no-print">{{ page.title }}</h1>

<blockquote>
 <p class="no-print"><b>Go to:</b>
  <a href="#summary">Summary</a> |
  <a href="#skills-what-i-do">Skills</a> |
  <a href="#experience">Experience</a> |
  <a href="#education">Education</a> |
  <a href="#about-me">About me</a> |
  <a href="/cv/ben-hoyt-cv-resume.pdf" title="PDF version of my resume / CV">PDF</a>
 </p>
</blockquote>


## Summary

I’m a software engineer with twenty years of experience developing web applications and services, as well as providing technical leadership for small teams of software developers.

I’m fluent in Go, Python, C, SQL, and English. I’ve also written a good amount of JavaScript, HTML, C++, and x86 assembly. I learn quickly, care about detail, and love computer science and mathematics.

I live in New Zealand, but have dual NZ and U.S. citizenship. I lived and worked in New York City from 2010 to 2019, and I’m open to remote work and some travel.


## Skills: what I do...

### Software development

* Develop backend web systems and services that perform well and are easy to use. I’ve used various languages and databases, and I’m experienced with microservices as well as the scaling and caching required for large sites.
* Contribute to frontend development: I've used HTML, CSS, vanilla JavaScript, React, and Elm.
* Use DevOps and scripting: I can configure Kubernetes, create Docker images, develop infrastructure as code, administer servers, and automate complex code deployments on Linux and Windows.
* Provide Go and Python expertise from many years of experience with both languages.
* Create and contribute to open source projects, for example [GoAWK](https://github.com/benhoyt/goawk), [Python's `os.scandir`](/writings/scandir/), [inih](https://github.com/benhoyt/inih), and [others](/projects/).

### Technical leadership

* Work with engineers to design complex systems (and simplify them!). Work with product managers to plan and prioritize features.
* Manage hiring of new engineers. Review and interview candidates.
* Mentor developers, review code, and help establish good engineering practices.
* Communicate and document effectively, and relate well to people.
* Give internal technical talks and training.


## Experience

### [Canonical](https://canonical.com/) &ndash; Senior Engineer and Manager &ndash; Sep 2020 to now

* Led the team and developed code for the [`ops` library](https://github.com/canonical/operator), a Python framework for writing [Juju](https://juju.is/) charms. I brought stability and cohesiveness to the library.
* Implemented large parts of the [Pebble](https://github.com/canonical/pebble) service manager (written in Go), as well as its [Python client](https://github.com/canonical/operator/blob/320e7e04e737000abc1d25729ccd29d6e783e6df/ops/pebble.py#L1452). I also provided in-depth code reviews for other contributors.
* Developed features for and helped maintain [Juju](https://github.com/juju/juju), a cross-cloud application deployment tool (and one of the largest Go codebases in the world).

### [Compass](https://www.compass.com/) &ndash; Senior Engineer and Manager &ndash; Mar 2018 to Aug 2020:

* Helped build Go microservices backed by PostgreSQL, including an API integration to a third party CRM. Wrote a program to generate Go code from a Swagger API definition.
* Wrote code and provided technical leadership for the SEO team, including Python services and programs for processing logs in AWS Athena. Our team significantly improved indexing and search ranking for our key pages.
* Managed a team of backend and frontend engineers. Remained technically involved in system design and code reviews of the team's Go codebase.
* Oversaw development and launch of the Compass CRM, a high-profile project that was heavily promoted to our 5000+ real estate agents.
* Wrote an internal proposal to migrate 200 engineers from using Gerrit to GitHub for code review. The proposal saw fruition and increased developer velocity.

### [Jetsetter](https://www.jetsetter.com/) / [**TripAdvisor**](https://www.tripadvisor.com/) &ndash; Principal Engineer &ndash; Jul 2016 to Feb 2018:

* Led the team in designing a content management system using Contentful and Elasticsearch, with the goal to simplify and unify several internal systems.
* Designed and developed a real-time image scaling service using Python and ImageMagick. It served hundreds of image scaling requests per second.
* Wrote a [duplicate image detector](/writings/duplicate-image-detection/) using the dHash perceptual hash algorithm and BK-Tree data structures.
* Managed a small team of engineers. Reviewed code and system designs. Implemented good database practices on the team.


### [Oyster.com](https://www.oyster.com/) / [**TripAdvisor**](https://www.tripadvisor.com/) &ndash; Engineer and Technical Manager &ndash; Jun 2010 to Jun 2016:

* Ported a legacy C++ web backend to Python. The change of language and tooling let us develop and release business-level features much quicker.
* Helped design and implement a JSON-based content management system that let us publish immediately and gave us opportunities to boost revenue.
* Co-developed two mobile apps: a cross-platform iOS and Android app using React Native, and Oyster’s older iPad app written in Objective-C.
* Wrote Python and JavaScript libraries to display real-time pricing via TripAdvisor’s hotel pricing API, resulting in a large revenue increase.
* Implemented the backend for various website features, including a tag-based [photo search engine](/writings/how-our-photo-search-engine-really-works/) and a hotel booking system.
* Implemented internal tools such as a photo album editor and a workflow system to help salespeople schedule photoshoots at a rate of 1000 hotels per month.
* Wrote tools for our web infrastructure: a new [code deployment system](/writings/using-ansible-to-restore-developer-sanity/) using Ansible, tools to translate and localize the entire website, a data analytics pipeline using Snowplow Analytics and Amazon Redshift, and a system to send personalized emails.
* Co-wrote heavily parallelized software to resize and watermark millions of images in many different sizes using Amazon EC2.
* Managed a team of engineers and led hiring efforts. Oversaw architecture decisions and performed code reviews for most of Oyster’s software projects.


### [Brush Technology](https://brush.co.nz/) &ndash; Engineer and Co-director &ndash; Aug 2006 to May 2010:

* Co-founded and co-developed the [microPledge](https://benhoyt.com/writings/micropledge/) crowd funding platform. Implemented secure financial transactions, Ajax-based voting, and S3 file uploads.
* Designed, implemented, and promoted [Gifty Weddings](https://giftyweddings.com/), a website that helps couples make great wedding gift registries. (I still run the site today.)
* Wrote embedded firmware in C++ for [Hamilton Jet’s](https://www.hamiltonjet.com/) large-scale jetboat control systems. Wrote testing and GUI tools in Python and C#.
* Worked on cellular telemetry firmware and GPS interfaces using Atmel AVR and ARM7 microcontrollers.
* Developed low-latency IP networking software in C and Python for a client in the high-frequency trading industry.
* Managed projects and staff. As a cofounder, I was heavily involved with the company’s business planning and decisions.


### [Harvest Electronics](http://www.harvest.com/) &ndash; Engineer &ndash; Oct 2002 to Jul 2006:

* Designed and developed the [web and admin interface](https://live.harvest.com/) for their solar-powered weather stations. The clean UI and weather graphs really made Harvest’s product stand out.
* Wrote software to interface to GPRS modems. Administered associated databases and web servers.
* Wrote embedded firmware in C and assembler for MSP430 and ARM7 microcontrollers, including low-level boot loaders, serial communications, and I/O control logic.


## Education

I have a B.E. in Electrical and Computer Engineering, graduating from the [University of Canterbury](http://www.canterbury.ac.nz/) in 2002 with first class honors, <abbr title="Scale: A+ is 9, D is 0">GPA&nbsp;7.9/9</abbr>. For my final-year project I designed a small stack-based CPU using VHDL. I was dux (valedictorian) of [Havelock North High School](https://www.hnhs.school.nz/) in 1999.


## About me

<p class="right-callout">I have also discovered a truly marvelous proof of <a href="https://en.wikipedia.org/wiki/Hofstadter's_law">Hofstadter’s Law</a>, but unfortunately this margin is too narrow to contain it.</p>

My dad taught me how to program by teaching me the Tao of [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)). Two of my first projects were writing a [Forth compiler](https://github.com/benhoyt/third) for DOS, and creating a [small 32-bit OS](https://github.com/benhoyt/benos) in Forth. I love things small, fast, and light&nbsp;&ndash; and that’s paid off during my career.

Other than that, I enjoy reading and [writing](/writings/), and I once edited a [small print magazine](/prism-magazine/). I’m into unicycling, typography, and piano. I love my wife and family. I aim to keep the commandments, but you may find me breaking the conventions.
