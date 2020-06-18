---
layout: default
title: "pygit: Just enough of a Git client to create a repo, commit, and push itself to GitHub"
permalink: /writings/pygit/
description: pygit implements just enough of a Git client (in 500 lines of Python) to create a repo, commit, and push itself to GitHub.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2017</p>

> Summary: Recently I wrote approximately 500 lines of Python code that implements just enough of a Git client to create a repository, add files to the index, commit, and push itself to GitHub. This article gives a bit of background on my hack and walks through the code.

Git is known (among other things) for its very simple object model -- and for good reason. When learning `git` I discovered that the local object database is just a bunch of plain files in the `.git` directory. With the exception of the index (`.git/index`) and pack files (which are kind of optional), the layout and format of these files is very straight-forward.

Somewhat inspired by Mary Rose Cook's [similar effort](http://gitlet.maryrosecook.com/), I wanted to see if I could implement enough of `git` to create a repo, perform a commit, and push to a real server (GitHub in this case).

Mary's `gitlet` program has a bit more of an educational focus; mine pushed itself to GitHub and so (in my humble opinion) has more hack value. In some areas she implemented more of Git (including basic merging), but in other ways less. For example, she used a simpler, text-based index format instead of the binary format that `git` uses. Also, while her `gitlet` does support pushing, it only pushes to another repository that exists locally, not on a remote server.

For this exercise, I wanted to write a version that could do all the steps including pushing to a real Git server. I also wanted to use the same binary index format that `git` used so I could check my work using `git` commands at each step of the way.

My version, called `pygit`, is written in Python (3.5+) and uses only standard library modules. It's just over 500 lines of code, including blank lines and comments. At a minimum I needed the `init`, `add`, `commit`, and `push` commands, but pygit also implements `status`, `diff`, `cat-file`, `ls-files`, and `hash-object`. The latter commands are useful in their own right, but they were also very helpful when debugging pygit.

So let's dive into the code! You can view all of [pygit.py on GitHub](https://github.com/benhoyt/pygit/blob/master/pygit.py), or follow along as I look at various parts of it below.


Initializing a repo
-------------------

Initializing a local Git repo simply involves creating the `.git` directory and a few files and directories under it. After defining `read_file` and `write_file` helper functions, we can write `init()`:

```python
def init(repo):
    """Create directory for repo and initialize .git directory."""
    os.mkdir(repo)
    os.mkdir(os.path.join(repo, '.git'))
    for name in ['objects', 'refs', 'refs/heads']:
        os.mkdir(os.path.join(repo, '.git', name))
    write_file(os.path.join(repo, '.git', 'HEAD'),
               b'ref: refs/heads/master')
    print('initialized empty repository: {}'.format(repo))
```

You'll note that there's not a whole lot of graceful error handling. This is a 500-line subset, after all. If the repo directory already exists, it'll fail hard with a traceback.


Hashing objects
---------------

The `hash_object` function hashes and writes a single object to the `.git/objects` "database". There are three types of objects in the Git model: blobs (ordinary files), commits, and trees (these represent the state of a single directory).

Each object has a small header including the type and size in bytes. This is followed by a NUL byte and then the file's data bytes. This whole thing is zlib-compressed and written to `.git/objects/ab/cd...`, where `ab` are the first two characters of the 40-character SHA-1 hash and `cd...` is the rest.

Notice the theme of using Python's standard library for everything we can (`os` and `hashlib`). Python comes with "batteries included".

```python
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
```

Then there's `find_object()`, which finds an object by hash (or hash prefix), and `read_object()`, which reads an object and its type -- essentially the inverse of `hash_object()`. Finally, `cat_file` is a function which implements the pygit equivalent of `git cat-file`: it pretty-prints an object's contents (or its size or type) to stdout.


The git index
-------------

The next thing we want to be able to do is add files to the index, or staging area. The index is a list of file entries, ordered by path, each of which contains path name, modificiation time, SHA-1 hash, etc. Note that the index lists *all files* in the current tree, not just the files being staged for commit right now.

The index, which is a single file at `.git/index`, is stored in a custom binary format. It's not exactly complicated, but it does involve a bit of [`struct`](https://docs.python.org/3/library/struct.html) usage, plus a bit of a dance to get to the next index entry after the variable-length path field.

The first 12 bytes are the header, the last 20 a SHA-1 hash of the index, and the bytes in between are index entries, each 62 bytes plus the length of the path and some padding. Here's our `IndexEntry` namedtuple and `read_index` function:

```python
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
```

This function is followed by `ls_files`, `status`, and `diff`, all of which are essentially different ways to print the status of the index:

* [`ls_files`](https://github.com/benhoyt/pygit/blob/aa8d8bb62ae273ae2f4f167e36f24f40a11634b9/pygit.py#L157-L167) just prints all files in the index (along with their mode and hash if `-s` is specified)
* [`status`](https://github.com/benhoyt/pygit/blob/aa8d8bb62ae273ae2f4f167e36f24f40a11634b9/pygit.py#L193-L207) uses [`get_status()`](https://github.com/benhoyt/pygit/blob/aa8d8bb62ae273ae2f4f167e36f24f40a11634b9/pygit.py#L170-L190) to compare the files in the index to the files in the current directory tree, and prints out which files are modified, new, and deleted
* [`diff`](https://github.com/benhoyt/pygit/blob/aa8d8bb62ae273ae2f4f167e36f24f40a11634b9/pygit.py#L210-L228) prints a diff of each modified file, showing what's in the index against what's in the current working copy (using Python's [`difflib`](https://docs.python.org/3/library/difflib.html) module to do the dirty work)

I'm 100% sure `git`'s usage of the index and implementation of these commands is much more efficient than mine, taking into account file modification time and all of that. I'm just doing a full directory listing via `os.walk()` to get the file paths, and using some set operations and then comparing the hashes. For example, here's the set comprehension I'm using to determine the list of changed paths:

```python
changed = {p for p in (paths & entry_paths)
           if hash_object(read_file(p), 'blob', write=False) !=
              entries_by_path[p].sha1.hex()}
```

Finally there is a `write_index` function to write the index back, and `add()` to add one or more paths to the index -- the latter simply reads the whole index, adds the paths, re-sorts it, and writes it out again.

At this point we can add files to our index, and we're ready to do a commit.


Committing
----------

Performing a commit consists of writing two objects:

First, a **tree** object, which is a snapshot of the current directory (or really the index) at the time of the commit. A tree just lists the hashes of the files (blobs) and sub-trees in a directory -- it's recursive.

So each commit is a snapshot of the entire directory tree. But the neat thing about this way of storing things by hash is that if any file in the tree changes, the hash of the entire tree changes too. Conversely, if a file or sub-tree hasn't changed, it'll just be referred to by the same hash. So you can store changes in directory trees efficiently.

Here's an example of a tree object as printed by `cat-file pretty 2226` (each line shows file mode, object type, hash, and filename):

```
    100644 blob 4aab5f560862b45d7a9f1370b1c163b74484a24d    LICENSE.txt
    100644 blob 43ab992ed09fa756c56ff162d5fe303003b5ae0f    README.md
    100644 blob c10cb8bc2c114aba5a1cb20dea4c1597e5a3c193    pygit.py
```

The function `write_tree`, strangely enough, is used to write tree objects. One of the odd things about some of the Git file formats is the fact that they're kind of mixed binary and text -- for example, each "line" in a tree object is "mode space path" as text, then a NUL byte, then the binary SHA-1 hash. Here's our `write_tree()`:

```python
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
```

Second, a **commit** object. This records the tree hash, parent commit, author and timestamp, and the commit message. Merging is of course one of the fine things about Git, but pygit only supports a single linear branch, so there's only ever one parent (or no parents in the case of the first commit!).

Here's an example of a commit object, again printed using `cat-file pretty aa8d`:

```
    tree 22264ec0ce9da29d0c420e46627fa0cf057e709a
    parent 03f882ade69ad898aba73664740641d909883cdc
    author Ben Hoyt <benhoyt@gmail.com> 1493170892 -0500
    committer Ben Hoyt <benhoyt@gmail.com> 1493170892 -0500

    Fix cat-file size/type/pretty handling
```

And here's our `commit` function -- again, thanks to Git's object model, almost pedestrian:

```python
def commit(message, author):
    """Commit the current state of the index to master with given message.
    Return hash of commit object.
    """
    tree = write_tree()
    parent = get_local_master_hash()
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
```

Talking to a server
-------------------

Next comes the slightly harder part, wherein we make pygit talk to a real, live Git server (I pushed pygit to GitHub, but it works against Bitbucket and other servers too).

The basic idea is to query the server's master branch for what commit it's on, then determine which set of objects it needs to catch up to the current local commit. And finally, update the remote's commit hash and send a "pack file" of all the missing objects.

This is called the "smart protocol" -- as of 2011, GitHub [stopped support](https://github.com/blog/809-git-dumb-http-transport-to-be-turned-off-in-90-days) for the "dumb" transfer protocol, which just tranfers `.git` files straight and would have been somewhat easier to implement. So we have to use the "smart" protocol and pack objects into a pack file.

Unfortunately I made a dumb mistake when I implemented the smart protocol -- I didn't find the main technical documentation on the [HTTP protocol](https://github.com/git/git/blob/master/Documentation/technical/http-protocol.txt) and [pack protocol](https://github.com/git/git/blob/master/Documentation/technical/pack-protocol.txt) until after I'd finished it. I was going on the fairly hand-wavey [Transfer Protocols](https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols) section of the Git Book as well as the Git codebase for the packfile format.

In the final stages of getting it working, I also implemented a tiny HTTP server using Python's [`http.server`](https://docs.python.org/3/library/http.server.html) module so I could run the regular `git` client against it and see some real requests. A bit of reverse engineering is worth a thousand lines of code.

### The pkt-line format

One of the key parts of the transfer protocol is what's called the "pkt-line" format, which is a length-prefixed packet format for sending metadata like commit hashes. Each "line" has a 4-digit hex length (plus 4 to include the length of the length) and then length less 4 bytes of data. Each line also generally has an `LF` byte at the end. The special length `0000` is used as a section marker and at the end of the data.

For example, here's the response GitHub gives to a `git-receive-pack` GET request. Note that the additional line breaks and indentation are not part of the real data:

```
    001f# service=git-receive-pack\n
    0000
    00b20000000000000000000000000000000000000000 capabilities^{}\x00
        report-status delete-refs side-band-64k quiet atomic ofs-delta
        agent=git/2.9.3~peff-merge-upstream-2-9-1788-gef730f7\n
    0000
```

So we need two functions, one to convert pkt-line data to a list of lines, and one to convert a list of lines to pkt-line format:

```python
def extract_lines(data):
    """Extract list of lines from given server data."""
    lines = []
    i = 0
    for _ in range(1000):
        line_length = int(data[i:i + 4], 16)
        line = data[i + 4:i + line_length]
        lines.append(line)
        if line_length == 0:
            i += 4
        else:
            i += line_length
        if i >= len(data):
            break
    return lines

def build_lines_data(lines):
    """Build byte string from given lines to send to server."""
    result = []
    for line in lines:
        result.append('{:04x}'.format(len(line) + 5).encode())
        result.append(line)
        result.append(b'\n')
    result.append(b'0000')
    return b''.join(result)
```

### Making an HTTPS request

The next trick -- because I wanted to only use standard libraries -- is making an authenticated HTTPS request without the [`requests`](http://docs.python-requests.org/en/master/) library. Here's the code for that:

```python
def http_request(url, username, password, data=None):
    """Make an authenticated HTTP request to given URL (GET by default,
    POST if "data" is not None).
    """
    password_manager = urllib.request.HTTPPasswordMgrWithDefaultRealm()
    password_manager.add_password(None, url, username, password)
    auth_handler = urllib.request.HTTPBasicAuthHandler(password_manager)
    opener = urllib.request.build_opener(auth_handler)
    f = opener.open(url, data=data)
    return f.read()
```

The above is an example of exactly why `requests` exists. You *can* do everything with the standard library's `urllib.request` module, but it's sometimes painful. Most of the Python stdlib is great, other parts, not so much. The equivalent code using `requests` wouldn't really even require a helper function:

```python
def http_request(url, username, password):
    response = requests.get(url, auth=(username, password))
    response.raise_for_status()
    return response.content
```

We can use the above to ask the server what commit *its* master branch is up to, like so (this function is rather brittle, but could be generalized fairly easily):

```python
def get_remote_master_hash(git_url, username, password):
    """Get commit hash of remote master branch, return SHA-1 hex string or
    None if no remote commits.
    """
    url = git_url + '/info/refs?service=git-receive-pack'
    response = http_request(url, username, password)
    lines = extract_lines(response)
    assert lines[0] == b'# service=git-receive-pack\n'
    assert lines[1] == b''
    if lines[2][:40] == b'0' * 40:
        return None
    master_sha1, master_ref = lines[2].split(b'\x00')[0].split()
    assert master_ref == b'refs/heads/master'
    assert len(master_sha1) == 40
    return master_sha1.decode()
```

### Determining missing objects

Next we need to determine what objects the server needs that it doesn't already have. pygit assumes it has everything locally (it doesn't support "pulling"), so I have a `read_tree` function (the opposite of `write_tree`) and then the following two functions to recursively find the set of object hashes in a given tree and a given commit:

```python
def find_tree_objects(tree_sha1):
    """Return set of SHA-1 hashes of all objects in this tree
    (recursively), including the hash of the tree itself.
    """
    objects = {tree_sha1}
    for mode, path, sha1 in read_tree(sha1=tree_sha1):
        if stat.S_ISDIR(mode):
            objects.update(find_tree_objects(sha1))
        else:
            objects.add(sha1)
    return objects

def find_commit_objects(commit_sha1):
    """Return set of SHA-1 hashes of all objects in this commit
    (recursively), its tree, its parents, and the hash of the commit
    itself.
    """
    objects = {commit_sha1}
    obj_type, commit = read_object(commit_sha1)
    assert obj_type == 'commit'
    lines = commit.decode().splitlines()
    tree = next(l[5:45] for l in lines if l.startswith('tree '))
    objects.update(find_tree_objects(tree))
    parents = (l[7:47] for l in lines if l.startswith('parent '))
    for parent in parents:
        objects.update(find_commit_objects(parent))
    return objects
```

Then all we need to do is get the set of objects referenced by the local commit and subtract the set of objects referenced in the remote commit. This set difference is the objects missing at the remote end. I'm sure there are more efficient ways to generate this set, but this is plenty good enough for pygit:

```python
def find_missing_objects(local_sha1, remote_sha1):
    """Return set of SHA-1 hashes of objects in local commit that are
    missing at the remote (based on the given remote commit hash).
    """
    local_objects = find_commit_objects(local_sha1)
    if remote_sha1 is None:
        return local_objects
    remote_objects = find_commit_objects(remote_sha1)
    return local_objects - remote_objects
```

### The push itself

To do the push, we need to send a pkt-line request to say "update the master branch to this commit hash", followed by a pack file containing the concatenated content of all the missing objects found above.

The pack file has a 12-byte header (starting with `PACK`), then each object encoded with a variable-length size and compressed using zlib, and finally the 20-byte hash of the entire pack file. We're using the "undeltified" representation of objects to keep things simple -- there are more complex ways to shrink the pack file based on deltas between objects, but that's overkill for us:

```python
def encode_pack_object(obj):
    """Encode a single object for a pack file and return bytes
    (variable-length header followed by compressed data bytes).
    """
    obj_type, data = read_object(obj)
    type_num = ObjectType[obj_type].value
    size = len(data)
    byte = (type_num << 4) | (size & 0x0f)
    size >>= 4
    header = []
    while size:
        header.append(byte | 0x80)
        byte = size & 0x7f
        size >>= 7
    header.append(byte)
    return bytes(header) + zlib.compress(data)

def create_pack(objects):
    """Create pack file containing all objects in given given set of
    SHA-1 hashes, return data bytes of full pack file.
    """
    header = struct.pack('!4sLL', b'PACK', 2, len(objects))
    body = b''.join(encode_pack_object(o) for o in sorted(objects))
    contents = header + body
    sha1 = hashlib.sha1(contents).digest()
    data = contents + sha1
    return data
```

And then, the final step in all of this, the `push()` itself -- with a little bit of peripheral code removed for brevity:

```python
def push(git_url, username, password):
    """Push master branch to given git repo URL."""
    remote_sha1 = get_remote_master_hash(git_url, username, password)
    local_sha1 = get_local_master_hash()
    missing = find_missing_objects(local_sha1, remote_sha1)
    lines = ['{} {} refs/heads/master\x00 report-status'.format(
            remote_sha1 or ('0' * 40), local_sha1).encode()]
    data = build_lines_data(lines) + create_pack(missing)
    url = git_url + '/git-receive-pack'
    response = http_request(url, username, password, data=data)
    lines = extract_lines(response)
    assert lines[0] == b'unpack ok\n', \
        "expected line 1 b'unpack ok', got: {}".format(lines[0])
```

### Command line parsing

pygit is also a pretty decent example of using the standard library [`argparse`](https://docs.python.org/3/library/argparse.html) module, including sub-commands (`pygit init`, `pygit commit`, etc). I won't copy the code here, but take a look at the [argparse code in the source](https://github.com/benhoyt/pygit/blob/aa8d8bb62ae273ae2f4f167e36f24f40a11634b9/pygit.py#L499).


Using pygit
-----------

In most places I tried to make `pygit` command line syntax be identical to or pretty similar to `git` syntax. Here's what committing pygit to GitHub looked like:

```
$ python3 misc/pygit.py init pygit
initialized empty repository: pygit

$ cd pygit

# ... write and test pygit.py using a test repo ...

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

$ python3 pygit.py commit -m "Graceful error exit for cat-file with bad
    object type"
committed to master: 4117234220d4e9927e1a626b85e33041989252b5

$ python3 pygit.py push https://github.com/benhoyt/pygit.git
updating remote master from no commits to
    4117234220d4e9927e1a626b85e33041989252b5 (6 objects)
```

That's all, folks
-----------------

That's it! If you got to here, you just walked through about 500 lines of Python with no value -- oh wait, apart from educational and artisan hack value. :-) And hopefully you learned something about the internals of Git too.

Please write your comments on [Hacker News](https://news.ycombinator.com/item?id=14210877) or [programming reddit](https://www.reddit.com/r/programming/comments/67v7qy/pygit_just_enough_git_to_commit_and_push_itself/).
