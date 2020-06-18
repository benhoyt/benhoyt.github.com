---
layout: default
title: Learning Go by porting a medium-sized web backend from Python
permalink: /writings/learning-go/
description: How I learnt the basics of Go (its good parts as well as a few quirks) by porting a medium-sized web backend from Python.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2017</p>


> Summary: To learn Go, I ported the backend of a small site I run from Python to Go, and had a fun, pain-free experience doing so.

I've been wanting to learn Go for a while now: I like the philosophy of a language that's small, has a gentle learning curve, and compiles very fast (for a statically-typed language). What pushed me over the line to actually *go* and do it was seeing more and more fast, robust tools that are written in Go -- [Docker](https://github.com/docker) and [ngrok](https://github.com/inconshreveable/ngrok) are two I've used recently.

The philosophy of Go is not to everyone's taste (no exceptions, no user-defined generics, etc), but it fit my mental model well. Simple, speedy, does things the obvious way. During the port, I was especially impressed with how robust the standard library and tooling was.


The port
--------

I started writing a couple of 20-line command line scripts, but I wasn't really getting into the language or ecosystem in a big way. So I wanted to do a medium-sized project in it, and decided porting the backend for my [GiftyWeddings.com](https://giftyweddings.com/) website was the way to go.

It was originally about 1300 lines of Python code, using Flask, WTForms, Peewee, SQLite, and a few other libraries for S3, image resizing, etc.

For the Go port, I wanted to use as few external dependencies as reasonably possible, so that I could learn more of the language and be exposed to as much of the Go standard library as possible. In particular, Go has great HTTP libraries, and I didn't want to pull in a web framework. However, I used 3rd party libraries for S3, Stripe, SQLite, password handling, and image resizing.

Due to Go's static typing and because I was using fewer libraries, I expected that the code would end up being more than twice as many lines of code. However, it was only 1900 lines of Go (about 50% more than the 1300 lines of Python).

The porting effort was very smooth, and a lot of the business logic was almost mechanical, line-for-line porting of the original Python. I was surprised how well many Python concepts translate to Go, right down to the `things[:20]` slice notation.

I also ported a subset of the Python [itsdangerous](http://pythonhosted.org/itsdangerous/) library Flask uses, so that I could still decode signed session cookies from the Python server during the transition to the Go version. All the cyrpto, compression, and encoding libraries were readily available, and it was a simple process.

Overall, between the [Go Tour](https://tour.golang.org/welcome/1), [Effective Go](https://golang.org/doc/effective_go.html), and looking at various code snippets online, it really felt effortless to learn the language. The documention is terse but very well done.

The tooling is also excellent: everything you need to build, run, format, and test your code is available via `go` sub-commands. For development, I simply used `go run *.go` to compile and run the server. It compiled and started in about a second, which was a breath of fresh air after [sword-fighting](https://xkcd.com/303/) through 20-second incremental and 20-minute full compile times in Scala.


Testing
-------

There's a basic [testing](https://golang.org/pkg/testing/) package in the standard library, as well as a test runner (`go test`) which finds, compiles, and runs your tests. The standard testing package is very light-weight (maybe a bit too much so), but you can easily add helper functions to get the job done.

In addition to unit tests, I wrote a test script (also using Go's testing package) that runs HTTP-level tests against a real Gifty Weddings server. I did it at the HTTP level rather than hooking into the Go code more directly so that I could run the same tests against the old Python server and ensure both servers produced exactly the same results. This gave me good confidence it'd just work when I switched the live site.

I did a small amount of white-box testing here: the script validates the responses, but it also decodes the session cookies to ensure they contain the right data.

Here's an example test from the HTTP test suite that creates a registry and deletes a gift:

```go
func TestDeleteGift(t *testing.T) {
    client := NewClient(baseURL)
    response := client.PostJSONOK(t, "/api/create", nil)
    AssertMatches(t, response["slug"], `temp\d+`)

    slug := response["slug"].(string)
    html := client.GetOK(t, "/"+slug, "text/html")
    _, gifts := ParseRegistryAndGifts(t, html)
    AssertEqual(t, len(gifts), 3)

    gift := gifts[0].(map[string]interface{})
    giftID := int(gift["id"].(float64))
    response = client.PostJSONOK(t, fmt.Sprintf("/api/registries/%s/gifts/%d/delete", slug, giftID), nil)
    expected := map[string]interface{}{
        "id": nil,
    }
    AssertDeepEqual(t, response, expected)

    html = client.GetOK(t, "/"+slug, "text/html")
    _, gifts = ParseRegistryAndGifts(t, html)
    AssertEqual(t, len(gifts), 2)
}
```


Cross-compiling
---------------

I just think it's the coolest thing that on macOS (for example), you can just say:

    $ GOOS=linux GOARCH=amd64 go build

and it will cross-compile a ready-to-go Linux binary on your Mac. And of course you can go in the other direction, or cross-compile to and from Windows. It just works.

Compiling `cgo` extensions (like SQLite) is a bit more difficult this way, as you need to install the proper cross-compiling version of GCC -- which unlike Go, isn't trivial. So in the end I used Docker with the following command to build for Linux:

```
$ docker run --rm -it -v ~/go:/go -w /go/src/gifty golang:1.9.1 \
    go build -o gifty_linux -v *.go
```


Good things
-----------

One of the great things about Go is that everything feels **rock solid**: the standard library, the tooling (`go` command), and even 3rd party packages. My own hunch is that this is partly due to the fact that Go doesn't have exceptions, so there's this somewhat enforced "culture of error handling" imposed by error values.

The **network and HTTP libraries** in particular seem really good. You can fire up a [`net/http`](https://golang.org/pkg/net/http/) web server (production-grade and HTTP/2-ready, mind you) in a couple of lines of code.

The **standard library** has most of the utilities you need, too: `html/template`, `ioutil.WriteFile`, `ioutil.TempFile`, `crypto/sha1`, `encoding/base64`, `smtp.SendMail`, `zlib`, `image/jpeg` and `image/png`, and the list goes on. The APIs are good, and where there are low-level APIs they're usually wrapped in higher-level functions to keep life simple for the common cases.

So it was not hard at all to write a web backend without any framework.

I was pleasantly surprised how easy it is to deal with **JSON** in a statically-typed language: you just `json.Unmarshal` right into a struct, and it uses reflection to figure out what to do with the field names. Loading my server config file was as simple as:

```go
err = json.Unmarshal(data, &config)
if err != nil {
    log.Fatalf("error parsing config JSON: %v", err)
}
```

Speaking of **`err != nil`**, it wasn't nearly as bad as people make out (it occurs about 70 times in my 1900 lines of code). And you get a good feeling of "this is really solid, I'm handling each and every error case properly".

That said, because each web request runs in its own goroutine, I did use some calls to `panic()` for things like database queries which "shouldn't fail". And in my top level request handler, I caught any panics with `recover()` and logged them appropriately and had some code to email me the stack trace.

Coming from Python and Flask, it was very tempting to use a special panic value for Not Found and Bad Request responses, but I faithfully resisted temptation and went for more idiomatic Go (proper returns).

I *love* how there's **one synchronous API** for everything, plus the awesome `go` keyword to run something in a background goroutine. This is really in constrast to Python/C#/JavaScript's async APIs -- that leads to new APIs for every I/O-related function, which doubles the API surface.

[**`time.Parse()`**](https://golang.org/pkg/time/#Parse) formatting is quirky with its idea of a "reference date", but it does mean it's very readable when you come back to the code later (in contrast to "what did `%b` mean again?").

The **[`context`](https://golang.org/pkg/context/) library** took a bit to get my head around, but it was useful for passing around extra request data (user session data, etc) for the duration of the request.


General quirks
--------------

Go certainly has fewer quirks than Python (then again, Go's not 26 years old), but it does have some. Below are a few that I noticed when writing my port.

**You can't take the address of a function result or expression.** You can take the address of a variable and, as a special case, of a struct literal like `&Point{2, 3}`, but you can't do `&time.Now()`. This is a small annoyance, as you have to declare a temporary variable:

```go
now := time.Now()
thing.TimePtr = &now
```

It seems to me that the Go compiler could easily create a temporary for you and allow `thing.TimePtr = &time.Now()`.

**HTTP handlers take an `http.ResponseWriter` instead of returning a response.** The [`http.ResponseWriter`](https://golang.org/pkg/net/http/#ResponseWriter) API is a little bit awkward for common cases, and you have to remember the correct order for calling `Header().Set`, `WriteHeader`, and `Write`. It'd be simpler if handlers simply returned some kind of response object.

This also means it's annoying to get at the HTTP status code after a handler call (eg: for logging the response code). You have to inject a fake `ResponseWriter` that stores the status code.

There's probably a good reason for this (efficiency? composability?), but I can't immediately see what it is. I could have easily wrapped my handlers to return a response object, but I decided not to.

**Templating is okay, but has its quirks.** I found [`html/template`](https://golang.org/pkg/html/template/) quite good, but it took me a while to grok "associated templates" and what these were for. A few more examples of this, particularly for template inheritance, would have been helpful. I did like the fact that it doesn't get in your way and isn't too opinionated (it's easy to add user-defined functions, for example).

Loading templates was a bit awkward, so I wrapped `html/template` in my own render package that loaded a directory of files along with a base template.

The syntax is okay, but the expression syntax is a bit weird. I think it'd be better if it were closer to Go syntax. In fact, next time around I'd probably use something like [`ego`](https://github.com/benbjohnson/ego) or [`quicktemplate`](https://github.com/valyala/quicktemplate) which are basically Go syntax and don't require you to learn a new expression language.

**The [`database/sql`](https://golang.org/pkg/database/sql/) package is a bit too light.** I'm not the biggest fan of ORMs, but it'd be nice if `database/sql` could at least use reflection to fill in a struct's fields like `encoding/json` does. `Scan()` is just too low-level. However, it looks like there's the [`sqlx`](https://github.com/jmoiron/sqlx) 3rd party package that adds just that.

**Testing is a bit light.** While I am a fan of `go test` and the overall simplicity of testing in Go, I think it'd be good if it at least had `AssertEqual` style functions. I ended up defining my own `AssertEqual` and `AssertMatches` functions. Again, it looks like there's a small 3rd party package that adds this: [`stretchr/testify`](https://github.com/stretchr/testify).

**Tons of I/O functions.** The number of I/O functions is a bit overwhelming to newbies. Do I use `io`, `bufio`, `bytes`, `strings`, `ioutil`, or `fmt`? However, they all have a purpose, it just takes a bit of working through to see what each is for. Maybe a small "Go I/O Howto" document would be helpful.

**The `flag` package is quirky.** Apparently it was [loosely based](https://groups.google.com/d/msg/golang-nuts/3myLL-6mA94/VUkLtSOyS-YJ) on Google's flag package, but the `-singleHyphen` thing seems weird when GNU-style `-s` and `--long` options are pretty much the standard. Again, there are plenty of 3rd party replacements, some drop-in replacements for the built-in `flag` package.

**The built-in URL router** ([ServeMux](https://golang.org/pkg/net/http/#ServeMux)) is a little too light-weight as it just matches fixed prefixes, but creating a [regexp](https://golang.org/pkg/regexp/)-based router was trivial (a dozen lines of code).


Annoyances coming from Python
-----------------------------

Coming from Python, code is definitely a bit more verbose in places. Though as I mentioned, a lot of code translated almost line-for-line from the Python codebase, and felt really natural.

But **I missed list/dict comprehensions.** It would have been great to be able to turn this:

```go
gifts := []map[string]interface{}{}
for _, g := range registryGifts {
    gifts = append(gifts, g.Map())
}
```

into this:

```go
gifts := [g.Map() for _, g := range registryGifts]
```

Still, I had a lot fewer of these cases than I would have expected.

In a similar vein, **[`sort.Interface`](https://golang.org/pkg/sort/#Interface) is pretty verbose.** The [`sort.Slice()`](https://golang.org/pkg/sort/#Slice) function is a very good addition. But I love how you can sort by key in Python, instead of messing about with slice indices. For example, to sort a list of strings case insensitively in Python:

```python
strs.sort(key=str.lower)
```

But in Go that would be something like:

```go
sort.Slice(strs, func(i, j int) bool {
    return strings.ToLower(strs[i]) < strings.ToLower(strs[j])
})
```

That's really all I missed. I expected to miss exceptions, but didn't. And, contrary to popular sentiment, not having generics bothered me about once in the entire port.


Why Go?
-------

I'm not going to stop using Python anytime soon. I'd still use it any day for scripting and smaller projects or web backends. However, I'd seriously consider using Go for larger projects (static typing makes refactoring easier) as well as tools or systems where language performance matters (and to be fair, with all the low-level libraries in Python written in C, it often doesn't).

So to summarize, here are some of the reasons why I liked Go, and why you might too:

* Low learning curve: it's a small language with a [readable spec](https://golang.org/ref/spec) and simple type system.
* Fast compile times.
* Unique languages features are really nice: slices, goroutines and the `go` keyword, `defer`, `:=` for succinct type inference, the interface-based type system.
* Excellent and concise documentation for the language and standard library packages.
* Great built-in tooling:
  - `go build`: compile program (no makefile necessary)
  - `go fmt`: format code automatically, end bracing style wars
  - `go test`: run tests in all `*_test.go` files
  - `go run`: compile and run a program immediately, feels like scripting
  - `dep`: dependency manager, soon to become the official `go dep`
* Good and growing ecosystem (database libraries, web helpers/frameworks, AWS, Stripe, GraphQL, etc).
* Stability: Go 1 has been around for over five years and has [strict compatibility](https://golang.org/doc/go1compat) guarantees. The Go authors are very conservative about what they allow into the language, for good reason.
* The philosophy is not to everyone's taste, but fits my own mental model really well: simplicity, clarity, and speed.

So go ahead and [write in Go](https://www.youtube.com/watch?v=LJvEIjRBSDA)!
