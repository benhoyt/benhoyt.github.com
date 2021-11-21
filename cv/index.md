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

I’m a software engineer with fifteen years of experience developing web applications and services, as well as providing technical leadership for small teams of software developers.

I’m fluent in Go, Python, C, SQL, HTML, and English. I’ve also written a good amount of JavaScript, C++, and x86 assembly. I learn quickly, care about detail, and love computer science and mathematics.

I live in New Zealand, but have dual NZ / U.S. citizenship. I lived and worked in New York City from 2010 to 2019, and I’m open to remote work and some travel.


## Skills: what I do...

### Software development

* Develop backend web systems and services that perform well and are easy to use. I’ve used various languages and databases, and I’m experienced with microservices as well as the scaling and caching required for large sites.
* Contribute to frontend development: I'm familiar with vanilla JavaScript, React, Elm, CSS, and other frontend technologies.
* DevOps and scripting: create Docker images, develop infrastructure as code, administer servers, and automate complex code deployments on Linux and Windows.
* Contribute to open source projects, for example Python ([more here](/projects/)).

<!--
* Create native apps for iOS and Android devices. I’m familiar with all aspects of app development from design to code to app store submission.
* Develop embedded firmware for data loggers, control systems, and other electronic devices. Write code for 16-bit and 32-bit microcontrollers.
-->

### Technical leadership

* Work with engineers to design and architect complex systems. Work with product managers to plan and prioritize features.
* Manage hiring of new engineers. Review and interview candidates.
* Mentor developers, review code, and help establish engineering best practices.
* Communicate and document effectively, and relate well to people.
* Give internal technical talks and training. Provide Python expertise from many years of experience with the language.


## Experience

### [Canonical](https://canonical.com/) &ndash; Software Engineer &ndash; September 2020 to now

* Design and develop features for [Pebble](https://github.com/canonical/pebble), an API-driven service manager written in Go, and its corresponding Python client in Juju's [Python Operator Framework](https://github.com/canonical/operator).
* Develop features for and help maintain [Juju](https://github.com/juju/juju), a cross-cloud application deployment tool (and one of the largest Go codebases in the world).

### [Compass](https://www.compass.com/) &ndash; Senior Software Engineer &ndash; March 2018 to August 2020:

* Helped build Go microservices backed by PostgreSQL, including an API integration to a third party CRM. Wrote a code generator to generate Go structs and methods from a Swagger API definition.
* Wrote code and provided technical leadership for the SEO team, including Python services and Athena log data processing. Our team significantly improved indexation and search ranking for our key pages.
* Managed a team of backend and frontend engineers. Did people management as well as remaining very technically involved in system design, architecture discussions, and code reviews of the team's Go codebase.
* Oversaw development and launch of the Compass CRM, a high-profile project that was heavily promoted to our 5000+ agents.
* Wrote an internal proposal to migrate 200 engineers from using Gerrit to GitHub for code review. The proposal saw fruition and increased developer velocity.

### [Jetsetter](https://www.jetsetter.com/) / [**TripAdvisor**](https://www.tripadvisor.com/) &ndash; Principal Software Engineer &ndash; July 2016 to February 2018:

* Helped architect a structured content management system and search API using Contentful and Elasticsearch, simplifying and unifying several internal systems.
* Designed and developed a real-time image scaling service using Python and ImageMagick. It’s able to serve hundreds of image scaling requests per second.
* Implemented a [duplicate image detector](/writings/duplicate-image-detection/) using the dHash perceptual hash algorithm and BK-Tree data structures.
* Wrote a type-safe image metadata injection service using Scala and Elasticsearch.
* Managed a small team of engineers. Performed architecture and code reviews. Implemented database best practices on the team.


### [Oyster.com](https://www.oyster.com/) / [**TripAdvisor**](https://www.tripadvisor.com/) &ndash; Software Engineer and Technical Manager &ndash; June 2010 to June 2016:

* Ported a legacy C++ web backend to Python. The change of language and tooling let us develop and release business-level features much more quickly.
* Helped design and implement a [custom content management system](http://tech.oyster.com/when-building-your-own-cms-is-the-right-choice/) that enabled us to do all publishing in realtime. The approach to structured content made integrations easy and gave us opportunities to boost revenue.
* Co-developed two mobile apps: a cross-platform iOS and Android app using React Native, and Oyster’s older iPad app written in Objective-C.
* Wrote Python and JavaScript libraries to display real-time pricing via TripAdvisor’s hotel pricing API, resulting in a large revenue increase.
* Implemented the backend for various website features, including a tag-based [photo search engine](/writings/how-our-photo-search-engine-really-works/) and a hotel booking system.
* Implemented internal tools such as a photo album editor and a workflow system to help salespeople schedule photoshoots at about 1000 hotels per month.
* Wrote tools for our web infrastructure: a new [code deployment system](/writings/using-ansible-to-restore-developer-sanity/) using Ansible, tools to translate and localize the entire website, a data analytics pipeline using Snowplow Analytics and Amazon Redshift, and a system to send personalized emails.
* Managed the transition of our 12 points of sale from plain HTTP to secure HTTPS while closely monitoring SEO performance.
* Co-wrote heavily parallelized software to resize and watermark millions of images in many different sizes using Amazon EC2.
* Managed a team of engineers. Oversaw architecture decisions and performed code reviews for most of Oyster’s software projects. Helped the team switch from Subversion to Git. Led the hiring of new software engineers.


### [Brush Technology](https://brush.co.nz/) &ndash; Software Engineer and Co-director &ndash; August 2006 to May 2010:

* Co-founded and co-developed the [microPledge](http://micropledge.brush.co.nz/) crowd funding platform. Implemented secure financial transactions, Ajax-based voting, and S3 file uploads.
* Designed, implemented, and promoted [Gifty Weddings](https://giftyweddings.com/), a website that helps couples make great wedding gift registries.
* Wrote embedded firmware in C++ for [Hamilton Jet’s](https://www.hamiltonjet.com/) large-scale jetboat control systems. Wrote testing and GUI tools in Python and C#.
* Worked on cellular telemetry firmware and GPS interfaces using Atmel AVR and ARM7 micros for various clients.
* Developed low-latency IP networking software in C and Python for a client in the high-frequency trading industry.
* Managed projects and staff. As a cofounder, I was also heavily involved with the company’s business planning and decisions.


### [Harvest Electronics](http://www.harvest.com/) &ndash; Software Engineer &ndash; October 2002 to July 2006:

* Designed and developed the [web and admin interface](https://live.harvest.com/) for their solar-powered weather stations. The clean UI and weather graphs really made Harvest’s product stand out.
* Wrote software to interface to GPRS modems. Administered associated databases and web servers.
* Wrote embedded firmware in C and assembler for MSP430 and ARM7 micros, including low-level boot loaders, serial communications, and I/O control logic.
* Developed various network tools in C and C++. Worked with the Win32 API.


## Education

I have a B.E. in Electrical and Computer Engineering, and graduated from the [University of Canterbury](http://www.canterbury.ac.nz/) in 2002 with first class honors, [GPA](https://www.canterbury.ac.nz/study/qualifications-and-courses/glossary-of-terms/#g "Scale: A+ is 9, D is 0")&nbsp;7.9/9. For my final-year project I designed a small stack-based CPU in VHDL.


## About me

<p class="right-callout">I have also discovered a truly marvelous proof of <a href="https://en.wikipedia.org/wiki/Hofstadter's_law">Hofstadter’s Law</a>, but unfortunately this margin is too narrow to contain it.</p>

My dad taught me how to program by teaching me the Tao of [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)). Two of my first projects were writing a Forth compiler in x86 assembly, and then writing a small 32-bit OS in my Forth. I love things small, fast, and light&nbsp;&ndash; and that’s paid off during my career.

Other than that, I enjoy reading and [writing](/writings/), and I once edited a [small print magazine](/prism-magazine/). I’m into unicycling, typography, and piano. I love my wife and family. I aim to keep the commandments, but you may find me breaking the conventions.
