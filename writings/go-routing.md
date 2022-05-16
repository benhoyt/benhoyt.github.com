---
layout: default
title: Different approaches to HTTP routing in Go
permalink: /writings/go-routing/
description: "Compares various routing techniques in Go, including five custom approaches and three using third-party routing libraries."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2020</p>


There are many ways to do HTTP path routing in Go -- for better or worse. There's the standard library's [`http.ServeMux`](https://golang.org/pkg/net/http/#ServeMux), but it only supports basic prefix matching. There are many ways to do more advanced routing yourself, including Axel Wagner's interesting [`ShiftPath` technique](https://blog.merovius.de/2017/06/18/how-not-to-use-an-http-router.html). And then of course there are lots of third-party router libraries. In this article I'm going to do a comparison of several custom techniques and some off-the-shelf packages.

I'll be upfront about my biases: I like simple and clear code, and I'm a bit allergic to large dependencies (and sometimes those are in tension). Most libraries with "framework" in the title don't do it for me, though I'm not opposed to using well-maintained libraries that do one or two things well.

My goal here is to route the same 11 URLs with eight different approaches. These URLs are based on a subset of URLs in a web application I maintain. They use `GET` and `POST`, but they're not particularly RESTful or well designed -- the kind of messiness you find in real-world systems. Here are the methods and URLs:

```
GET  /                                      # home
GET  /contact                               # contact
GET  /api/widgets                           # apiGetWidgets
POST /api/widgets                           # apiCreateWidget
POST /api/widgets/:slug                     # apiUpdateWidget
POST /api/widgets/:slug/parts               # apiCreateWidgetPart
POST /api/widgets/:slug/parts/:id/update    # apiUpdateWidgetPart
POST /api/widgets/:slug/parts/:id/delete    # apiDeleteWidgetPart
GET  /:slug                                 # widget
GET  /:slug/admin                           # widgetAdmin
POST /:slug/image                           # widgetImage
```

The `:slug` is a URL-friendly widget identifier like `foo-bar`, and the `:id` is a positive integer like `1234`. Each routing approach should match on the exact URL -- trailing slashes will return 404 Not Found (redirecting them is also a fine decision, but I'm not doing that here). Each router should handle the specified method (`GET` or `POST`) and reject the others with a 405 Method Not Allowed response. I wrote some [table-driven tests](https://github.com/benhoyt/go-routing/blob/master/main_test.go) to ensure that all the routers do the right thing.

In the rest of this article I'll present code for the various approaches and discuss some pros and cons of each (all the code is in the [benhoyt/go-routing](https://github.com/benhoyt/go-routing) repo). There's a lot of code, but all of it is fairly straight-forward and should be easy to skim. You can use the following links to skip down to a particular technique. First, the five custom techniques:

* [Regex table](#regex-table): loop through pre-compiled regexes and pass matches using the request context
* [Regex switch](#regex-switch): a switch statement with cases that call a regex-based `match()` helper which scans path parameters into variables
* [Pattern matcher](#pattern-matcher): similar to the above, but using a simple pattern matching function instead of regexes
* [Split switch](#split-switch): split the path on `/` and then switch on the contents of the path segments
* [ShiftPath](#shiftpath): Axel Wagner's hierarchical `ShiftPath` technique

And three versions using third-party router packages:

* [Chi](#chi): uses `github.com/go-chi/chi`
* [Gorilla](#gorilla): uses `github.com/gorilla/mux`
* [Pat](#pat): uses `github.com/bmizerany/pat`

I also tried [httprouter](https://github.com/julienschmidt/httprouter), which is supposed to be really fast, but it [can't handle](https://github.com/julienschmidt/httprouter/issues/73) URLs with overlapping prefixes like `/contact` and `/:slug`. Arguably this is bad URL design anyway, but a lot of real-world web apps do it, so I think this is quite limiting.

There are many other third-party router packages or "web frameworks", but these three bubbled to the top in my searches (and I believe they're fairly representative).

In this comparison I'm not concerned about speed. Most of the approaches loop or `switch` through a list of routes (in contrast to fancy trie-lookup structures). All of these approaches only add a few *microseconds* to the request time (see [benchmarks](#benchmarks)), and that isn't an issue in any of the web applications I've worked on.


Regex table
-----------

The first approach I want to look at is the method I use in the current version of my web application -- it's the first thing that came to mind when I was learning Go a few years back, and I still think it's a pretty good approach.

It's basically a table of pre-compiled [`regexp`](https://golang.org/pkg/regexp/) objects with a little 21-line routing function that loops through them, and calls the first one that matches both the path and the HTTP method. Here are the routes and the `Serve()` routing function:

```go
var routes = []route{
    newRoute("GET", "/", home),
    newRoute("GET", "/contact", contact),
    newRoute("GET", "/api/widgets", apiGetWidgets),
    newRoute("POST", "/api/widgets", apiCreateWidget),
    newRoute("POST", "/api/widgets/([^/]+)", apiUpdateWidget),
    newRoute("POST", "/api/widgets/([^/]+)/parts", apiCreateWidgetPart),
    newRoute("POST", "/api/widgets/([^/]+)/parts/([0-9]+)/update", apiUpdateWidgetPart),
    newRoute("POST", "/api/widgets/([^/]+)/parts/([0-9]+)/delete", apiDeleteWidgetPart),
    newRoute("GET", "/([^/]+)", widget),
    newRoute("GET", "/([^/]+)/admin", widgetAdmin),
    newRoute("POST", "/([^/]+)/image", widgetImage),
}

func newRoute(method, pattern string, handler http.HandlerFunc) route {
    return route{method, regexp.MustCompile("^" + pattern + "$"), handler}
}

type route struct {
    method  string
    regex   *regexp.Regexp
    handler http.HandlerFunc
}

func Serve(w http.ResponseWriter, r *http.Request) {
    var allow []string
    for _, route := range routes {
        matches := route.regex.FindStringSubmatch(r.URL.Path)
        if len(matches) > 0 {
            if r.Method != route.method {
                allow = append(allow, route.method)
                continue
            }
            ctx := context.WithValue(r.Context(), ctxKey{}, matches[1:])
            route.handler(w, r.WithContext(ctx))
            return
        }
    }
    if len(allow) > 0 {
        w.Header().Set("Allow", strings.Join(allow, ", "))
        http.Error(w, "405 method not allowed", http.StatusMethodNotAllowed)
        return
    }
    http.NotFound(w, r)
}
```

Path parameters are handled by adding the `matches` slice to the request context, so the handlers can pick them up from there. I've defined a custom context key type, as well as a `getField` helper function that's used inside the handlers:

```go
type ctxKey struct{}

func getField(r *http.Request, index int) string {
    fields := r.Context().Value(ctxKey{}).([]string)
    return fields[index]
}
```

A typical handler with path parameters looks like this:

```go
// Handles POST /api/widgets/([^/]+)/parts/([0-9]+)/update
func apiUpdateWidgetPart(w http.ResponseWriter, r *http.Request) {
    slug := getField(r, 0)
    id, _ := strconv.Atoi(getField(r, 1))
    fmt.Fprintf(w, "apiUpdateWidgetPart %s %d\n", slug, id)
}
```

I haven't checked the error returned by `Atoi()`, because the regex for the ID parameter only matches digits: `[0-9]+`. Of course, there's still no guarantee the object exists in the database -- that still needs to be done in the handler. (If the number is too large, `Atoi` will return an error, but in that case the `id` will be zero and the database lookup will fail, so there's no need for an extra check.)

An alternative to passing the fields using context is to make each `route.handler` a function that takes the fields as a `[]string` and returns an `http.HandleFunc` closure that closes over the `fields` parameter. The `Serve` function would then instantiate and call the closure as follows:

```go
handler := route.handler(matches[1:])
handler(w, r)
```

Then each handler would look like this:

```go
func apiUpdateWidgetPart(fields []string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        slug := fields[0]
        id, _ := strconv.Atoi(fields[1])
        fmt.Fprintf(w, "apiUpdateWidgetPart %s %d\n", slug, id)
    }
}
```

I slightly prefer the context approach, as it keeps the handler signatures simple `http.HandlerFunc`s, and also avoids a nested function for each handler definition.

There's nothing particularly clever about the regex table approach, and it's similar to how a number of the third-party packages work. But it's so simple it only takes a few lines of code and a few minutes to write. It's also easy to modify if you need to: for example, to add logging, change the error responses to JSON, and so on.

[Full regex table code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/retable/route.go)


Regex switch
------------

The second approach still uses regexes, but with a simple imperative `switch` statement and a `match()` helper to go through the matches. The advantage of this approach is that you can call other functions or test other things in each `case`. Also, the signature of the `match` function allows you to "scan" path parameters into variables in order to pass them to the handlers more directly. Here are the routes and the `match()` function:

```go
func Serve(w http.ResponseWriter, r *http.Request) {
    var h http.Handler
    var slug string
    var id int

    p := r.URL.Path
    switch {
    case match(p, "/"):
        h = get(home)
    case match(p, "/contact"):
        h = get(contact)
    case match(p, "/api/widgets") && r.Method == "GET":
        h = get(apiGetWidgets)
    case match(p, "/api/widgets"):
        h = post(apiCreateWidget)
    case match(p, "/api/widgets/([^/]+)", &slug):
        h = post(apiWidget{slug}.update)
    case match(p, "/api/widgets/([^/]+)/parts", &slug):
        h = post(apiWidget{slug}.createPart)
    case match(p, "/api/widgets/([^/]+)/parts/([0-9]+)/update", &slug, &id):
        h = post(apiWidgetPart{slug, id}.update)
    case match(p, "/api/widgets/([^/]+)/parts/([0-9]+)/delete", &slug, &id):
        h = post(apiWidgetPart{slug, id}.delete)
    case match(p, "/([^/]+)", &slug):
        h = get(widget{slug}.widget)
    case match(p, "/([^/]+)/admin", &slug):
        h = get(widget{slug}.admin)
    case match(p, "/([^/]+)/image", &slug):
        h = post(widget{slug}.image)
    default:
        http.NotFound(w, r)
        return
    }
    h.ServeHTTP(w, r)
}

// match reports whether path matches regex ^pattern$, and if it matches,
// assigns any capture groups to the *string or *int vars.
func match(path, pattern string, vars ...interface{}) bool {
    regex := mustCompileCached(pattern)
    matches := regex.FindStringSubmatch(path)
    if len(matches) <= 0 {
        return false
    }
    for i, match := range matches[1:] {
        switch p := vars[i].(type) {
        case *string:
            *p = match
        case *int:
            n, err := strconv.Atoi(match)
            if err != nil {
                return false
            }
            *p = n
        default:
            panic("vars must be *string or *int")
        }
    }
    return true
}
```

I must admit to being quite fond of this approach. I like how simple and direct it is, and I think the scan-like behaviour for path parameters is clean. The scanning inside `match()` detects the type, and converts from string to integer if needed. It only supports `string` and `int` right now, which is probably all you need for most routes, but it'd be easy to add more types if you need to. 

Here's what a handler with path parameters looks like (to avoid repetition, I've used the `apiWidgetPart` struct for all the handlers that take those two parameters):

```
type apiWidgetPart struct {
    slug string
    id   int
}

func (h apiWidgetPart) update(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "apiUpdateWidgetPart %s %d\n", h.slug, h.id)
}

func (h apiWidgetPart) delete(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "apiDeleteWidgetPart %s %d\n", h.slug, h.id)
}
```

Note the `get()` and `post()` helper functions, which are essentially simple middleware that check the request method as follows:

```go
// get takes a HandlerFunc and wraps it to only allow the GET method
func get(h http.HandlerFunc) http.HandlerFunc {
    return allowMethod(h, "GET")
}

// post takes a HandlerFunc and wraps it to only allow the POST method
func post(h http.HandlerFunc) http.HandlerFunc {
    return allowMethod(h, "POST")
}

// allowMethod takes a HandlerFunc and wraps it in a handler that only
// responds if the request method is the given method, otherwise it
// responds with HTTP 405 Method Not Allowed.
func allowMethod(h http.HandlerFunc, method string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if method != r.Method {
            w.Header().Set("Allow", method)
            http.Error(w, "405 method not allowed", http.StatusMethodNotAllowed)
            return
        }
        h(w, r)
    }
}
```

One of the slightly awkward things is how it works for paths that handle more than one method. There are probably different ways to do it, but I currently test the method explicitly in the first route -- the `get()` wrapper is not strictly necessary here, but I've included it for consistency:

```go
    case match(p, "/api/widgets") && r.Method == "GET":
        h = get(apiGetWidgets)
    case match(p, "/api/widgets"):
        h = post(apiCreateWidget)
```

At first I included the HTTP method matching in the `match()` helper, but that makes it more difficult to return 405 Method Not Allowed responses properly.

One other aspect of this approach is the lazy regex compiling. We could just call `regexp.MustCompile`, but that would re-compile each regex on every reqeust. Instead, I've added a concurrency-safe `mustCompileCached` function that means the regexes are only compiled the first time they're used:

```go
var (
    regexen = make(map[string]*regexp.Regexp)
    relock  sync.Mutex
)

func mustCompileCached(pattern string) *regexp.Regexp {
    relock.Lock()
    defer relock.Unlock()

    regex := regexen[pattern]
    if regex == nil {
        regex = regexp.MustCompile("^" + pattern + "$")
        regexen[pattern] = regex
    }
    return regex
}
```

Overall, despite liking the clarity of this approach and the scan-like `match()` helper, a point against it is the messiness required to cache the regex compilation.

[Full regex switch code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/reswitch/route.go)


Pattern matcher
---------------

This approach is similar to the regex switch method, but instead of regexes it uses a simple, custom pattern matcher.

The patterns supplied to the custom `match()` function handle one wildcard character, `+`, which matches (and captures) any characters till the next `/` in the request path. This is of course much less powerful than regex matching, but generally I've not needed anything more than "match till next slash" in my routes. Here is what the routes and match code look like:

```go
func Serve(w http.ResponseWriter, r *http.Request) {
    var h http.Handler
    var slug string
    var id int

    p := r.URL.Path
    switch {
    case match(p, "/"):
        h = get(home)
    case match(p, "/contact"):
        h = get(contact)
    case match(p, "/api/widgets") && r.Method == "GET":
        h = get(apiGetWidgets)
    case match(p, "/api/widgets"):
        h = post(apiCreateWidget)
    case match(p, "/api/widgets/+", &slug):
        h = post(apiWidget{slug}.update)
    case match(p, "/api/widgets/+/parts", &slug):
        h = post(apiWidget{slug}.createPart)
    case match(p, "/api/widgets/+/parts/+/update", &slug, &id):
        h = post(apiWidgetPart{slug, id}.update)
    case match(p, "/api/widgets/+/parts/+/delete", &slug, &id):
        h = post(apiWidgetPart{slug, id}.delete)
    case match(p, "/+", &slug):
        h = get(widget{slug}.widget)
    case match(p, "/+/admin", &slug):
        h = get(widget{slug}.admin)
    case match(p, "/+/image", &slug):
        h = post(widget{slug}.image)
    default:
        http.NotFound(w, r)
        return
    }
    h.ServeHTTP(w, r)
}

// match reports whether path matches the given pattern, which is a
// path with '+' wildcards wherever you want to use a parameter. Path
// parameters are assigned to the pointers in vars (len(vars) must be
// the number of wildcards), which must be of type *string or *int.
func match(path, pattern string, vars ...interface{}) bool {
    for ; pattern != "" && path != ""; pattern = pattern[1:] {
        switch pattern[0] {
        case '+':
            // '+' matches till next slash in path
            slash := strings.IndexByte(path, '/')
            if slash < 0 {
                slash = len(path)
            }
            segment := path[:slash]
            path = path[slash:]
            switch p := vars[0].(type) {
            case *string:
                *p = segment
            case *int:
                n, err := strconv.Atoi(segment)
                if err != nil || n < 0 {
                    return false
                }
                *p = n
            default:
                panic("vars must be *string or *int")
            }
            vars = vars[1:]
        case path[0]:
            // non-'+' pattern byte must match path byte
            path = path[1:]
        default:
            return false
        }
    }
    return path == "" && pattern == ""
}
```

Other than that, the `get()` and `post()` helpers, as well as the handlers themselves, are identical to the regex switch method. I quite like this approach (and it's efficient), but the byte-by-byte matching code was a little fiddly to write -- definitely not as simple as calling `regex.FindStringSubmatch()`.

[Full pattern matcher code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/match/route.go)

**Update:** Yuri Vishnevsky sent me an [interesting variant](https://gist.github.com/benhoyt/98b08cf79d0fe659b5700c52667c8742) of this idea on Gophers Slack. In his words, "I decided to inline the pieces, so the match arguments reads as the path does: `match("foo", &bar, "baz")`." I quite like this -- thanks Yuri!


Split switch
------------

This approach simply splits the request path on `/` and then uses a `switch` with `case` statements that compare the number of path segments and the content of each segment. It's direct and simple, but also a bit error-prone, with lots of hard-coded lengths and indexes. Here is the code:

```go
func Serve(w http.ResponseWriter, r *http.Request) {
    // Split path into slash-separated parts, for example, path "/foo/bar"
    // gives p==["foo", "bar"] and path "/" gives p==[""].
    p := strings.Split(r.URL.Path, "/")[1:]
    n := len(p)

    var h http.Handler
    var id int
    switch {
    case n == 1 && p[0] == "":
        h = get(home)
    case n == 1 && p[0] == "contact":
        h = get(contact)
    case n == 2 && p[0] == "api" && p[1] == "widgets" && r.Method == "GET":
        h = get(apiGetWidgets)
    case n == 2 && p[0] == "api" && p[1] == "widgets":
        h = post(apiCreateWidget)
    case n == 3 && p[0] == "api" && p[1] == "widgets" && p[2] != "":
        h = post(apiWidget{p[2]}.update)
    case n == 4 && p[0] == "api" && p[1] == "widgets" && p[2] != "" && p[3] == "parts":
        h = post(apiWidget{p[2]}.createPart)
    case n == 6 && p[0] == "api" && p[1] == "widgets" && p[2] != "" && p[3] == "parts" && isId(p[4], &id) && p[5] == "update":
        h = post(apiWidgetPart{p[2], id}.update)
    case n == 6 && p[0] == "api" && p[1] == "widgets" && p[2] != "" && p[3] == "parts" && isId(p[4], &id) && p[5] == "delete":
        h = post(apiWidgetPart{p[2], id}.delete)
    case n == 1:
        h = get(widget{p[0]}.widget)
    case n == 2 && p[1] == "admin":
        h = get(widget{p[0]}.admin)
    case n == 2 && p[1] == "image":
        h = post(widget{p[0]}.image)
    default:
        http.NotFound(w, r)
        return
    }
    h.ServeHTTP(w, r)
}
```

The handlers are identical to the other `switch`-based methods, as are the `get` and `post` helpers. The only helper here is the `isId` function, which checks that the ID segments are in fact positive integers:

```go
func isId(s string, p *int) bool {
    id, err := strconv.Atoi(s)
    if err != nil || id <= 0 {
        return false
    }
    *p = id
    return true
}
```

So while I like the bare-bones simplicity of this approach -- just basic string equality comparisons -- the verbosity of the matching and the error-prone integer constants would make me think twice about actually using it for anything but very simple routing.

[Full split switch code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/split/route.go)


ShiftPath
---------

Axel Wagner wrote a blog article, [How to not use an http-router in go](https://blog.merovius.de/2017/06/18/how-not-to-use-an-http-router.html), in which he maintains that routers (third party or otherwise) should not be used. He presents a technique involving a small `ShiftPath()` helper that returns the first path segment, and shifts the rest of the URL down. The current handler switches on the first path segment, then delegates to sub-handlers which do the same thing on the rest of the URL.

Let's see what Axel's technique looks like for a subset our set of URLs:

```go
func serve(w http.ResponseWriter, r *http.Request) {
    var head string
    head, r.URL.Path = shiftPath(r.URL.Path)
    switch head {
    case "":
        serveHome(w, r)
    case "api":
        serveApi(w, r)
    case "contact":
        serveContact(w, r)
    default:
        widget{head}.ServeHTTP(w, r)
    }
}

// shiftPath splits the given path into the first segment (head) and
// the rest (tail). For example, "/foo/bar/baz" gives "foo", "/bar/baz".
func shiftPath(p string) (head, tail string) {
    p = path.Clean("/" + p)
    i := strings.Index(p[1:], "/") + 1
    if i <= 0 {
        return p[1:], "/"
    }
    return p[1:i], p[i:]
}

// ensureMethod is a helper that reports whether the request's method is
// the given method, writing an Allow header and a 405 Method Not Allowed
// if not. The caller should return from the handler if this returns false.
func ensureMethod(w http.ResponseWriter, r *http.Request, method string) bool {
    if method != r.Method {
        w.Header().Set("Allow", method)
        http.Error(w, "405 method not allowed", http.StatusMethodNotAllowed)
        return false
    }
    return true
}

// ...

// Handles /api and below
func serveApi(w http.ResponseWriter, r *http.Request) {
    var head string
    head, r.URL.Path = shiftPath(r.URL.Path)
    switch head {
    case "widgets":
        serveApiWidgets(w, r)
    default:
        http.NotFound(w, r)
    }
}

// Handles /api/widgets and below
func serveApiWidgets(w http.ResponseWriter, r *http.Request) {
    var head string
    head, r.URL.Path = shiftPath(r.URL.Path)
    switch head {
    case "":
        if r.Method == "GET" {
            serveApiGetWidgets(w, r)
        } else {
            serveApiCreateWidget(w, r)
        }
    default:
        apiWidget{head}.ServeHTTP(w, r)
    }
}

// Handles GET /api/widgets
func serveApiGetWidgets(w http.ResponseWriter, r *http.Request) {
    if !ensureMethod(w, r, "GET") {
        return
    }
    fmt.Fprint(w, "apiGetWidgets\n")
}

// Handles POST /api/widgets
func serveApiCreateWidget(w http.ResponseWriter, r *http.Request) {
    if !ensureMethod(w, r, "POST") {
        return
    }
    fmt.Fprint(w, "apiCreateWidget\n")
}

type apiWidget struct {
    slug string
}

// Handles /api/widgets/:slug and below
func (h apiWidget) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    var head string
    head, r.URL.Path = shiftPath(r.URL.Path)
    switch head {
    case "":
        h.serveUpdate(w, r)
    case "parts":
        h.serveParts(w, r)
    default:
        http.NotFound(w, r)
    }
}

func (h apiWidget) serveUpdate(w http.ResponseWriter, r *http.Request) {
    if !ensureMethod(w, r, "POST") {
        return
    }
    fmt.Fprintf(w, "apiUpdateWidget %s\n", h.slug)
}

func (h apiWidget) serveParts(w http.ResponseWriter, r *http.Request) {
    var head string
    head, r.URL.Path = shiftPath(r.URL.Path)
    switch head {
    case "":
        h.serveCreatePart(w, r)
    default:
        id, err := strconv.Atoi(head)
        if err != nil || id <= 0 {
            http.NotFound(w, r)
            return
        }
        apiWidgetPart{h.slug, id}.ServeHTTP(w, r)
    }
}

// ...
```

With this router, I wrote a [`noTrailingSlash`](https://github.com/benhoyt/go-routing/blob/9a2fa7a643ecb5681f504b95064d948ee2177c9a/shiftpath/route.go#L54-L67) decorator to ensure Not Found is returned by URLs with a trailing slash, as our URL spec defines those as invalid. The ShiftPath approach doesn't distinguish between no trailing slash and trailing slash, and I can't find a simple way to make it do that. I think a decorator is a reasonable approach for this, rather than doing it explicitly in every route -- in a given web app, you'd probably want to either allow trailing slashes and redirect them, or return Not Found as I've done here.

While I like the idea of just using the standard library, and the path-shifting technique is quite clever, I strongly prefer seeing my URLs all in one place -- Axel's approach spreads the logic across many handlers, so it's difficult to see what handles what. It's also quite a lot of code, some of which is error prone.

I do like the fact that (as Axel said) "the dependencies of [for example] ProfileHandler are clear at compile time", though this is true for several of the other techniques above as well. On balance, I find it too verbose and think it'd be difficult for people reading the code to quickly answer the question, "given this HTTP method and URL, what happens?"

[Full ShiftPath code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/shiftpath/route.go)


Chi
---

[Chi](https://github.com/go-chi/chi) is billed as a "lightweight, idiomatic and composable router", and I think it lives up to this description. It's simple to use and the code looks nice on the page. Here are the route definitions:

```go
func init() {
    r := chi.NewRouter()

    r.Get("/", home)
    r.Get("/contact", contact)
    r.Get("/api/widgets", apiGetWidgets)
    r.Post("/api/widgets", apiCreateWidget)
    r.Post("/api/widgets/{slug}", apiUpdateWidget)
    r.Post("/api/widgets/{slug}/parts", apiCreateWidgetPart)
    r.Post("/api/widgets/{slug}/parts/{id:[0-9]+}/update", apiUpdateWidgetPart)
    r.Post("/api/widgets/{slug}/parts/{id:[0-9]+}/delete", apiDeleteWidgetPart)
    r.Get("/{slug}", widgetGet)
    r.Get("/{slug}/admin", widgetAdmin)
    r.Post("/{slug}/image", widgetImage)

    Serve = r
}
```

And the handlers are straight-forward too. They look much the same as the handlers in the regex table approach, but the custom `getField()` function is replaced by `chi.URLParam()`. One small advantage is that parameters are accessible by name instead of number:

```go
func apiUpdateWidgetPart(w http.ResponseWriter, r *http.Request) {
    slug := chi.URLParam(r, "slug")
    id, _ := strconv.Atoi(chi.URLParam(r, "id"))
    fmt.Fprintf(w, "apiUpdateWidgetPart %s %d\n", slug, id)
}
```

As with my regex table router, I'm ignoring the error value from `strconv.Atoi()` as the path parameter's regex has already checked that it's made of digits.

If you're going to build a substantial web app, Chi actually looks quite nice. The main `chi` package just does routing, but the module also comes with a whole bunch of [composable middleware](https://github.com/go-chi/chi#core-middlewares) to do things like HTTP authentication, logging, trailing slash handling, and so on.

[Full Chi code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/chi/route.go)



Gorilla
-------

The Gorilla toolkit is a bunch of packages that implement routing, session handling, and so on. The [gorilla/mux](http://www.gorillatoolkit.org/pkg/mux) router package is what we'll be using here. It's similar to Chi, though the method matching is a little more verbose:

```go
func init() {
    r := mux.NewRouter()

    r.HandleFunc("/", home).Methods("GET")
    r.HandleFunc("/contact", contact).Methods("GET")
    r.HandleFunc("/api/widgets", apiGetWidgets).Methods("GET")
    r.HandleFunc("/api/widgets", apiCreateWidget).Methods("POST")
    r.HandleFunc("/api/widgets/{slug}", apiUpdateWidget).Methods("POST")
    r.HandleFunc("/api/widgets/{slug}/parts", apiCreateWidgetPart).Methods("POST")
    r.HandleFunc("/api/widgets/{slug}/parts/{id:[0-9]+}/update", apiUpdateWidgetPart).Methods("POST")
    r.HandleFunc("/api/widgets/{slug}/parts/{id:[0-9]+}/delete", apiDeleteWidgetPart).Methods("POST")
    r.HandleFunc("/{slug}", widgetGet).Methods("GET")
    r.HandleFunc("/{slug}/admin", widgetAdmin).Methods("GET")
    r.HandleFunc("/{slug}/image", widgetImage).Methods("POST")

    Serve = r
}
```

Again, the handlers are similar to Chi, but to get path parameters, you call `mux.Vars()`, which returns a map of all the parameters that you index by name (this strikes me as a bit "inefficient by design", but oh well). Here is the code for one of the handlers:

```go
func apiUpdateWidgetPart(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    slug := vars["slug"]
    id, _ := strconv.Atoi(vars["id"])
    fmt.Fprintf(w, "apiUpdateWidgetPart %s %d\n", slug, id)
}
```

[Full Gorilla code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/gorilla/route.go)


Pat
---

[Pat](https://github.com/bmizerany/pat) is interesting -- it's a minimalist, single-file router that supports methods and path parameters, but no regex matching. The route setup code looks similar to Chi and Gorilla:

```go
func init() {
    r := pat.New()

    r.Get("/", http.HandlerFunc(home))
    r.Get("/contact", http.HandlerFunc(contact))
    r.Get("/api/widgets", http.HandlerFunc(apiGetWidgets))
    r.Post("/api/widgets", http.HandlerFunc(apiCreateWidget))
    r.Post("/api/widgets/:slug", http.HandlerFunc(apiUpdateWidget))
    r.Post("/api/widgets/:slug/parts", http.HandlerFunc(apiCreateWidgetPart))
    r.Post("/api/widgets/:slug/parts/:id/update", http.HandlerFunc(apiUpdateWidgetPart))
    r.Post("/api/widgets/:slug/parts/:id/delete", http.HandlerFunc(apiDeleteWidgetPart))
    r.Get("/:slug", http.HandlerFunc(widgetGet))
    r.Get("/:slug/admin", http.HandlerFunc(widgetAdmin))
    r.Post("/:slug/image", http.HandlerFunc(widgetImage))

    Serve = r
}
```

One difference is that the `Get()` and `Post()` functions take an `http.Handler` instead of an `http.HandlerFunc`, which is generally a little more awkward, as you're usually dealing with functions, not types with a `ServeHTTP` method. You can easily convert them using `http.HandlerFunc(h)`, but it's just a bit more noisy. Here's what a handler looks like:

```go
func apiUpdateWidgetPart(w http.ResponseWriter, r *http.Request) {
    slug := r.URL.Query().Get(":slug")
    id, err := strconv.Atoi(r.URL.Query().Get(":id"))
    if err != nil {
        http.NotFound(w, r)
        return
    }
    fmt.Fprintf(w, "apiUpdateWidgetPart %s %d\n", slug, id)
}
```

One of the interesting things is that instead of using `context` to store path parameters (and a helper function to retrieve them), Pat stuffs them into the query parameters, prefixed with `:` (colon). It's a clever trick -- if slightly dirty.

Note that with Pat I am checking the error return value from `Atoi()`, as there's no regex in the route definitions to ensure an ID is all digits. Alternatively you could ignore the error, and just have the code return Not Found when it tries to look up a part with ID 0 in the database and finds that it doesn't exist (database IDs usually start from 1).

[Full Pat code on GitHub.](https://github.com/benhoyt/go-routing/blob/master/pat/route.go)


Benchmarks
----------

As I mentioned, I'm not concerned about speed in this comparison -- and you probably shouldn't be either. If you're really dealing at a scale where a few microseconds to route a URL is an issue for you, sure, use a fancy trie-based router like [httprouter](https://github.com/julienschmidt/httprouter), or write your own heavily-profiled code. All of the hand-rolled routers shown here work in linear time with respect to the number of routes involved.

But, just to show that none of these approaches *kill* performance, below is a simple benchmark that compares routing the URL `/api/widgets/foo/parts/1/update` with each of the eight routers ([code here](https://github.com/benhoyt/go-routing/blob/9a2fa7a643ecb5681f504b95064d948ee2177c9a/main_test.go#L106)). The numbers are "nanoseconds per operation", so lower is better. The "operation" includes doing the routing and calling the handler. The "noop" router is a router that actually doesn't route anything, so represents the overhead of the base case.

Router    | ns/op |
--------- | ----- |
pat       |  3646 |
gorilla   |  2642 |
retable   |  2014 |
reswitch  |  1970 |
shiftpath |  1607 |
chi       |  1370 |
match     |  1025 |
split     |   984 |
*noop*    | *583* |
--------- | ----- |

As you can see, Pat and Gorilla are slower than the others, showing that just because something is a well-known library doesn't mean it's heavily optimized. Chi is one of the fastest, and my custom pattern matcher and the plain `strings.Split()` method are the fastest.

But to hammer home the point: all of these are plenty good enough -- you should almost never choose a router based on performance. The figures here are in microseconds, so even Pat's 3646 nanoseconds is only adding 3.6 millionths of a second to the response time. Database lookup time in a typical web app is going to be around 1000 times that.


Conclusion
----------

Overall this has been an interesting experiment: I came up with a couple of new (for me, but surely not original) custom approaches to routing, as well as trying out Axel's "ShiftPath" approach, which I'd been intrigued about for a while.

If I were choosing one of the home-grown approaches, I think I would actually end up right back where I started (when I implemented my first server in Go a few years back) and choose the [regex table](#regex-table) approach. Regular expressions are quite heavy for this job, but they are well-understood and in the standard library, and the `Serve()` function is only 21 lines of code. Plus, I like the fact that the route definitions are all neatly in a table, one per line -- it makes them easy to scan and determine what URLs go where.

A close second (still considering the home-grown approaches) would be the [regex switch](#regex-switch). I like the scan-style behaviour of the `match()` helper, and it also is very small (22 lines). However, the route definitions are a little messier (two lines per route) and the handlers that take path parameters require type or closure boilerplate -- I think that storing the path parameters using context is a bit hacky, but it sure keeps signatures simple!

For myself, I would probably rule out the other custom approaches:

* My [split switch](#split-switch) approach. I like the fact that it just uses `strings.Split()`, but I find the `n == 3 && p[0] == "api" && p[1] == "widgets" && p[2] != ""` comparisons a bit ugly and error-prone.
* My [pattern matcher](#pattern-matcher) version. I enjoyed how simple it was to build a custom pattern matcher for this use case (and it's only 33 lines of code), but byte-by-byte string handling is a bit fiddly, and it doesn't gain enough over the regexp-based approaches (which are both more powerful and in the standard library).
* The [ShiftPath](#shiftpath) technique. I want to like this, but it's just too much boilerplate for even simple URL matching, and also, I much prefer my URL definitions in one place.

I disagree with Axel's assessment that third-party routing libraries make the routes hard to understand: all you typically have to know is whether they match in source order, or in order of most-specific first. I also disagree that having all your routes in one place (at least for a sub-component of your app) is a bad thing.

In terms of third-party libraries, I quite like the [Chi version](#chi). I'd seriously consider using it, especially if building a web app as part of a large team. Chi seems well thought out and well-tested, and I like the composability of the middleware it provides.

On the other hand, I'm all too aware of node-modules syndrome and the [left-pad fiasco](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/), and agree with [Russ Cox's take](https://research.swtch.com/deps) that dependencies should be used with caution. Developers shouldn't be scared of a little bit of code: writing a tiny customized regex router is fun to do, easy to understand, and easy to maintain.


{% include sponsor.html %}
