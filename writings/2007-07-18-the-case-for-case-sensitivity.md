---
layout: default
title: "The Case for case sensitivity"
permalink: /writings/the-case-for-case-sensitivity/
description: "The Case for case sensitivity"
canonical_url: https://blog.brush.co.nz/2007/07/the-case-for-case-sensitivity/
---
<h1>The Case for case sensitivity</h1>
<p class="subtitle">July 2007</p>

> [Original article on blog.brush.co.nz](https://blog.brush.co.nz/2007/07/the-case-for-case-sensitivity/)


<p><a href="http://en.wikipedia.org/wiki/Garamond" title="Isn't Garamond lovely?"><img style="width:auto" alt="Aa" class="right" height="83" src="/images/brushblog/2007_07_aa.jpg" width="125"/></a>Jeff Atwood’s <a href="http://www.codinghorror.com/blog/archives/000458.html">post on the evils of case sensitivity</a> is the longest-lived blog post I’ve ever seen. He wrote it at the end of 2005, but people are still commenting now, a year and a half later. Wow!</p>

<p>His main point is that case sensitivity is evil, and that all programming languages should instead be case-insensitive but case-preserving. He argues that case sensitivity wastes time, and he’s never seen any evidence that case sensitivity saves time.</p>

<p>Well, here we go: I like Python’s case sensitivity, and I’ve rarely had a bug caused by it. <b>Plus, I’m convinced case sensitivity saves time.</b> How? In our code we do this sort of thing all the time:</p>

<blockquote>
<code>user = User('ben')</code>

</blockquote>

<p>Which creates a new instance of the <code>User</code> class and fills it with ben’s data. Some people think this kind of naming is evil, but for us it’s clear, concise, and <a href="http://www.python.org/dev/peps/pep-0020/">Pythonic</a>. I mean, what are the alternatives?</p>

<blockquote>
<code>usr = user('ben')</code><br/>
<code>user = user_t('ben')</code><br/>
<code>user = user_class('ben')</code><br/>
<code>user = get_user('ben')</code>

</blockquote>

<p>All icky, if you ask me. The last one’s the best, but then <code>get_user</code> no longer makes much sense as a class name, such as when using class methods like <code>count = get_user.count()</code>.</p>

<p>The English language does something similar, except it has the opposite convention — a class is always lower case and an instance capitalised. For example, “Of all the cars I know, the <a href="http://en.wikipedia.org/wiki/Image:911_Carrera.jpg">Porsche 911</a> remains The Car.”</p>

<p>English has <a href="http://en.wikipedia.org/wiki/List_of_case-sensitive_English_words">other case sensitivities</a> as well:</p>

<ul>
<li><i>a Pole on a pole</i> — what <a href="http://www.distant.ca/UselessFacts/fact.asp?ID=166">Daniel Baraniuk</a> does</li>
<li><i>a pole on a Pole</i> — something you’d see in a circus</li>
<li><i>a pole on a pole</i> — to hang your flags on in Antarctica</li>
<li><i>a Pole on the Pole</i> — someone you’re likely to meet <a href="http://en.wikipedia.org/wiki/Henryk_Arctowski_Polish_Antarctic_Station">here</a></li>
</ul>

<p>But back to programming. Programmers are “sensitive” people — sensitive enough to care about case. Non-geeks might be tempted to say we’re members of the Upper Case. But I believe it boils down to this:</p>

<blockquote>
<p><b>Case sensitivity is great, but you need a convention.</b></p>

</blockquote>

<p>In fact, you need <a href="http://www.python.org/dev/peps/pep-0008/">good conventions</a> whether you’re case-sensitive or not, but that’s another story.</p>

<p>It pays for your in-house convention to be similar to other people’s. And lets face it, in any given language there’s only one or two conventions to choose from. The one that’s worked for us is pretty simple:</p>

<ul>
<li>classes capitalised, instances lower, so <code>user = User('ben')</code></li>
<li>short variable names lower, like <code>root</code> and <code>session</code></li>
<li>longer variable names lowerCamelCase, like <code>initPage</code></li>
</ul>

<p>We made those decisions early on. They’ve proved simple and efficient. And, strangely enough, we don’t have any of Jeff’s “I just spent the last hour…” horror stories to tell.</p>



<h2>Comments</h2>

<h3>J Vincent Toups <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 14:46</span></h3>

<p>I think you are right, but you forgot one other solution to the problem: separate namespaces for functions and variables (this is how Common Lisp “deals with” the problem).  While this approach has its advantages, I think it may be more trouble than its worth.  As in everything, though, I reserve final judgment.</p>

<h3>Jonathan Allen <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 15:18</span></h3>

<blockquote>
<p>I mean, what are the alternatives?</p>
</blockquote>

<p>I don’t know… maybe trying to give your variable a better name than “user”? It is usually a bad sign when your variable name is the same as your class name.</p>

<h3>Ben <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 15:36</span></h3>

<p>Jonathan, that’s the standard response (“it is usually a bad sign…”). But why is it a bad sign? I agree that something like <code>obj</code> would be a bad variable name, but why is <code>user</code> bad, if that’s exactly what it is? Can you give a specific example that’s not icky like <code>user_object = user('ben')</code>?</p>

<h3>Kent Boogaart <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 15:37</span></h3>

<blockquote>
<p>It is usually a bad sign when your variable name is the same as your class name.</p>
</blockquote>

<p>Why? If I am declaring a variable to represent the user, then ‘user’ is a perfect name. What would you suggest? ‘theUser’, ‘aUser’, ‘theCurrentUser’? It only makes sense to qualify the variable name if there is something distinguising about it with which you can qualify. For example:</p>

<p>User loggedOnUser = …;
User impersonatingUser = …;</p>

<p>It is often desirable to name method parameters in a similar fashion:</p>

<p>public void Logout(User user)</p>

<p>Again, what would you suggest?</p>

<p>public void Logout(User theUserToLogout)?</p>

<p>If it wasn’t obvious, I love case sensitivity. Another reason for it is consistency. I’d hate reading C# code where some devs use ‘String’ and others use ‘string’. I wish there was only one choice.</p>

<h3>Gordon Mohr <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 19:25</span></h3>

<p>Java, too, resolves this issue with separate namespaces. That is, </p>

<p>User user = new User(“bob”);</p>

<p>works. (In a context where there’s only one User, I wouldn’t even say that’s bad style.) Capitalization of classes is a convention rather than a requirement, so </p>

<p>user user = new user(“bob”);</p>

<p>would be legal, albeit unwise. </p>

<p>Another factor: I suspect case sensitivity makes programming somewhat harder for people whose mother script lacks casing. Is that a bug or a feature?</p>

<h3>Ishmaeel <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 22:19</span></h3>

<p>If you are writing..</p>

<p>user = User(‘ben’)</p>

<p>what you are doing is </p>

<p>1) Error prone (invites typos)
2) Uninformative
3) Wrong (or not correct enough)</p>

<p>My approach is this: “User” is the name of the class. An object instantiated with it is not “User” as in “The User”. The object has a very specific use and calling it “user” is simply omitting information. Try this:</p>

<p>currentUser = User(‘ben’)</p>

<p>Benefits?</p>

<p>1) Your code is self commenting.
2) A 1-letter-typo will cause less havoc.
3) Next developer who will be maintaining / extending your code will not be tempted to write something like user2 = User(‘maria’)</p>

<h3>lm <span style="padding-left: 1em; color: #bbb;">18 Jul 2007, 22:47</span></h3>

<p>Excellent article. I also like case-sensitive languages more because casing conveys additional information and reduces ambiguity while keeping the code compact. It’s a pity that even experienced coders can’t agree on such a tiny issue.</p>

<h3>cw <span style="padding-left: 1em; color: #bbb;">19 Jul 2007, 01:40</span></h3>

<p>Ishmaeel:</p>

<p>I’ve never once heard of somebody making that mistake. U an u are pretty distinguishable, as are most other capital vs. lowercase pairs. Unless you’re using size 6 font, in which case you should consider increasing it.</p>

<h3>Stephen <span style="padding-left: 1em; color: #bbb;">19 Jul 2007, 01:51</span></h3>

<p>Atwood is an idiot anyway (or just writes consistently half-baked posts). Good post, and excellent points that I hadn’t thought of.</p>

<h3>Maybe... <span style="padding-left: 1em; color: #bbb;">19 Jul 2007, 02:32</span></h3>

<p>Odd/camel casing tends to slow me down when typing–is this a consideration?</p>

<p>I do question the rationale of case insensitivity–the idea that a competent programmer might not realize he used a stupid capitalization.  dOES ANYONE EVER NOT NOTICE CASE CHANGES?  tHEY ARE ONE OF THE FIRST THINGS THAT JUMP OUT AT YOU–OR ME, AT LEAST.  mAYBE OTHER PEOPLE ARE DIFFERENT.  :)  I cannot recall searching hours for a bug only to discover that it was a case problem.  However, I do recall searching for a bug in VB code for a very long time only to discover that the problem was an O in the place of a 0.  (“Why can’t it find the file? It’s right there! Network?”)  And VB doesn’t even have case sensitivity.</p>

<p>True, case sensitivity is a mess if you don’t use a convention.  But absolutely everything in programming is a mess if you don’t follow conventions.  Great blog post.</p>

<h3>Luke <span style="padding-left: 1em; color: #bbb;">19 Jul 2007, 02:41</span></h3>

<p>Is it really that frequent that variables are declared and used in such a way that a static analysis algorithm could not determine if a variable is assigned to before it is used?  I should think that it would be a good idea to make code simple enough such that this sort of analysis could be done.  Would this not make the problem being discussed disappear into the ether?</p>

<p>I guess there is also metaprogramming of methods with method_missing type things, but I still wonder whether it is a good idea, for human brains, to write code that a decent static analysis algorithm could not check for correctness of using methods/variables/etc. that have already been defined/assigned to.  I can see the odd case where the extra complexity is warranted, but what about for most situations?</p>

<p>If you’re going to throw the Halting problem at me, be prepared to argue for a low upper bound.  The Halting problem is irrelevant if halting for 99.99% of programs <em>can</em> be determined.</p>

<h3>Ishmaeel <span style="padding-left: 1em; color: #bbb;">19 Jul 2007, 03:14</span></h3>

<p><strong>@cw:</strong>
Distinction between u and U is not the real issue here. You are adopting a convention and it applies to all letters. Yes, there are specially crafted programming fonts out there that make it a point that every single glyph is easily recognized and distinguished, but it’s only half the problem and even so, it’s not as trivial an issue as you make it out to be. You are compromising readability, maintainability and searchability (is that a word?). </p>

<p>Yes, there are solutions to all these problems, but why create the problems in the first place?</p>

<p>If you allow distinction by case only, all kinds of things can go wrong. The shift key could bail out on you and you might never notice until strange bugs start to show up. (Yes, it is possible to mix &amp; match cases without triggering a compilation error.)</p>

<p><strong>@Kent Boogaart:</strong>
Even if you declare only one user object in that method, distinguishing it from the User class still makes sense.</p>

<p>As to method parameters, I haven’t yet made up my mind about them and in fact, the convention I follow has been like your Logout(User user) example. My reasoning is that its context (=its very specific function) is distinguished by the fact that it is a parameter to this very specific method. That said, I’m still not comfortable about being unable to distinguish between a parameter and a local variable.</p>

<p><strong>@Maybe…:</strong>
If you are writing <em>code</em> as fast as you <em>can</em> type, I sure don’t want to maintain your code after you are fired. pROGRAMMING aNd WrItinG pRoSe are different things, after all.</p>

<h3>Dave Grossman <span style="padding-left: 1em; color: #bbb;">3 Dec 2008, 18:33</span></h3>

<p>Thanks for being the voice of reason. How anybody can argue for the case insensitivity of a compiled language because they had to debug a problem in an interpreted language is beyond my comprehension. I can’t remember the last time I ever made a mistake that had to do with the case of a variable. It is a complete non-issue.</p>

<p>I see it all the time where someone keeps getting burned by some simple thing in a language then they rail against that feature instead of just blaming the person whose fault it really was.</p>

<h3>Michael Mouse <span style="padding-left: 1em; color: #bbb;">30 Sep 2009, 06:49</span></h3>

<p>Completely agree with this article on case conventions in code being sane and preferable to insensitivity, however for file systems case sensitivity is stupid. You don’t write essays about Poles on poles IRL, ever, and you definitely don’t put such things in file names :)</p>

<p>But there is one crime greater than all this, camelCaseWasTheBiggestErrorEver. Why did they do it? It’s bad_enough_we_have_to_do_this – unless we use a grownups-language-like-lisp but thisShouldNeverHaveBeenAllowedToHappen.</p>

<p>What is wrong with you crazy people!</p>

<h3>WhAtevEr <span style="padding-left: 1em; color: #bbb;">6 Mar 2012, 08:20</span></h3>

<p>Sorry but i absolute dissagree – what you need is a convention for your bjectnaming that doenst mean you need case sensitive object names</p>

<p>Actually you already made a case AGAINST case sensivity</p>

<ol>
<li>i think your way of programming is very very bad – 
having same name for different instances just different in case – sorry this will lead to confusion once more than one person will code or you have to read your own code 1 or 2 years later</li>
</ol>

<p>second – even worse – its quiet possible – if someone using your style – that you have somewhere a typo which never lead to an compileerror but produce somwhere bad data within runtime 
a new security leak is born :)</p>

<p>for example you wanna use sessions instead a real username but at the point where the session get assosiated oyu make a typo – so the programm doenst use a session it uses the real username – its quiet possible that many if not all parts are working for a time until you run into a condition where it no longer will – or worse it works but you got a big security hole open</p>

<p>no sorry naming – but case insensitive args are the natural way for computer – they are NOT the natural human way</p>

<p>think about how many time you had yourself a little time penalty because of case sensitive letters – just because typo on the shell – or bug searching typo in your object /instance names …. im not talking about one or 2 big searches – think about all the small ones – just the time took you to rewrite the command and correct your spelling somewhee in the code – or thinking about conventions…</p>

<p>now multiply it with every coder, every *nix operator, every scripter….</p>

<p>now lets assume 2 dollar/ hour rate for correting these 
now we take the money and solve the world hunger… </p>

<p>im wondering how many years we can feed the worlds with that savings</p>

<p>.. from me comming 10 bucks this week alon e- dam fkn typo lead to a cascade of errors where the source where covered and not so easy to find – 5 fkn hours</p>

<p>PPS: always when i have to code some things in visual basic i love it – not because of that ugly Vb but the IDE and the reading of that code – it autocorrect you so you have everywhere a wonderful readable code – same letters for xxx no matter how you wrote it…. at least it helps with the pain usually comes with vb</p>

<h3>WhAtevEr <span style="padding-left: 1em; color: #bbb;">6 Mar 2012, 08:32</span></h3>

<p>pps: fault ans erros are human – just because one person CLAIMS (and i dont belive you and i bet 15 gran you lie) never make a case typo in his condings doenst mean noone will</p>

<p>point is – the benefit is nothing because there lot other ways todo – and it example like in the article should not be used anyway for many reasons</p>

<p>it just raises chances of error – which lead to wasting time to correct it only because someone never thought about real naming conventions</p>

<p>you talk about stupid people making typos and blame others ? i talk about stupid people without a real naming convention</p>

<p>the argument that case insensitive things happen in natural languages like english doenst count because its absolute different thing</p>

<p>even there a typo usually do not lead to confusion because the sense of a possible missspelled word comes from the context and – in case of spoken words – the pronouncing</p>

<p>also interresting that no newer words have different meanings with big and small letters  but mostly old – to very old words have – comming from a differnet culture you cant even compre with a modern programming language</p>

<p>and now guys think twice – lets say you make a case sensitive convention in a coder team with 200 people working comehow on the code – maybe even an opensource project – imagine how much effort you have to make that new people learn and understand AND use it right way</p>

<p>its way easier to say hey convention is var<em>name = variable
obj</em>name = object,…. than 
name = object, Name = variable, namE = function 
:))</p>

<p>no really it just makes things more often more difficult and raises chances of error – which will happen once enough lines of codes are written…</p>

