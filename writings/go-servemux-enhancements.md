---
layout: default
title: "The proposal to enhance Go's HTTP router"
permalink: /writings/go-servemux-enhancements/
description: "A brief look at the proposed enhancements to the Go standard library HTTP request router, net/http.ServeMux: matching on HTTP method, and supporting wildcards in matched paths."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">July 2023</p>


Go's standard library has always included a solid, production-quality HTTP server. However, the built-in request router, [`http.ServeMux`](https://pkg.go.dev/net/http#ServeMux), is so minimalist that you often need to write your own routing code.

In particular, it doesn't support matching on the HTTP method (to distinguish `GET` and `POST`, for example), and it doesn't have support for wildcard paths such as `/users/{user}/settings`. Both of those features are needed by almost all REST-like API servers.

You can do those things yourself, of course. I've written before about [different approaches to HTTP routing in Go](https://benhoyt.com/writings/go-routing/): there are several good third party packages that do more advanced routing, and it only takes [30 or so lines of code](https://github.com/benhoyt/go-routing/blob/9a2fa7a643ecb5681f504b95064d948ee2177c9a/retable/route.go#L28-L65) to add similar functionality without any third party library.

But it's likely that the workarounds and third party packages might not be needed for long. There's an [active proposal](https://github.com/golang/go/issues/61410) -- including a [reference implementation](https://github.com/jba/muxpatterns) -- to enhance `ServeMux` to match HTTP methods and wildcard paths.

The proposal, as well as the prior [discussion](https://github.com/golang/go/discussions/60227), is headed by Jonathan Amsterdam of Google's Go team. Jonathan was responsible for the successful [proposal to add structured logging](https://go.googlesource.com/proposal/+/master/design/56345-structured-logging.md) to the standard library -- his [`log/slog`](https://pkg.go.dev/log/slog) package will be included in Go 1.21 (due out in August 2023).


## What it looks like

Currently, if you want to match `GET` requests to `/users/{user}/settings`, you have to write a bunch of boilerplate like this (though in practice you'd probably end up using a third party library):

```go
mux.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    remainder := r.URL.Path[len("/users/"):]
    userId, subPath, _ := strings.Cut(remainder, "/")
    switch subPath {
    case "settings":
        fmt.Fprintf(w, "user %s", userId)
    // cases for other sub-paths could go here
    default:
        http.NotFound(w, r)
    }
})
```

If the proposal is accepted, you'll be able to write this:

```go
mux.HandleFunc("GET /users/{user}/settings", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "user %s", r.PathValue("user"))
})
```

Much nicer!

It's also very similar to the syntax used by other popular routers:

```go
// github.com/go-chi/chi
router.Get("/users/{user}/settings", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "user %s", chi.URLParam(r, "slug"))
})

// github.com/gorilla/mux
router.HandleFunc("/users/{user}/settings", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "user %s", mux.Vars(r)["user"])
}).Methods("GET")

// github.com/bmizerany/pat
router.Get("/users/:user/settings", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "user %s", r.URL.Query().Get(":user"))
}))

// github.com/gin-gonic/gin
router.GET("/users/:user/settings", func(c *gin.Context) {
    fmt.Fprintf(w, "user %s", c.Param("user"))
})
```

One of the interesting decisions with this proposal is that they're not adding a new method to `ServeMux`; they're extending the existing [`Handle`](https://pkg.go.dev/net/http#ServeMux.Handle) and [`HandleFunc`](https://pkg.go.dev/net/http#ServeMux.HandleFunc) methods to allow a method prefix and `{wildcard}` path segments.

I understand the desire to avoid adding new methods, but I'm [not sure](https://github.com/golang/go/issues/61410#issuecomment-1641072070) about this decision. Unfortunately, old versions of `ServeMux` accept patterns like `Handle("GET /foo", h)`. This would mean code written for the enhanced `ServeMux` would compile and appear to run fine on older versions of Go, but of course the routes wouldn't match anything -- a bit error-prone. I probably would have added new methods instead, like `HandleMatch` / `HandleMatchFunc` or `Route` / `RouteFunc`.

The proposal also has a lengthy description of how it handles precedence when two patterns overlap, but it boils down to a simple rule: "if two patterns overlap (have some requests in common), then the more specific pattern takes precedence".

For example, if you register the pattern `/users/` (which matches `/users/*`) as well as the pattern `/users/{user}`, when a request for `/users/ben` comes in, it matches the second, more-specific pattern. This is similar to how, in the existing `ServeMux`, host-specific patterns win over patterns without a hostname.


## The match-end-of-URL wildcard

The proposal also adds `{$}` as a "special wildcard" that matches only the end of the URL. This will mostly be useful for a route that you want to only match the homepage. This is surprisingly annoying to do right now, because a pattern that ends in `/` matches everything under `/` as well; this also applies to a pattern that is `/` alone.

So currently, to match only the home page you have to do this:

```go
mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/" { // ensure path is exactly "/"
        http.NotFound(w, r)
        return
    }
    serveHomepage(w, r)
})
mux.HandleFunc("/users", serveUsers)
```

This is tedious, and if you forget the path check, you'll end up serving the home page for all other URLs instead of a not-found page, because everything is under `/`.

Under the new proposal, that will become much simpler:

```go
mux.HandleFunc("/{$}", serveHomepage)
mux.HandleFunc("/users", serveUsers)
```

## Reference implementation

Jonathan has written a sample implementation of the enhanced `ServeMux` in the [github.com/jba/muxpatterns](https://github.com/jba/muxpatterns) package. The only difference is that, because it's in a separate package, he can't change the `http.Request` type, so you fetch path values using `mux.PathValue(request, "name")` instead of `request.PathValue("name")`.

I've added a [PR on my go-routing repo](https://github.com/benhoyt/go-routing/pull/4) that adds a version of my widget API [using `muxpatterns`](https://github.com/benhoyt/go-routing/pull/4/files#diff-3470266d50a8b754dc836bad946bfc4616d83a7dc6c90b869993a90525a3d376R25-R35). It's very similar to [chi version](https://github.com/benhoyt/go-routing/blob/9a2fa7a643ecb5681f504b95064d948ee2177c9a/chi/route.go#L18-L28) -- simple and readable:

```go
r.HandleFunc("GET /{$}", home)
r.HandleFunc("GET /contact", contact)
r.HandleFunc("GET /api/widgets", apiGetWidgets)
r.HandleFunc("POST /api/widgets", apiCreateWidget)
r.HandleFunc("POST /api/widgets/{slug}", apiUpdateWidget)
r.HandleFunc("POST /api/widgets/{slug}/parts", apiCreateWidgetPart)
r.HandleFunc("POST /api/widgets/{slug}/parts/{id}/update", apiUpdateWidgetPart)
r.HandleFunc("POST /api/widgets/{slug}/parts/{id}/delete", apiDeleteWidgetPart)
r.HandleFunc("GET /{slug}", widgetGet)
r.HandleFunc("GET /{slug}/admin", widgetAdmin)
r.HandleFunc("POST /{slug}/image", widgetImage)
```

I actually found a [couple of minor bugs](https://github.com/jba/muxpatterns/issues/1) in the reference implementation when I first tested it, but they've already been fixed.


## Conclusion

Despite having reservations about extending the existing `Handle` and `HandleFunc` methods, I'm very happy this is being considered. Given the care Jonathan put into the proposal, his track record with `log/slog`, and the positive response from the community, it seems likely the proposal will be accepted.

It would be great to have this in the standard library -- almost every website and REST-like API I've developed has needed this functionality. You can already do a lot with the Go standard library, but this will eliminate the need for third party routers almost entirely.

I wouldn't be surprised if this lands in Go 1.22, due out in February 2024. But we'll see!


{% include sponsor.html %}
