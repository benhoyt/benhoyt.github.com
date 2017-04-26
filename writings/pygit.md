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

Mary's `gitlet` program has a bit more of an educational focus; mine pushed itself to GitHub and so (IMO) has more hack value. In some areas she implemented more of Git (including basic merging), but in other ways less. For example, she used a simpler, text-based index format instead of the binary format that `git` uses. Also, while her `gitlet` does support pushing, it only pushes to another repository that exists locally, not on a remote server.

For this exercise, I wanted to write a version that could do all the steps including pushing to a real Git server. I also wanted to use the same binary index format that `git` used so I could check my work using `git` commands at each step of the way.

My version, called `pygit`, is written in Python (3.5+) and uses only standard library modules. It's just over 500 lines of code, including blank lines and comments. At a minimum I needed the `init`, `add`, `commit`, and `push` commands, but pygit also implements `status`, `diff`, `cat-file`, `ls-files`, and `hash-object`. The latter commands are useful in their own right, but they were also very helpful when debugging pygit.

So let's dive into the code! You can view all of [pygit.py on GitHub](https://github.com/benhoyt/pygit/blob/master/pygit.py), or follow along as I look at various parts of it below.


Initializing a repo
-------------------

Initializing a local Git repo simply involves creating the `.git` directory and a few files and directories under it. After defining `read_file` and `write_file` helper functions, we can write `init()`:

    def init(repo):
        """Create directory for repo and initialize .git directory."""
        os.mkdir(repo)
        os.mkdir(os.path.join(repo, '.git'))
        for name in ['objects', 'refs', 'refs/heads']:
            os.mkdir(os.path.join(repo, '.git', name))
        write_file(os.path.join(repo, '.git', 'HEAD'),
                   b'ref: refs/heads/master')
        print('initialized empty repository: {}'.format(repo))

You'll note that there's not a whole lot of graceful error handling. This is a 500-line subset, after all. If the repo directory already exists, it'll fail hard with a traceback.


Hashing objects
---------------

The `hash_object` function hashes and writes a single object to the `.git/objects` "database". There are three types of objects in the Git model: blobs (ordinary files), commits, and trees (these represent the state of a single directory).

Each object has a small header including the type and size in bytes. This is followed by a NUL byte and then the file's data bytes. This whole thing is zlib-compressed and written to `.git/objects/ab/cd...`, where `ab` are the first two characters of the 40-character SHA-1 hash and `cd...` is the rest.

Notice the theme of using Python's standard library for everything we can (`os` and `hashlib`). Python comes with "batteries included".

    def hash_object(data, obj_type, write=True):
        """Compute hash of object data of given type and write to object store
        if "write" is True. Return SHA-1 object hash as hex string.
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

Then there's `find_object()`, which finds an object by hash (or hash prefix), and `read_object()`, which reads an object and its type -- essentially the inverse of `hash_object()`. Finally, `cat_file` is a function which implements the pygit equivalent of `git cat-file`: it pretty-prints an object's contents (or its size or type) to stdout.


The git index
-------------

The next thing we want to be able to do is add files to the index, or staging area. The index is a list of file entries, ordered by path, each of which contains path name, modificiation time, SHA-1 hash, etc. Note that the index lists *all files* in the current tree, not just the files being staged for commit right now.

The index, which is a single file at `.git/index`, is stored in a proprietary binary format. It's not exactly complicated, but it does involve a bit of `struct` usage, plus a bit of a dance to get to the next index entry after the variable-length path field.

The first 12 bytes are the header, the last 20 a SHA-1 hash of the index, and the bytes in between are index entries, each 62 bytes plus the length of the path and some padding. Here's our `IndexEntry` namedtuple and `read_index` function:

    # Data for one entry in the git index (.git/index)
    IndexEntry = collections.namedtuple('IndexEntry', [
        'ctime_s', 'ctime_n', 'mtime_s', 'mtime_n', 'dev', 'ino', 'mode',
        'uid', 'gid', 'size', 'sha1', 'flags', 'path',
    ])

    def read_index():
        """Read git index file and return list of IndexEntry objects."""
        try:
            data = read_file(os.path.join('.git', 'index'))
        except FileNotFoundError:
            return []
        digest = hashlib.sha1(data[:-20]).digest()
        assert digest == data[-20:], 'invalid index checksum'
        signature, version, num_entries = struct.unpack('!4sLL', data[:12])
        assert signature == b'DIRC', \
                'invalid index signature {}'.format(signature)
        assert version == 2, 'unknown index version {}'.format(version)
        entry_data = data[12:-20]
        entries = []
        i = 0
        while i + 62 < len(entry_data):
            fields_end = i + 62
            fields = struct.unpack('!LLLLLLLLLL20sH',
                                   entry_data[i:fields_end])
            path_end = entry_data.index(b'\x00', fields_end)
            path = entry_data[fields_end:path_end]
            entry = IndexEntry(*(fields + (path.decode(),)))
            entries.append(entry)
            entry_len = ((62 + len(path) + 8) // 8) * 8
            i += entry_len
        assert len(entries) == num_entries
        return entries

This function is followed by `ls_files`, `status`, and `diff`, all of which are essentially different ways to print the status of the index:

* `ls_files` just prints all files in the index (along with their mode and hash with `-s` is specified)
* `status` uses `get_status()` to compare the files in the index to the files in the currenty directory tree, and prints out which files are modified, new, and deleted
* `diff` prints a diff of each modified file, showing what's in the index against what's in the currenty working copy (using Python's `difflib` module to do the dirty work)

I'm 100% sure `git`'s usage of the index and implementation of these commands is much more efficient than mine, taking into account file modification time and all of that. I'm just doing a full directory listing via `os.walk()` to get the file paths, and using some set operations and then comparing the hashes. For example, here's the set comprehension I'm using to determine the list of changed paths:

    changed = {p for p in (paths & entry_paths)
               if hash_object(read_file(p), 'blob', write=False) !=
                  entries_by_path[p].sha1.hex()}

Finally there is a `write_index` function to write the index back, and `add()` to add one or more paths to the index -- the latter simply reads the whole index, adds the paths, re-sorts it, and writes it out again.

At this point we can add files to our index, and we're ready to do a commit.


Committing
----------

Performing a commit consists of writing two objects:

First, a **tree** object, which is a snapshot of the current directory (or really the index) at the time of the commit. A tree just lists the hashes of the files (blobs) and sub-trees in a directory -- it's recursive.

So each commit is a snapshot of the entire directory tree. But the neat thing about this way of storing things by hash is that if any file in the tree changes, the hash of the entire tree changes too. Conversely, if a file or sub-tree hasn't changed, it'll just be referred to by the same hash. So you can store changes in directory trees efficiently.

Here's an example of a tree object as printed by `cat-file pretty 2226` (each line shows file mode, object type, hash, and filename):

    100644 blob 4aab5f560862b45d7a9f1370b1c163b74484a24d    LICENSE.txt
    100644 blob 43ab992ed09fa756c56ff162d5fe303003b5ae0f    README.md
    100644 blob c10cb8bc2c114aba5a1cb20dea4c1597e5a3c193    pygit.py

The function `write_tree`, strangely enough, is used to write tree objects. One of the odd things about some of the Git file formats is the fact that they're kind of mixed binary and text -- for example, each "line" in a tree object is "mode space path" as text, then a NUL byte, then the binary SHA-1 hash. Here's our `write_tree()`:

    def write_tree():
        """Write a tree object from the current index entries."""
        tree_entries = []
        for entry in read_index():
            assert '/' not in entry.path, \
                    'currently only supports a single, top-level directory'
            mode_path = '{:o} {}'.format(entry.mode, entry.path).encode()
            tree_entry = mode_path + b'\x00' + entry.sha1
            tree_entries.append(tree_entry)
        return hash_object(b''.join(tree_entries), 'tree')

Second, a **commit** object. This records the tree hash, parent commit, author and timestamp, and the commit message. Merging is of course one of the fine things about Git, but `pygit` only supports a single linear branch, so there's only ever one parent (or no parents in the case of the first commit!).

Here's an example of a commit object, again printed using `cat-file pretty aa8d`:

    tree 22264ec0ce9da29d0c420e46627fa0cf057e709a
    parent 03f882ade69ad898aba73664740641d909883cdc
    author Ben Hoyt <benhoyt@gmail.com> 1493170892 -0500
    committer Ben Hoyt <benhoyt@gmail.com> 1493170892 -0500

    Fix cat-file size/type/pretty handling

And here's our `commit` function -- again, thanks to Git's object model, almost pedestrian:

    def commit(message, author=None):
        """Commit the current state of the index to master with given message.
        Return hash of commit object.
        """
        tree = write_tree()
        parent = get_local_master_hash()
        if author is None:
            author = '{} <{}>'.format(
                    os.environ['GIT_AUTHOR_NAME'],
                    os.environ['GIT_AUTHOR_EMAIL'])
        timestamp = int(time.mktime(time.localtime()))
        utc_offset = -time.timezone
        author_time = '{} {}{:02}{:02}'.format(
                timestamp,
                '+' if utc_offset > 0 else '-',
                abs(utc_offset) // 3600,
                (abs(utc_offset) // 60) % 60)
        lines = ['tree ' + tree]
        if parent:
            lines.append('parent ' + parent)
        lines.append('author {} {}'.format(author, author_time))
        lines.append('committer {} {}'.format(author, author_time))
        lines.append('')
        lines.append(message)
        lines.append('')
        data = '\n'.join(lines).encode()
        sha1 = hash_object(data, 'commit')
        master_path = os.path.join('.git', 'refs', 'heads', 'master')
        write_file(master_path, (sha1 + '\n').encode())
        print('committed to master: {:7}'.format(sha1))
        return sha1


Talking to a server
-------------------

Next comes the slightly harder part, wherein we make `pygit` talk to a real, live Git server (I pushed `pygit` to GitHub, but it works against Bitbucket as well).

The basic idea is to query the server's master branch for what commit it's on, then determine which set of objects it needs to catch up to the current local commit, and finally update the remote's commit hash and send a "pack file" of all the missing objects. This is called the "smart protocol" -- the "dumb protocol" ... TODO

As of 2011, GitHub [no longer supports](https://github.com/blog/809-git-dumb-http-transport-to-be-turned-off-in-90-days) the "dumb" transfer protocol, which would have been somewhat easier to implement. You have to use the "smart" protocol and pack objects 

TODO: found these after the fact!
https://github.com/git/git/blob/master/Documentation/technical/http-protocol.txt
https://github.com/git/git/blob/master/Documentation/technical/pack-protocol.txt


Pushing ourselves to GitHub
---------------------------

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
    updating remote master from no commits to 4117234220d4e9927e1a626b85e33041989252b5 (6 objects)
