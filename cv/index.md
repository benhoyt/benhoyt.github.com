---
layout: default
title: Ben Hoyt’s Resume/CV
permalink: /cv/
---
# {{ page.title }}

<blockquote>
 <p class="no-print"><b>Go to:</b>
  <a href="#summary">Summary</a> |
  <a href="#skills-what-i-do">Skills</a> |
  <a href="#experience">Experience</a> |
  <a href="#education">Education</a> |
  <a href="#about-me">About me</a> |
  <a href="/cv/ben-hoyt-cv-resume.pdf" title="PDF version of my CV / resume">PDF</a>
 </p>
</blockquote>


## Summary

I’m a software engineer with fourteen years of experience developing web applications and embedded firmware, as well as providing technical oversight for small teams of software developers.

I’m fluent in Python, C, SQL, JavaScript, HTML, and English. I’ve also written a good amount of C++, C#, Swift, Objective-C, and x86 assembly. I learn quickly, care about detail, and love computers and mathematics.


## Skills: what I do...

* Develop **websites** that perform well and are easy to use. I’ve used various languages and databases, and I’m experienced with the scaling and caching required for large-scale websites (2M pageviews per day).
* Create **native apps** for iOS and Android devices. I’m familiar with all aspects of app development from design to code to app store submission.
* Contribute to **open source** projects, for example Python ([more here](/projects/)).
* Administer **web servers** and automate complex code deployments on Windows or Linux.
* Write **desktop tools** and automated test software.
* Develop **embedded firmware** for data loggers, control systems, and other electronic devices, using 16-bit and 32-bit microcontrollers.
* Provide **technical leadership** for small teams of software engineers, and oversee product development.
* **Communicate and document** effectively and relate well to people.


## Experience

### [Jetsetter](https://www.jetsetter.com/) / [**TripAdvisor**](https://www.tripadvisor.com/) &ndash; Principal Software Engineer &ndash; July 2016 to now:

* Designed and developed a real-time image scaling and badging service using Python and ImageMagick (able to serve hundreds of image scaling requests per second).
* Implemented a [duplicate image detector](http://tech.jetsetter.com/2017/03/21/duplicate-image-detection/) using the dHash perceptual hash algorithm and BK-Tree data structures.
* Wrote a type-safe image metadata injection service using Scala and ElasticSearch.
* Worked on internal server setup and deployment tools, load balancing configuration, and React-based admin tools.
* Instigated database best practices on the engineering team.


### [Oyster.com](https://www.oyster.com/) / [**TripAdvisor**](https://www.tripadvisor.com/) &ndash; Software Engineer and Technical Manager &ndash; June 2010 to June 2016:

* Ported our legacy C++ web backend to Python. Instead of generating static HTML, we now render all pages dynamically, in a language that lets us develop and release business-level features much more quickly.
* Helped design and implement a [custom content management system](http://tech.oyster.com/when-building-your-own-cms-is-the-right-choice/) that enabled us to publish hotel reviews realtime. The CMS is also used to write all of our travel content, with an integrated system that allows us to help users and boost revenue.
* Co-developed two mobile apps: a cross-platform [iOS](https://itunes.apple.com/us/app/oyster.com-hotel-reviews-photos/id499564162) and [Android](https://play.google.com/store/apps/details?id=com.oyster.app) app using React Native, and Oyster’s older iPad app written in Objective-C.
* Wrote Python and JavaScript libraries to display real-time pricing via TripAdvisor’s hotel pricing API, resulting in a sizeable revenue increase.
* Implemented the backend for various website features, including a tag-based [photo search engine](http://tech.oyster.com/how-our-photo-search-engine-really-works/) and a hotel booking system.
* Implemented many web-based internal tools, such as a photo album editor and a workflow system to help salespeople schedule photoshoots at hundreds of hotels per month.
* Wrote tools for our web infrastructure: a new [code deployment system](http://tech.oyster.com/using-ansible-to-restore-developer-sanity/) using Ansible, tools to translate and localize the entire website, a data analytics pipeline using Snowplow Analytics and Amazon Redshift, and a system to send personalized emails.
* Managed the transition of our 12 points of sale from plain http to SSL while closely monitoring SEO performance.
* Co-wrote heavily parallelized software to resize and watermark millions of images in many different sizes using Amazon EC2.
* Managed a small team of software developers. Oversaw architecture decisions and performed code reviews for most of Oyster’s software projects. Helped the team switch from Subversion to Git. Led the hiring of new software engineers.


### [Brush Technology](http://brush.co.nz/) &ndash; Software Engineer and Co-director &ndash; August 2006 to May 2010:

* Co-founded and designed the [microPledge](http://micropledge.brush.co.nz/) crowd funding website, and developed about a third of its codebase (in Python and PostgreSQL). microPledge implemented secure financial transactions, advanced Ajax-based voting, and scaled to thousands of campaigns and users.
* Designed, implemented, and promoted [Gifty Weddings](https://giftyweddings.com/), a website that helps couples make great wedding gift registries.
* Wrote embedded firmware in C++ for [Hamilton Jet’s](https://www.hamjet.co.nz/) large-scale jetboat control systems. Wrote testing and GUI tools in Python and C#.
* Worked on cellular telemetry firmware and GPS interfaces using Atmel AVR and ARM7 micros for various clients.
* Developed low-latency IP networking software in C and Python for a client in the high-frequency trading industry.
* Wrote articles for our [programming blog](http://blog.brush.co.nz/), for example, on [Knuth](http://blog.brush.co.nz/2009/04/knuth/), [protothreads](http://blog.brush.co.nz/2008/07/protothreads/), and [bloatware](http://blog.brush.co.nz/2008/06/snappy-software/).
* Managed projects and staff. As a cofounder, I was also heavily involved with the company’s business planning and decisions.


### [Harvest Electronics](http://www.harvest.com/) &ndash; Software Engineer &ndash; October 2002 to July 2006:

* Designed and developed the [web and admin interface](http://www.harvestnz.com/) for their solar-powered weather stations &ndash; the clean UI and weather graphs really made Harvest’s product stand out. Wrote software to interface to the GPRS modems and administered associated databases and web servers.
* Wrote embedded firmware in C and assembler for MSP430 and ARM7 micros, including low-level boot loaders, serial and radio comms, digital audio, and I/O control logic.
* Developed various network and serial comms tools in C, C++, and Python. Worked heavily with the Win32 API.


## Education

I have a B.E. in electrical and computer engineering, and graduated from the [University of Canterbury](http://www.canterbury.ac.nz/) in 2002 with first class honors, [GPA](http://www.canterbury.ac.nz/courses/glossary.shtml#g "Scale: A+ is 9, D is 0")&nbsp;7.9/9. For my final-year project I designed a small stack-based CPU in VHDL.


## About me

<p class="right-callout">I have also discovered a truly marvelous proof of <a href="https://en.wikipedia.org/wiki/Hofstadter's_law">Hofstadter’s Law</a>, but unfortunately this margin is too narrow to contain it.</p>

My dad taught me how to program by teaching me the Tao of [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)). Two of my first projects were writing a Forth compiler in x86 assembly, and then writing a small 32-bit OS in my Forth. I love things small, fast, and light&nbsp;&ndash; and that’s paid off, especially in my embedded work.

Other than that, I enjoy reading and [writing](/writings/), and I edited and designed a [small-scale magazine](/prism-magazine/). I’m into unicycling, typography, and piano. I love my wife and family. I aim to keep the commandments, but you may find me breaking the conventions.
