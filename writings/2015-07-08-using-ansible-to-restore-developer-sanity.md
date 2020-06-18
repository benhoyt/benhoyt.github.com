---
title: Using Ansible to restore developer sanity
layout: default
permalink: /writings/using-ansible-to-restore-developer-sanity/
description: How we went from a deployment including 28 manual steps to a single Ansible command
canonical_url: http://tech.oyster.com/using-ansible-to-restore-developer-sanity/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2015</p>

> [Original article on tech.oyster.com]({{ page.canonical_url }})

This time a year ago we were deploying new code to [Oyster.com][1] using a completely custom deployment system written in C++. And I don&#8217;t mean real C++; it was more like C with classes, where the original developers decided that `std::string` was &#8220;not fast enough&#8221; and wrote their own string <del>class</del> struct:

```c++
struct SIZED_STRING
{
    const uint8_t *pbData;
    size_t cbData;
};
```

It&#8217;s not our idea of fun to worry about buffer sizes and string lengths when writing high-level deployment scripts.

Then there was the [NIH][2] distributed file transfer system &#8212; client and server. And our own [diffing][3] library, just for fun. All very worthwhile things for a hotel review website to spend time developing in-house! :-)

![Screenshot of our Ansible-based deployment](/images/deployment.png)

Sarcasm aside, this wasn&#8217;t a joke: we replaced more than 20,000 lines of C++ code with about 1000 lines of straight-forward [Ansible][5] scripts. And it really did restore our sanity:

  * Rather than 28 manual steps (some of which, if you ran out of order, could bring the site down) we run a single Ansible command. All we have to specify manually is which revision to deploy and type in some deployment notes to record to our internal log (for example, &#8220;Shipped mobile version of hotel page&#8221;).
  * Instead of spending hours digging into log files on a remote machine whenever our fragile home-grown system broke, Ansible gives us clear and generally easy-to-track down error messages. The most we have to do is SSH to a machine and manually restart something.

## Choice of tools

Some teams within TripAdvisor use [Chef][6] for server setup (and other tools like [Fabric][7] for code deployments). We also looked briefly at [Puppet][8]. However, both Chef and Puppet gave us a very &#8220;enterprisey&#8221; feel, which isn&#8217;t a great match for our team&#8217;s culture.

This is partly due to their agent-based model: Chef, for example, requires a Chef server in between the runner and the nodes, and requires you to install clients (&#8220;agents&#8221;) on each of the nodes you want to control. I think this picture gives a pretty good idea of the number of components involved:

![Chef Diagram](/images/chef_diagram.png)

In contrast, Ansible has basically five parts:

  * playbooks
  * inventory files
  * vars files
  * the `ansible-playbook` command
  * nodes

I&#8217;m sure there are advantages and more power available to systems like Chef, but we really appreciated the simplicity of the Ansible model. Two things especially wooed us:

  1. You don&#8217;t have to install and maintain clients on each of the nodes. On the nodes, Ansible only requires plain old SSH and Python 2.4+, which are already installed on basically every Linux system under the sun. This also means developers don&#8217;t have to learn a new type of authentication: ordinary SSH keys or passwords work great.
  2. Simple order of execution. Ansible playbooks and plays run from top to bottom, just like a script. The only exception to this is &#8220;handlers&#8221;, which run at the end of a play if something has changed (for example, to reload the web server config).

## Ansible Tower UI

Ansible itself is free and open source and [available on GitHub][11]. But they also provide a fancy web UI to drive it, called [Ansible Tower][12]. It&#8217;s nice and has good logging and very fine-grained permissions control, but we found it was somewhat tricky to install in our environment, and as developers it didn&#8217;t gain us much over running a simple command.

Our thinking is that in a larger organization, where they need finer-grained permissions or logging, or where non-developers need to kick off deployments, using Ansible Tower would pay off.

![Ansible Tower Screenshot](/images/tower2_jobstatus.png)

## Our deployment scripts

As noted above, Ansible has a very simple order of execution, and its model is kind of a cross between declarative (&#8220;get my system configuration into this state&#8221;) and imperative (&#8220;do this, run this, then try this&#8221;). Our site deployment involves some system configuration, but is mostly a series of steps that &#8220;orchestrate&#8221; the deployment. Here&#8217;s more or less how it works:

  1. Setup: update code, run tests on staging server, upload new static assets.
  2. Turn off B app servers, run on A (we have 8 Python app servers in each group).
  3. Update code on B app servers.
  4. Turn off A app servers, run on B (making new code live on B).
  5. Update code on A app servers.
  6. Make all A and B app servers live.
  7. Record deployment log and send &#8220;finished deployment&#8221; email.

To show you some example Ansible code, step 3 (and step 5) use the following code:

{% raw %}
```yaml
---
- name: Update code on B app servers
  hosts: app_b
  tasks:
  - name: Update code on app servers
    subversion: repo={{ svn_repo }} dest={{ code_dir }} username={{ svn_username }}
                password={{ svn_password }} revision={{ svn_revision }}

  - name: Restart app service
    service: name=server-main state=restarted

  - name: Wait for app server to start
    wait_for: port={{ app_port }} timeout=300

  - name: Check that new version is running
    local_action: uri url=http://{{ inventory_hostname }}:{{ app_port }}{{ version_url }}
                  return_content=true
    register: response
    failed_when: response.json['SvnRevision'] != {{ svn_revision }}
```
{% endraw %}

As you can see, Ansible uses fairly straight-forward [YAML][13] syntax. In the above code, Ansible runs these tasks against our 8 &#8220;app_b&#8221; hosts in parallel &#8212; a simple but powerful concept.

For a given &#8220;play&#8221; such as the above, each task is executed in order &#8212; we really appreciated how it doesn&#8217;t try to outsmart you in terms of how and when things run. The only exception to this is Ansible&#8217;s [handlers][14], which are tasks run at the end of a play, but only if something &#8220;notified&#8221; them. For example, in our deployment, handlers are used to restart our nginx servers when the nginx config file changes.

You&#8217;ll see there are a lot of {% raw %}`{{ variables }}`{% endraw %} used here: each task line is actually a [Jinja2][15] template string that is rendered against your current set of host variables. This makes it very easy to modify settings which change depending on environment (staging, production, etc). It also separates playbooks from user-specific data, meaning settings aren&#8217;t hard-coded in playbooks and folks can share them much more easily.

We deploy solely to Linux-based machines (about 50 nodes), and Linux is where Ansible started and where it excels. However, we have something of a Windows history, so it was interesting to learn that as of August 2014 (version 1.7), they started adding support for [managing Windows machines][16] &#8212; this is done via Powershell remoting rather than SSH.

In short, what sold Ansible to us was:

  * Simple YAML-based syntax
  * Simple execution order: top to bottom, and then handlers
  * Powerful: Jinja2 templates, large library of builtin modules
  * Agentless: no client to install and maintain

Pre-Ansible, we dreaded our 28-manual-step deployments. Post-Ansible, it&#8217;s almost fun to deploy code, and the focus is on the features we&#8217;re deploying, instead of &#8220;what&#8217;s going to go wrong this time?&#8221;. So I hope you get the chance to try [Ansible][17]! And no, we weren&#8217;t paid to link that&#8230;

 [1]: http://www.oyster.com/
 [2]: https://en.wikipedia.org/wiki/Not_invented_here
 [3]: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem
 [5]: http://www.ansible.com/
 [6]: https://www.chef.io/
 [7]: http://www.fabfile.org/
 [8]: http://puppetlabs.com/
 [9]: https://docs.chef.io/chef_overview.html#chef-components
 [10]: http://tech.oyster.com/wp-content/uploads/2015/06/tower2_jobstatus.png
 [11]: https://github.com/ansible
 [12]: http://www.ansible.com/tower
 [13]: https://en.wikipedia.org/wiki/YAML
 [14]: http://docs.ansible.com/glossary.html#handlers
 [15]: http://jinja.pocoo.org/docs/dev/
 [16]: http://docs.ansible.com/intro_windows.html
 [17]: http://www.ansible.com/