---
layout: default
title: Different approaches to HTTP routing in Go
permalink: /writings/go-routing/
description: "TODO"
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2020</p>


There are many ways to do HTTP path routing in Go (for better or worse). There's the standard library's [`http.ServeMux`](https://golang.org/pkg/net/http/#ServeMux), but it only supports basic prefix matching. There are many ways to do more advanced routing yourself, including Axel Wagner's interesting but verbose [`ShiftPath` technique](https://blog.merovius.de/2017/06/18/how-not-to-use-an-http-router.html). And then of course there are lots of [third party router libraries](https://github.com/julienschmidt/go-http-routing-benchmark#tested-routers--frameworks). In this article I'm going to do a comparison of several custom techniques and some off-the-shelf packages.

I'll be upfront about my biases: I like simple and clear code, but I'm also a bit allergic to large dependencies (and sometimes those are in tension). Most libraries with "framework" in the title don't do it for me, though I don't mind using well-written libraries that do one or two things well.

My goal here is to route the same 11 URLs with eight different ways of doing routing. These URLs are based on a subset of URLs in a web application I maintain. They use `GET` and `POST`, but they're not particularly well designed -- the kind of messiness you find in real-world systems. Here are the methods and URLs:

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

The `:slug` is a URL-friendly widget identifier like `foo-bar`, and the `:id` is a positive integer ID like `1234`. Each routing approach should match on the exact URL -- trailing slashes will return 404 Not Found (redirecting them is also a fine decision, but I'm not doing that here). Each router should handle the specified method (`GET` or `POST`) and reject the others with a 405 Method Not Allowed response. I wrote some [table-driven tests](https://github.com/benhoyt/go-routing/blob/master/main_test.go) to ensure that all the routers do the right thing.

In the rest of this article I'll present code for the various approaches and discuss the pros and cons of each. You can use these links to skip down to a particular technique. First, the five custom techniques:

* [Regex table](#regex-table): loop through pre-compiled regexes and pass matches via the request context
* [Regex switch](#regex-switch): a switch statement in conjuction with a regex-based `match()` helper
* [Pattern matcher](#pattern-matcher): similar to the above, but using a simple pattern matching function instead of regexes
* [Split switch](#split-switch): split the path on `/` and then switch on the path segments
* [ShiftPath](#shiftpath): Axel Wagner's `ShiftPath` technique

And three versions using third-party router packages:

* [Chi](#chi): uses `github.com/go-chi/chi`
* [Gorilla](#gorilla): uses `github.com/gorilla/mux`
* [Pat](#pat): uses `github.com/bmizerany/pat`

I also tried [julienschmidt/httprouter](https://github.com/julienschmidt/httprouter), which is supposed to be really fast, but it [can't handle](https://github.com/julienschmidt/httprouter/issues/73) URLs with overlapping prefixes like `/contact` and `/:slug`. Arguably this is bad URL design, but a lot of real-world web apps do it, so I think this is quite limiting.

In this comparison I'm not particularly concerned about speed. Most of the approaches loop or `switch` through a list of routes (in contrast to fancy trie-lookup approaches). All of these approaches only add a few *microseconds* to the request time (see [benchmarks](#benchmarks)), and that isn't an issue in any of the web applications I've worked on.


Regex table
-----------

The first approach I want to look at is the approach I use in the current version of my web application -- it's the first thing that came to mind when I was learning Go a few years ago, and I still don't think it's a bad approach.

It's basically a table of pre-compiled [`regexp`](https://golang.org/pkg/regexp/) objects with a little 21-line routing function that loops through them, and calls the first one that matches both the path and HTTP method. Here's the code:

```go
var routes = []route{
    newRoute("GET", "/", home),
    newRoute("GET", "/contact", contact),
    newRoute("GET", "/api/widgets", apiGetWidgets),
    newRoute("POST", "/api/widgets", apiCreateWidget),
    newRoute("POST", "/api/widgets/([^/]+)", apiUpdateWidget),
    newRoute("POST", "/api/widgets/([^/]+)/parts", apiCreateWidgetPart),
    newRoute("POST", "/api/widgets/([^/]+)/parts/([0-9]+)/update",
        apiUpdateWidgetPart),
    newRoute("POST", "/api/widgets/([^/]+)/parts/([0-9]+)/delete",
        apiDeleteWidgetPart),
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
        http.Error(w, "405 method not allowed",
            http.StatusMethodNotAllowed)
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

Note that no error checking is needed on the `Atoi` call, because the regex for the ID parameter only matches digits: `[0-9]+`. Though there's still no guarantee the object exists in the database -- that still needs to be done in the handler.

An alterative to passing the fields using context is to make each `route.handler` a function that takes the fields as a `[]string` and returns an `http.HandleFunc` closure that closes over the `fields` parameter. The `Serve` function would then instantiate and call the closure as follows:

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

There's nothing particularly clever about the regex table approach, and it's similar to how a number of the third-party packages work. But it's so simple it only takes a few lines of code and a few minutes to write, so I don't think it's worth pulling in an external router package. It's also easy to modify if you need to: for example, to add logging, change the error responses to JSON, etc.


Regex switch
------------

The second approach still uses regexes, but uses a simple imperative `switch` statement with a `match` helper function to go through the matches. The advantage of this approach is that you can call other functions or test other things in each case. Also, the signature of the `match` function allows you to "scan" path parameters into pointer variables in order to pass them to the handlers more directly. Here's the code:

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

// match reports whether path matches ^regex$, and if it matches,
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

I must admit to being quite fond of this approach. I like how simple and direct it is, and how the scan-like behavior for path parameters is simple to understand. The scanning inside `match` detects the type, and converts from string to integer if needed. It only supports `string` and `int` right now, which is probably all you need for most routes, but it'd be easy to add more types if you need to. 

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

Note the `get` and `post` helper functions, which are essentially simple middleware that check the request method as follows:

```go
// allowMethod takes a HandlerFunc and wraps it in a handler that only
// responds if the request method is one of the given methods, otherwise
// it responds with HTTP 405 Method Not Allowed.
func allowMethod(h http.HandlerFunc, methods ...string) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        for _, m := range methods {
            if m == r.Method {
                h(w, r)
                return
            }
        }
        w.Header().Set("Allow", strings.Join(methods, ", "))
        http.Error(w, "405 method not allowed",
            http.StatusMethodNotAllowed)
    }
}

// get takes a HandlerFunc and wraps it to only allow the GET method
func get(h http.HandlerFunc) http.HandlerFunc {
    return allowMethod(h, http.MethodGet, http.MethodHead)
}

// post takes a HandlerFunc and wraps it to only allow the POST method
func post(h http.HandlerFunc) http.HandlerFunc {
    return allowMethod(h, http.MethodPost)
}
```

One of the slightly awkward things is how it works for paths that handle more than one method. There are probably different ways to do it, but I currently test the method explicitly in the first route (the `get` wrapper is not strictly necessary here, but I've included it for consistency):

```go
    case match(p, "/api/widgets") && r.Method == "GET":
        h = get(apiGetWidgets)
    case match(p, "/api/widgets"):
        h = post(apiCreateWidget)
```

At first I included the HTTP method matching in the `match` helper, but that makes it more difficult to return 405 Method Not Allowed responses properly.

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

Overall, despite liking the clarity of this approach and the scan-like `match` helper, a point against it is the messiness required to cache the regex compilation.


Pattern matcher
---------------

This approach is very similar to the regex switch method, but instead of regexes it uses a simple, custom pattern matching function.

The patterns supplied to the custom `match` function handle one wildcard character, `+`, which matches (and captures) any characters till the next `/` in the request path. This is of course much less powerful than regex matching, but generally I've not needed anything more than "match till next slash" in my routes. Here is what the routes and match code look like:

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
                if err != nil {
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

Other than that, the `get` and `post` helpers, as well as the handlers themselves, are identical to the regex switch method. I quite like this method (and it's quite efficient), but the byte-by-byte matching code was a little fiddly to write -- definitely not as simple as calling `regex.FindStringSubmatch`.


Benchmarks
----------

TODO: note this isn't my focus, and probably shouldn't be yours either -- these are all fast!

TODO: acknowledge most of the hand-rolled routers are linear in the number of routes
