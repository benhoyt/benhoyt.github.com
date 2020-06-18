---
layout: default
title: "Session 4: Networks and the Internet"
permalink: /programming-class/04-networks/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2016</p>

> These are my "teaching notes" for the fourth session of my [Computers and Programming Class](/programming-class/).


Networks are how computers talk to each other, and "the internet" is the single biggest computer network -- it covers the whole world, and pretty much every personal computer these days is connected to it (desktops, laptops, phones and tablets, and servers).

In this class I hope to teach you the basics of how the internet works, from what happens when you type an address in your browser's URL bar to how the web page actually gets sent to you.


Layers
------

* Physical: optics, wires, electronic signals (cable modem, old-school modem, WiFi radio, cellular radio)
* Low-level packets (Ethernet, MAC addresses, etc)
* Internet Protocol (IP) and TCP/IP
* HTTP
* HTML


Components of the internet
--------------------------

* Domain Name System (DNS)
* IP routing
* HTTP
* Web browser (talks HTTP, shows HTML web pages)
* Desktop vs server


DNS
---

The Domain Name Systems (DNS) is a system that converts nice internet domain names like www.facebook.com or benhoyt.com into internet addresses that your computer can actually use to talk to Facebook (or my website). For example, the internet protocol (IP) address for www.facebook.com is currently 31.13.71.36.

So how does DNS work? How does it look up a name like www.facebook.com or benhoyt.com?

When your computer connects to the internet it only knows the IP address for one thing: your internet provider. For example, Verizon. It might be 192.16.31.23. To look up "what is the IP address for www.facebook.com", here's roughly what happens:

* Your computer asks your internet provider (Verizon) at 192.16.31.23 to give it the IP address for "www.facebook.com".

* Verizon then asks one of the "root" DNS servers -- there are only 13 of them in the world -- what the IP address is for "www.facebook.com". It will respond and say "I don't know, but I know the IP address of the .com DNS server is 123.100.200.42".

* Verizon then asks the .com DNS server at 123.100.200.42, "what is the IP address for www.facebook.com?" The .com server responds and says, "I don't know, but I know the DNS server for .facebook.com is 31.13.71.1". We're almost there, because that's a server at Facebook. We just don't have the final "www" part yet.

* Verizon then does one more step, and asks the DNS server at 31.13.71.1, "what is the IP address of www.facebook.com". Facebook's server says, "I know it! It's 31.13.71.36".

* Finally Verizon sends that back to your very own computer: "At your service, computer! The IP address of www.facebook.com is 31.13.71.36. Enjoy!"

All of this happens in a fraction of a second. And finally your web browser can talk to Facebook and start downloading some web pages (or Facebook news feeds).

However, there's one more important piece. What if you go to another Facebook page a few minutes later? Does it have to do all of that again? (Explain "caching".)


IP routing
----------

IP address (like 203.46.96.100), gateways, masks

What controls all this? Software, sometimes hardware. "IP stack".

TODO


HTTP
----

telnet example.com

```
GET /foo HTTP/1.0

Content-Type: text/html; charset=utf-8
<html>
  <head>
    <title>This is a web page</title>
    <style>
      h1 { font-family: "Times New Roman"; font-weight: bold; }
      p { font-family: "Arial"; }
    </style>
  <head>
  <body>
    <h1>My Web Page</h1>
    <p>First paragraph.</p>
    <p>Second paragraph. <a href="https://benhoyt.com/">A web link.</a></p>
  </body>
</html>
```

TODO ***


Browser
-------

Downloads HTML and other resources (CSS stylesheet, images). Shows them on the screen. Lets you view the content, browser around, click links, etc.

Show them a little HTML: h1, p, b, a, etc


Servers
-------

What is a server? How is it different from a "normal" computer? Can you set up a server yourself?


Homework
--------

Make an HTML web page in a file called webpage.html, then load that in a web browser (Google Chrome for example). Once you have it working, email it to me (I'll remind you) and I'll put it on the internet somewhere.
