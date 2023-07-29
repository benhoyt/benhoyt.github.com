---
layout: default
title: "Scripting with Go: a 400-line Git client that can create a repo and push itself to GitHub"
permalink: /writings/gogit/
description: "In which I rewrite my toy pygit client in Go to see how suitable Go is for simple scripts."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2023</p>


> **Go to:** [Tech summary](#technical-summary) \| [Error handling](#error-handling) \| [Performance](#performance) \| [vs Python](#comparison-with-python-version) \| [Conclusion](#conclusion)


A few years ago I wrote [pygit](/writings/pygit/), a small Python program that's just enough of a Git client to create a repository, add some commits, and push itself to GitHub.

I wanted to compare what it would look like in Go, to see if it was reasonable to write small scripts in Go -- quick ’n’ dirty code where performance isn't a big deal, and stack traces are all you need for error handling.

The result is [gogit](https://github.com/benhoyt/gogit/blob/master/gogit.go), a 400-line Go program that can initialise a repository, commit, and push to GitHub. It's written in ordinary Go ... except for error handling, which is just too verbose in idiomatic Go to work well for scripting (more on that [below](#error-handling)).


## Technical summary

I won't go into detail about how Git works here (there's a bit more in my [pygit article](/writings/pygit/)), suffice to say that the Git data model is pretty neat. It uses a simple file-based object store in `.git/objects`, where each object has a [40-character hash](https://en.wikipedia.org/wiki/SHA-1) and can be a *commit*, a *tree* (directory listing), or a *blob* (committed file). That's it -- the [gogit code](https://github.com/benhoyt/gogit/blob/e94720d64dd93ca7aea17a314ea6430fc5f6b90c/gogit.go#L111-L164) to write commits, trees, and blobs is about 50 lines.

I've implemented even less than pygit: only `init`, `commit`, and `push`. Gogit doesn't even support the index (staging area), so instead of `gogit add`, you just `gogit commit` with the list of paths you want to commit each time. As [pygit's code](https://github.com/benhoyt/pygit/blob/aa8d8bb62ae273ae2f4f167e36f24f40a11634b9/pygit.py#L231-L246) shows, dealing with the index is messy. It's also unnecessary, and I wanted gogit to be an exercise in minimalism.

Gogit also drops the commands `cat-file`, `hash-object`, and `diff` -- those aren't required for committing and pushing to GitHub. I did use Git's `cat-file` during debugging, however.

Here are the commands I used to create the repo, commit, and push to GitHub (note the use of [`go run`](https://pkg.go.dev/cmd/go#hdr-Compile_and_run_Go_program) to compile and execute the "script"):

```
# Initialise the repo
$ go run . init

# Make the first commit (other commits are similar)
$ export GIT_AUTHOR_NAME='Ben Hoyt'
$ export GIT_AUTHOR_EMAIL=benhoyt@gmail.com
$ go run . commit -m 'Initial commit' gogit.go go.mod LICENSE.txt
commited 0580a17 to master

# Push updates to GitHub
$ export GIT_USERNAME=benhoyt
$ export GIT_PASSWORD=...
$ go run . push https://github.com/benhoyt/gogit
updating remote master from 0000000 to 0580a17 (5 objects)
```


## Error handling

The verbosity of Go's error handling has been much-maligned. It's simple and explicit, but every call to a function that may fail takes an additional three lines of code to handle the error:

```go
mode, err := strconv.ParseInt(modeStr, 8, 64)
if err != nil {
    return err
}
```

It's not as big a deal when writing production code, because then you want more control over error handling anyway -- nicely-wrapped errors, or human-readable messages, for example:

```go
mode, err := strconv.ParseInt(modeStr, 8, 64)
if err != nil {
    return fmt.Errorf("mode must be an octal number, not %q", modeStr)
}
```

In a simple script, however, [all the error handling you need](https://www.reddit.com/r/golang/comments/6v63c2/comment/dly1pis/) is to show a message, print a stack trace, and exit the program. That's what happens in Python when you don't catch exceptions, and it's easy to emulate in Go with a [couple of helper functions](https://github.com/benhoyt/gogit/blob/e94720d64dd93ca7aea17a314ea6430fc5f6b90c/gogit.go#L84-L101):

```go
func check0(err error) {
    if err != nil {
        panic(err)
    }
}

func check[T any](value T, err error) T {
    if err != nil {
        panic(err)
    }
    return value
}

func assert(cond bool, format string, args ...any) {
    if !cond {
        panic(fmt.Sprintf(format, args...))
    }
}
```

Now that Go has generics you can easily define a `check` function which returns a result. However, you still need variants based on the number of results returned. Normally this is zero or one, with one being most common, so I've named that variant just `check`, and the zero-results one `check0`. I've also defined `assert`, which takes a boolean and a formatted message instead of an error.

These helpers allow you to turn this code:

```go
func writeTree(paths []string) ([]byte, error) {
    sort.Strings(paths) // tree object needs paths sorted
    var buf bytes.Buffer
    for _, path := range paths {
        st, err := os.Stat(path)
        if err != nil {
            return nil, err
        }
        if st.IsDir() {
            panic("sub-trees not supported")
        }
        data, err := os.ReadFile(path)
        if err != nil {
            return nil, err
        }
        hash, err := hashObject("blob", data)
        if err != nil {
            return nil, err
        }
        fmt.Fprintf(&buf, "%o %s\x00%s", st.Mode().Perm()|0o100000, path, hash)
    }
    return hashObject("tree", buf.Bytes())
}
```

Into the following, reducing the function body from 21 to 10 lines, which is comparable to the brevity of Python:

```go
func writeTree(paths []string) []byte {
    sort.Strings(paths) // tree object needs paths sorted
    var buf bytes.Buffer
    for _, path := range paths {
        st := check(os.Stat(path))
        assert(!st.IsDir(), "sub-trees not supported")
        data := check(os.ReadFile(path))
        hash := hashObject("blob", data)
        fmt.Fprintf(&buf, "%o %s\x00%s", st.Mode().Perm()|0o100000, path, hash)
    }
    return hashObject("tree", buf.Bytes())
}
```

It's not perfect, because the word `check` slightly obscures the function you're calling, but it does makes writing quick ’n’ dirty scripts a lot nicer.

You even get "better" errors than a plain `return err`, because the stack trace shows you exactly what function and line of code was being executed:

```
$ go run . push https://github.com/benhoyt/gogit
panic: Get "https://github.com/benhoyt/gogit/info/refs?service=git-receive-pack":
    context deadline exceeded (Client.Timeout exceeded while awaiting headers)

goroutine 1 [running]:
main.check[...](...)
    /home/ben/h/gogit/gogit.go:94
main.getRemoteHash(0x416ad0?, {0x7ffe1f0152d9?, 0x4b87d4?}, {0xc00001c00d, 0x7}, {0xc00001a00d, 0x28})
    /home/ben/h/gogit/gogit.go:245 +0x6da
main.push({0x7ffe1f0152d9, 0x20}, {0xc00001c00d, 0x7}, {0xc00001a00d, 0x28})
    /home/ben/h/gogit/gogit.go:217 +0xd9
main.main()
    /home/ben/h/gogit/gogit.go:73 +0x21e
exit status 2
```

[Changing from `return err` to `check`](https://github.com/benhoyt/gogit/commit/ad75a5fbf67924d5a62dc9794e772d069610d085) reduced the number of lines of code from 607 to 415, a reduction by 32%.

If you want to pursue this approach further, there's even a library written by Joe Tsai and Josh Bleecher Snyder called [`try`](https://github.com/dsnet/try) that uses [`recover`](https://pkg.go.dev/builtin#recover) to do this "properly". Interesting stuff! I'm still hoping the Go team figures out a way to make error handling less verbose.


## Performance

This is going to be a short section, because I don't care about speed in this program, and the Go version is likely as fast or faster than the Python version. Go can be significantly faster, but we're dealing with tiny files, and in Python, all the interesting code like hashing and writing to disk is written in C anyway.

Memory usage is another aspect of performance. Again, we're dealing with small files here, so it's not an issue to read everything into memory. In Python, you can do streaming, but it's not as consistently easy as in Go, due to the amazing [`io.Reader`](https://pkg.go.dev/io#Reader) and [`io.Writer`](https://pkg.go.dev/io#Writer) interfaces.

That said, it's still a bit easier in Go to read everything into `[]byte` or `string` and operate on those, so that's what I've done in gogit. We're talking about a few KB of memory, and my machine has a few GB.


## Comparison with Python version

As it stands, Pygit is about 600 lines of code, and gogit about 400. However, that's a bit misleading, as I removed several features when writing the Go version: there's no support for the Git index, and there's no `cat-file`, `hash-object`, or `diff`.

I did a quick test by removing those functions from the Python version, and it ends up at 360 lines of code. I consider 400 in Go versus 360 in Python not bad -- it's only 10% longer. And the Go version includes 20 lines of imports and 20 lines for the check/assert functions. So they're really almost identical in size!

Let's look at a couple of specific functions. First, `find_object`, which looks in the Git object store to find an object with the given prefix. Here's the Python version:

```python
def find_object(sha1_prefix):
    obj_dir = os.path.join('.git', 'objects', sha1_prefix[:2])
    rest = sha1_prefix[2:]
    objects = [name for name in os.listdir(obj_dir) if name.startswith(rest)]
    if not objects:
        raise ValueError('object {!r} not found'.format(sha1_prefix))
    if len(objects) >= 2:
        raise ValueError('multiple objects ({}) with prefix {!r}'.format(
                len(objects), sha1_prefix))
    return os.path.join(obj_dir, objects[0])
```

And here's the Go version:

```go
func findObject(hashPrefix string) string {
    objDir := filepath.Join(".git/objects", hashPrefix[:2])
    rest := hashPrefix[2:]
    entries, _ := os.ReadDir(objDir)
    var matches []string
    for _, entry := range entries {
        if strings.HasPrefix(entry.Name(), rest) {
            matches = append(matches, entry.Name())
        }
    }
    assert(len(matches) > 0, "object %q not found", hashPrefix)
    assert(len(matches) == 1, "multiple objects with prefix %q", hashPrefix)
    return filepath.Join(objDir, matches[0])
}
```

A lot of things are similar, for example the `os.path.join` vs `filepath.Join`, `os.listdir` vs `os.ReadDir`, and so on. But note the list comprehension in Python -- a one-liner -- is a five-line `for` loop in Go. I do miss list comprehensions when scripting in Go...

Let's look at another one, the `commit` function, first in Python:

```python
def commit(message, author):
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
    return sha1
```

Then in Go:

```go
func commit(message, author string, paths []string) string {
    tree := writeTree(paths)
    var buf bytes.Buffer
    fmt.Fprintln(&buf, "tree", hex.EncodeToString(tree))
    parent := getLocalHash()
    if parent != "" {
        fmt.Fprintln(&buf, "parent", parent)
    }
    now := time.Now()
    offset := now.Format("-0700")
    fmt.Fprintln(&buf, "author", author, now.Unix(), offset)
    fmt.Fprintln(&buf, "committer", author, now.Unix(), offset)
    fmt.Fprintln(&buf)
    fmt.Fprintln(&buf, message)
    data := buf.Bytes()
    hash := hashObject("commit", data)
    check0(os.WriteFile(".git/refs/heads/master", []byte(hex.EncodeToString(hash)+"\n"), 0o664))
    return hex.EncodeToString(hash)
}
```

Interestingly, this time the Python version is longer: 23 lines versus Go's 19. This mostly comes down to the better handling of timestamps. Go's standard library isn't perfect, but its [`time`](https://pkg.go.dev/time) package is better than Python's `time` and `datetime` packages put together.

In general, Go's standard library seems much more coherent and better-designed than Python's, which feels like it was designed by many different people over several decades (because it was).


## Conclusion

When used with `panic`-based error handling, Go is good for writing quick ’n’ dirty command line scripts.

To be honest, I'd still probably reach for Python first for throwaway scripts, because of its terser syntax, list (and other) comprehensions, and exception handling by default.

However, for anything more than a throwaway script, I'd quickly move to Go. Its standard library is better-designed, its `io.Reader` and `io.Writer` interfaces are excellent, and its lightweight static typing helps catch bugs without getting in the way.


{% include sponsor.html %}
