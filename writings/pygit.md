---
layout: default
title: "pygit: Just enough git (written in Python) to create a repo and push to GitHub"
permalink: /writings/pygit/
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">April 2017</p>

TODO: address TODOs

> Recently I wrote approximately 500 lines of Python that implements just enough of `git` to create a repository, add files to the index, commit, and push to GitHub. This article gives a bit of background and walks through parts of that code.

Git is known (among other things) for its very simple object model -- and for good reason. When learning `git` I discovered that the local object database is just a bunch of plain files in the `.git` directory. With the exception of the index (`.git/index`) and pack files (which are kind of optional), the layout and format of these files is very straight-forward.

Somewhat inspired by Mary Rose Cook's [similar effort](http://gitlet.maryrosecook.com/), I wanted to see if I could implement enough of `git` to create a repo, perform a commit, and push to a real server (GitHub in this case).

Mary's `gitlet` program has a bit more of an educational focus; mine pushed itself to GitHub and so (IMO) has more hack value. In some areas she implemented more of Git (including basic merging), but in other ways less. For example, she used a simpler, JSON-based (TODO: check) index file format instead of the binary format that `git` uses. Also, while her `gitlet` does support pushing, it only pushes to another repository that exists locally, not on a remote server.

For this exercise, I wanted to write a version that could do all the steps including pushing to a real Git server. I also wanted to use the same binary index format that `git` used so I could check my work using `git` commands at each step of the way.

My version, called `pygit`, is written in Python (3.5+) and uses only standard library modules. It's just over 500 lines of code, including blank lines and comments. At a minimum I needed the `init`, `add`, `commit`, and `push` commands, but pygit also implements `status`, `diff`, `cat-file`, `ls-files`, and `hash-object`. The latter commands are useful in their own right, but they were also very helpful when debugging pygit.

So let's dive into the code! You can view all of [pygit.py on GitHub](https://github.com/benhoyt/pygit#TODO-pygit.py), or follow along as I look at various parts of it below.


Initializing a repo
-------------------

Initializing a local Git repo simply involves creating the `.git` directory and a few files and directories under it. After defining `read_file` and `write_file` helper functions, we can write `init()`:

    def init(repo):
        """Create directory for repo and initialize .git directory."""
        os.mkdir(repo)
        os.mkdir(os.path.join(repo, '.git'))
        for name in ['objects', 'refs', 'refs/heads']:
            os.mkdir(os.path.join(repo, '.git', name))
        write_file(os.path.join(repo, '.git', 'HEAD'), b'ref: refs/heads/master')
        print('initialized empty repository: {}'.format(repo))

You'll note that there's not a whole lot of graceful error handling. This is a 500-line subset, after all. If the repo directory already exists, it'll fail hard with a traceback.


Hashing objects
---------------

The `hash_object` function hashes and writes a single object to the `.git/objects` "database". There are three types of objects in the Git model: blobs (ordinary files), commits, and trees (these represent a single directory).

Each object has a small header including the type and size in bytes, and is followed by a NUL byte and then the file's data bytes. This whole thing is zlib-compressed and written to `.git/objects/ab/cd...`, where TODO.

    def hash_object(data, obj_type, write=True):
        """Compute hash of object data of given type and write to object store if
        "write" is True. Return SHA-1 object hash as hex string.
        """
        header = '{} {}'.format(obj_type, len(data)).encode()
        full_data = header + b'\x00' + data
        sha1 = hashlib.sha1(full_data).hexdigest()
        if write:
            path = os.path.join('.git', 'objects', sha1[:2], sha1[2:])
            if not os.path.exists(path):
                os.makedirs(os.path.dirname(path), exist_ok=True)
                write_file(path, zlib.compress(full_data))
        return sha1


Pushing ourselves to GitHub
---------------------------

TODO: update hashes below

    $ python3 misc/pygit.py init pygit
    initialized empty repository: pygit
    
    $ cd pygit

    # ... write and test pygit.py against a test repo ...

    $ python3 pygit.py status
    new files:
        pygit.py

    $ python3 pygit.py add pygit.py

    $ python3 pygit.py commit -m "First working version of pygit"
    committed to master: 00d56c2a774147c35eeb7b205c0595cf436bf2fe

    $ python3 pygit.py cat-file commit 00d5
    tree 7758205fe7dfc6638bd5b098f6b653b2edd0657b
    author Ben Hoyt <benhoyt@gmail.com> 1493169321 -0500
    committer Ben Hoyt <benhoyt@gmail.com> 1493169321 -0500

    First working version of pygit

    # ... make some changes ...

    $ python3 pygit.py status
    changed files:
        pygit.py

    $ python3 pygit.py diff
    --- pygit.py (index)
    +++ pygit.py (working copy)
    @@ -100,8 +100,9 @@
         """
         obj_type, data = read_object(sha1_prefix)
         if mode in ['commit', 'tree', 'blob']:
    -        assert obj_type == mode, 'expected object type {}, got {}'.format(
    -                mode, obj_type)
    +        if obj_type != mode:
    +            raise ValueError('expected object type {}, got {}'.format(
    +                    mode, obj_type))
             sys.stdout.buffer.write(data)
         elif mode == '-s':
             print(len(data))

    $ python3 pygit.py add pygit.py

    $ python3 pygit.py commit -m "Graceful error exit for cat-file with bad object type"
    committed to master: 4117234220d4e9927e1a626b85e33041989252b5

    $ python3 pygit.py push https://github.com/benhoyt/pygit.git
    updating remote master from no commits to 4724b76473229841b87e47604a0e666d90a4b7b0 (6 objects)
