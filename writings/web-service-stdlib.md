---
layout: default
title: "Improving and fixing the code from the official Go RESTful API tutorial"
permalink: /writings/web-service-stdlib/
description: "My re-implementation of the code from the official Go tutorial 'Developing a RESTful API with Go and Gin', using only the standard library, adding tests, and fixing issues."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2021</p>


> Summary: This article describes my re-implementation of the code from the official Go tutorial "Developing a RESTful API with Go and Gin". My version adds a few features, fixes some issues, adds tests, and uses only the Go standard library.


Most of the Go [documentation](https://golang.org/doc/) and [tutorials](https://golang.org/doc/tutorial/) are really good: concise, accurate, and showing how to use Go's high-quality standard library. However, I recently read the [Tutorial: Developing a RESTful API with Go and Gin](https://golang.org/doc/tutorial/web-service-gin), and I think it could use improvement.

It's not terrible code, but there are several things that are non-ideal, and at least one bug: concurrent data races accessing the in-memory "database". There are other things that are questionable, such as mixing "database" code into the HTTP handlers, when a simple database `interface` could avoid that. I understand that they're trying to keep things simple for the tutorial, but I think we should be setting a better example in such code.

It also seems an odd choice to showcase a specific third party web library, rather than showing the power and composability of the standard library. The justification given is that "Gin simplifies many coding tasks associated with building web applications, including web services."

Fair enough, and I have nothing against [Gin](https://github.com/gin-gonic/gin) -- it looks like a good library -- but it's one of many Go web frameworks, so why promote a particular one in an official tutorial?

The tutorial was [reviewed](https://go-review.googlesource.com/c/website/+/332349) by Russ Cox, Go's technical lead, who usually does very thorough reviews. Oddly, especially given Russ's [stance on dependencies](https://research.swtch.com/deps), this one was approved with nary a comment, just a bare "+2" (the Go code review system's equivalent of <abbr title="Looks Good To Me">LGTM</abbr>).

In any case, I decided to rewrite the code using just the standard library, and fixed a bug and added some features at the same time -- features I think should be part of any "real" web service.


## Improvements

Here are things I found in the original code that I've changed or improved in my version (with links to the more detailed sections below):

* [Standard library.](#standard-library) As mentioned, the original version uses the Gin web framework. My version uses only standard library packages.
* [Validation.](#validation) The original doesn't do any validation of the "create new album" input (other than ensuring it's JSON), so it's easy to add an album with an empty ID, a negative price, and so on. I've changed it to do some basic validation, and return parseable validation errors to the client.
* [Unique album IDs.](#unique-album-ids) The existing code will happily add albums with duplicate IDs, and the `/albums/:id` endpoint returns the first one. This seems problematic: it should probably either use `PUT /albums/:id` to just update the album with the given ID, or still use `POST /albums` but return an error for duplicates -- I've opted for the latter approach.
* [Concurrency.](#concurrency) The global `albums` slice in the original code is read and written without locking, so the web service can't be accessed concurrently, and will panic if you try. I realize this is just an example, and a real database wouldn't have this problem, but it's pretty trivial to add a simple mutex lock to make this code safe. My version adds the lock as well as a test to ensure it's race-free.
* [Decimal currency.](#decimal-currency) The album's `Price` field is a `float64`. It's not good to use binary floating point for currency values, as binary floating point can't represent decimal fractions precisely, and doing math on them can introduce rounding errors. I've changed the `Price` field to integer cents ("fixed point").
* [JSON errors.](#json-errors) The Gin router's default Not Found error returns `Content-Type: text/plain`, so these errors return text instead of JSON. The explicit Not Found returned in `getAlbumByID` returns JSON, however. Similarly, Gin's `BindJSON` doesn't return a JSON error when it receives invalid input. My version returns all errors as JSON.
* [Method not found.](#method-not-found) Gin (at least by default) returns status 404 Not Found instead of 405 Method Not Allowed when the URL is valid but the method is not found. I've fixed this to return the standard 405 status in those cases.
* [Testing.](#testing) The original version has no tests. That's fine, as it's not the purpose of the tutorial. But testing HTTP handlers is quite easy with Go's [`httptest`](https://pkg.go.dev/net/http/httptest) library, and I've added tests for all the functionality, including error cases.
* [Database interface.](#database-interface) I've used an explicit interface for the database methods (which can returns defined errors such as `ErrDoesNotExist`), along with an [in-memory implementation](#database-implementation) similar to the one in the original.
* [Separation of concerns.](#separation-of-concerns) In the original the "database" code was intertwined with handler code. Partly as a consequence of using a database interface, in my version the database code is completely separate from the HTTP handler code, making it easier to test things like error handling or swap in a real database when that's needed.

My version is definitely more code (about 200 lines of code rather than 50, along with about 250 lines of test code), but that's mostly due to the additional features. I believe my version showcases code that is more robust and maintainable.

Let's look at each one of these points in a bit more depth.


## Standard library

Gin gives you URL routing (including URL parameters) and a couple of JSON marshaling functions. In my version I wrote some simple routing code and added a couple of custom JSON helpers.

Elsewhere I've written extensively about [different approaches to HTTP routing in Go](https://benhoyt.com/writings/go-routing/), but here the routes are very simple, so I've just used a simple `switch` statement, along with a single regular expression for the `/albums/:id` route. We don't even need the standard library's [`http.ServeMux`](https://pkg.go.dev/net/http#ServeMux) here.

The `/albums/:id` route would be fairly simple without a regular expression, but it's a bit simpler to handle the edge cases with a regex: testing that the ID is at least one character and has no slashes.

My code also handles HTTP methods, including proper 405 Method Not Found handling. Here's the full routing code:

```go
// Regex to match "/albums/:id" (id must be one or more non-slash chars).
var albumsIDRegexp = regexp.MustCompile(`^/albums/[^/]+$`)

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Path
    s.log.Printf("%s %s", r.Method, path)

    switch {
    case path == "/albums":
        switch r.Method {
        case "GET":
            s.getAlbums(w, r)
        case "POST":
            s.addAlbum(w, r)
        default:
            w.Header().Set("Allow", "GET, POST")
            jsonError(w, http.StatusMethodNotAllowed,
                ErrorMethodNotAllowed, nil)
        }

    case albumsIDRegexp.MatchString(path):
        switch r.Method {
        case "GET":
            id := path[len("/albums/"):]
            s.getAlbumByID(w, r, id)
        default:
            w.Header().Set("Allow", "GET")
            jsonError(w, http.StatusMethodNotAllowed,
                ErrorMethodNotAllowed, nil)
        }

    default:
        jsonError(w, http.StatusNotFound, ErrorNotFound, nil)
    }
}
```

A little verbose, but very clear and explicit, and avoids having to configure a third party router to return errors as JSON and correctly return 405s.

The other area where Gin shortened the code was with its `IndentedJSON` and `BindJSON` helpers, which marshal and unmarshal JSON, respectively. Thankfully, using JSON is very easy with just the standard [`encoding/json`](https://pkg.go.dev/encoding/json) package. I've written a couple of small helper functions to wrap this and perform error handling:

```go
// writeJSON marshals v to JSON and writes it to the response, handling
// errors as appropriate. It also sets the Content-Type header to
// "application/json".
func writeJSON(w http.ResponseWriter, status int, v interface{}) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    b, err := json.MarshalIndent(v, "", "    ")
    if err != nil {
        http.Error(w, `{"error":"`+ErrorInternal+`"}`,
            http.StatusInternalServerError)
        return
    }
    w.WriteHeader(status)
    w.Write(b)
}

// readJSON reads the request body and unmarshals it from JSON, handling
// errors as appropriate. It returns true on success; the caller should
// return from the handler early if it returns false.
func readJSON(w http.ResponseWriter, r *http.Request, v interface{})
        bool {
    b, err := io.ReadAll(r.Body)
    if err != nil {
        jsonError(w, http.StatusInternalServerError, ErrorInternal, nil)
        return false
    }
    err = json.Unmarshal(b, v)
    if err != nil {
        data := map[string]interface{}{"message": err.Error()}
        jsonError(w, http.StatusBadRequest, ErrorMalformedJSON, data)
        return false
    }
    return true
}
```

Note that I could have used [`json.Encoder`](https://pkg.go.dev/encoding/json#Encoder) to stream directly to the response. However, error handling is a bit tricky: if there's a JSON marshaling error and `Encoder.Encode` has already written something to the response, you can't return a non-200 HTTP status. In the `Album` case an error is unlikely (impossible?) because it's such a simple struct, but in the general case JSON encoding can return errors, so I'm marshaling the struct to a `[]byte` first.

Similarly, for unmarshaling you can use [`json.Decoder`](https://pkg.go.dev/encoding/json#Decoder) to read directly from the request body -- however, that is really [designed for streams](https://ahmet.im/blog/golang-json-decoder-pitfalls/).


## Validation

It's one of the first rules of web security, or any software for that matter, to always validate user input. Without validation, a user of the service could add an album with no ID, no title or artist name, or a negative (or impossibly huge) price.

I've added a few lines of validation code to the add-album endpoint, as well as a structured way to return validation errors so the client can display helpful error messages. Here's the full validation code:


```go
// Validate the input and build a map of validation issues
type validationIssue struct {
    Error   string `json:"error"`
    Message string `json:"message,omitempty"`
}
issues := make(map[string]interface{})
if album.ID == "" {
    issues["id"] = validationIssue{"required", ""}
}
if album.Title == "" {
    issues["title"] = validationIssue{"required", ""}
}
if album.Artist == "" {
    issues["artist"] = validationIssue{"required", ""}
}
if album.Price < 0 || album.Price >= 100000 {
    issues["price"] = validationIssue{
        "out-of-range", "price must be between 0 and $1000"}
}
if len(issues) > 0 {
    jsonError(w, http.StatusBadRequest, ErrorValidation, issues)
    return
}
```

In this case I've allowed a zero price, thinking zero would mean "no price", as in free or not applicable (a home catalogue, for example).

We don't need a framework with a domain-specific language, just simple `if` statements to check what we need to. We build up a map of issues (indexed by field name), and if there are any validation issues, return that in the JSON error to the caller. Here's what a validation error response looks like:

```
$ curl http://localhost:8080/albums -d '{"price":-1}' | jq
{
  "status": 400,
  "error": "validation",
  "data": {
    "artist": {
      "error": "required"
    },
    "id": {
      "error": "required"
    },
    "price": {
      "error": "out-of-range",
      "message": "price must be between 0 and $1000"
    },
    "title": {
      "error": "required"
    }
  }
}
```

For a larger web service, I'd probably standardize that a little bit more, and add a method `Validate() map[string]ValidationIssue` to structs as appropriate. Then again, sometimes you want different validation for the same struct in different contexts, so perhaps this keep-it-simple approach is just fine.


## Unique album IDs

As mentioned, the original code doesn't return an error if you add albums with duplicate IDs, for example:

```
$ curl http://localhost:8080/albums -d '{"id":"foo"}'
...
$ curl http://localhost:8080/albums -d '{"id":"foo"}'
...
$ curl http://localhost:8080/albums | jq
[
  ...
  {
    "id": "foo",
    "title": "",
    "artist": "",
    "price": 0
  },
  {
    "id": "foo",
    "title": "",
    "artist": "",
    "price": 0
  }
]
```

I've fixed this so the "database" rejects an ID that already exists. The `AddAlbum` database method returns `ErrAlreadyExists` in this case, and the handler code checks for that error and responds with 409 Conflict:

```go
// Database method:
func (d *MemoryDatabase) AddAlbum(album Album) error {
    d.lock.Lock()
    defer d.lock.Unlock()

    if _, ok := d.albums[album.ID]; ok {
        return ErrAlreadyExists
    }
    d.albums[album.ID] = album
    return nil
}

// Handler error checking:
func (s *Server) addAlbum(w http.ResponseWriter, r *http.Request) {
    // ... JSON parsing and validation ...

    err := s.db.AddAlbum(album)
    if errors.Is(err, ErrAlreadyExists) {
        jsonError(w, http.StatusConflict, ErrorAlreadyExists, nil)
        return
    } else if err != nil {
        jsonError(w, http.StatusInternalServerError, ErrorDatabase, nil)
        return
    }

    writeJSON(w, http.StatusCreated, album)
}
```


## Concurrency

The original code has a data race when you try to access the `GET` endpoints while someone else is `POST`ing an album. Obviously using an SQL database would solve this, as such databases have their own concurrent-safety. But it's not hard to add a mutex lock when accessing an in-memory structure.

In this case I'm using a [`sync.RWMutex`](https://pkg.go.dev/sync#RWMutex), as albums are almost certainly going to be viewed more often than they're added. So I added `RLock`/`RUnlock` calls around the reads, and `Lock`/`Unlock` around the writes.

Perhaps more interestingly, I added a test that fails under Go's [race detector](https://golang.org/doc/articles/race_detector) if you don't have the locking -- to see that, try commenting out the lock and unlock calls and run `go test -race`.

The test fires up a bunch of goroutines, with each one hitting all three endpoints, read and write:

```go
func TestConcurrentRequests(t *testing.T) {
    server := newTestServer()
    for i := 0; i < 100; i++ {
        go func(i int) {
            result := serve(t, server, newRequest(t, "GET", "/albums", nil))
            ensureStatus(t, result, http.StatusOK)

            albumID := "c" + strconv.Itoa(i)
            body := `{"id": "` + albumID + `", "title": "T", "artist": "A"}`
            result = serve(t, server, newRequest(t, "POST", "/albums", strings.NewReader(body)))
            ensureStatus(t, result, http.StatusCreated)

            result = serve(t, server, newRequest(t, "GET", "/albums/"+albumID, nil))
            ensureStatus(t, result, http.StatusOK)
        }(i)
    }
}
```


## Decimal currency

It's generally a [bad idea](https://stackoverflow.com/a/3730040/68707) to use binary floating point to store and manipulate currency values -- you can't store decimal fractions (cents) precisely, and errors accumulate as you operate on those values.

To fix this, I've changed the album's `Price` field from `float64` to `int`, so it can store integer cents precisely. This is one common way of accurately storing currency values. Another would be to use a decimal math library, such as [shopspring/decimal](https://github.com/shopspring/decimal).


## JSON errors

It's nicer for API clients when a web service always returns JSON, even for errors such as Not Found. That way the client can have a single code path that always decodes the response as JSON.

In my version I've made it always return errors as JSON, using a little `jsonError` helper function, which calls the `writeJSON` helper mentioned above:

```go
// jsonError writes a structured error as JSON to the response, with
// optional structured data in the "data" field.
func jsonError(w http.ResponseWriter, status int, error string,
        data map[string]interface{}) {
    response := struct {
        Status int                    `json:"status"`
        Error  string                 `json:"error"`
        Data   map[string]interface{} `json:"data,omitempty"`
    }{
        Status: status,
        Error:  error,
        Data:   data,
    }
    writeJSON(w, status, response)
}
```

Usually the "data" field is empty, but for Bad Request errors it's useful to give the caller a bit more information about what they did wrong (for example in the validation code [shown above](#validation)).

The `Error` field is one of several [defined constants](https://github.com/benhoyt/web-service-stdlib/blob/924c99697a1267c1ab0d5e6f03cd6f3c2cb14abe/main.go#L64-L72) for JSON error codes, such as `ErrorValidation`.


## Method not found

It's a very simple thing, but Gin (with the default configuration used by the tutorial code) returns status 404 Not Found instead of 405 Method Not Allowed when the URL is valid but the method is not found.

As shown in the [routing code](#standard-library), I've changed this to return an HTTP 405 status in those cases.


## Testing

I've added many tests of the server: these test all endpoints, as well as error behavior, validation issues, and so on.

Test coverage (via `go test -coverprofile`) [shows](/writings/web-service-stdlib-coverage.html) that I've tested all the code except the bare-bones `main` function and a hard-to-test part of the `writeJSON` error handling (which will never happen in practice). In general, I don't think aiming for 100% test coverage is a reasonable goal, but it was nice how easy it was here to cover so much.

The tests all follow the same basic pattern: create a test server, execute one or more requests against an [`httptest.ResponseRecorder`](https://pkg.go.dev/net/http/httptest#ResponseRecorder), and then ensure that the response is correct -- status code and JSON data.

I've implemented a few test helpers (marked with [`T.Helper`](https://pkg.go.dev/testing#T.Helper)) to create a new request, serve a single request, unmarshal the JSON response, and so on. These are only a few lines each, but help reduce boilerplate in the tests considerably.

Here's an example test, along with the `ensureStatus` helper:

```
func TestGetAlbums(t *testing.T) {
    server := newTestServer()
    result := serve(t, server, newRequest(t, "GET", "/albums", nil))
    ensureStatus(t, result, http.StatusOK)

    var got []testAlbum
    unmarshalResponse(t, result, &got)
    want := []testAlbum{
        {ID: "a1", Title: "9th Symphony", Artist: "Beethoven", Price: 795},
        {ID: "a2", Title: "Hey Jude", Artist: "The Beatles", Price: 2000},
    }
    if !reflect.DeepEqual(got, want) {
        t.Fatalf("bad response: got vs want:\n%#v\n%#v", got, want)
    }
}

func ensureStatus(t *testing.T, response *http.Response, want int) {
    t.Helper()
    if response.StatusCode != want {
        t.Fatalf("bad status code: got %d, want %d", response.StatusCode, want)
    }
}
```

Note that I haven't separately tested the `MemoryDatabase` implementation used by the server. Instead, its functionality is tested as part of the overall server tests. When it's possible, using an in-memory fake and avoiding the annoyances of recording "mock" calls is a simple, less brittle way to write tests.

A few other interesting things in these tests:

* An example of table-driven sub-tests: [`TestGetAlbum`](https://github.com/benhoyt/web-service-stdlib/blob/924c99697a1267c1ab0d5e6f03cd6f3c2cb14abe/main_test.go#L43).
* The concurrency test mentioned above: [`TestConcurrentRequests`](https://github.com/benhoyt/web-service-stdlib/blob/924c99697a1267c1ab0d5e6f03cd6f3c2cb14abe/main_test.go#L149).
* Tests that the handlers correctly return 500 Internal Server Error on database errors, using an `errorDatabase` mock: [`TestDatabaseErrors`](https://github.com/benhoyt/web-service-stdlib/blob/924c99697a1267c1ab0d5e6f03cd6f3c2cb14abe/main_test.go#L167).


## Database interface

Go interfaces are powerful and somewhat unique: you can implement a concrete type like a database struct with various access methods, and the implementation doesn't need to specify that it implements or inherits from anything. Just write code.

Then the thing that uses the database, in this case the `Server`, defines an interface with only the methods it needs (which may well be a subset of the implementation's methods). In our case this looks like so:

```go
// Server is the album HTTP server.
type Server struct {
    db  Database
    log *log.Logger
}

// Database is the interface used by the server to load and store albums.
type Database interface {
    // GetAlbums returns a copy of all albums, sorted by ID.
    GetAlbums() ([]Album, error)

    // GetAlbumsByID returns a single album by ID, or ErrDoesNotExist if
    // an album with that ID does not exist.
    GetAlbumByID(id string) (Album, error)

    // AddAlbum adds a single album, or ErrAlreadyExists if an album with
    // the given ID already exists.
    AddAlbum(album Album) error
}

var (
    ErrDoesNotExist  = errors.New("does not exist")
    ErrAlreadyExists = errors.New("already exists")
)
```

As you can see, `Server` has a `Database`, which might be in-memory like the `MemoryDatabase` implementation I define, it might be on disk, or it might use an external SQL database. Or it might be an `errorDatabase` like we used in `TestDatabaseErrors` that always returns errors, to test our database error handling.

There's a bit of API design that goes into defining a good interface. I started without the `error` return values, and the `AddAlbum` function returned a "did we actually add it?" boolean. However, real databases will need to return errors, so we might as well start with good error handling up front.

Note how the doc comments for `GetAlbumByID` and `AddAlbum` describe the special error values returned if an album doesn't exist (or already exists). This allows the handler to test for this error value (using `==` or [`errors.Is`](https://pkg.go.dev/errors#Is)) and return an appropriate HTTP status code to the caller.

In a larger project, `Server` and `Database` would likely be defined in a `server` package, and `MemoryDatabase` would likely be defined in a separate `testdb` package. For simplicity (this project is only a few hundred lines of code), I've kept everything in a single `main.go` file. A good rule of thumb in Go is: only split things into packages if and when you need to.


## Database implementation

For my database implementation, I'm still using a simple in-memory database like the original tutorial. However, it's now implemented using a struct (to fulfill the above `Database` interface), and I've added the locking to fix those concurrency issues. Here it is in full:

```go
// MemoryDatabase is a Database implementation that uses a simple
// in-memory map to store the albums.
type MemoryDatabase struct {
    lock   sync.RWMutex
    albums map[string]Album
}

// NewMemoryDatabase creates a new in-memory database.
func NewMemoryDatabase() *MemoryDatabase {
    return &MemoryDatabase{albums: make(map[string]Album)}
}

func (d *MemoryDatabase) GetAlbums() ([]Album, error) {
    d.lock.RLock()
    defer d.lock.RUnlock()

    // Make a copy of the albums map (as a slice)
    albums := make([]Album, 0, len(d.albums))
    for _, album := range d.albums {
        albums = append(albums, album)
    }

    // Sort by ID so we return them in a defined order
    sort.Slice(albums, func(i, j int) bool {
        return albums[i].ID < albums[j].ID
    })
    return albums, nil
}

func (d *MemoryDatabase) GetAlbumByID(id string) (Album, error) {
    d.lock.RLock()
    defer d.lock.RUnlock()

    album, ok := d.albums[id]
    if !ok {
        return Album{}, ErrDoesNotExist
    }
    return album, nil
}

func (d *MemoryDatabase) AddAlbum(album Album) error {
    d.lock.Lock()
    defer d.lock.Unlock()

    if _, ok := d.albums[album.ID]; ok {
        return ErrAlreadyExists
    }
    d.albums[album.ID] = album
    return nil
}
```

Apart from the mutex, the only significant difference from the original approach is using a map indexed by ID instead of a slice to store the albums. This allows constant time lookups by ID.

However, because Go maps don't have a defined iteration order, I've made `GetAlbums` sort by ID to ensure it returns the albums in a consistent order. The original code (perhaps accidentally?) returned them in oldest to newest order. If using a real database, you'd probably use an `ORDER BY` clause to order them by some user-relevant criteria, such as title.


## Separation of concerns

This falls fairly naturally out of the database interface: in the original code, HTTP handler code like JSON marshaling was mixed in with database code. The database interface forces a separation of concerns, making it easier to test the database error handling. It would also make it straightforward to swap in a real database when the time comes -- just add an `SQLDatabase` struct and implement its methods in terms of SQL queries.


## Conclusion

It was a fun exercise to rewrite and try to improve this code, and I hope you've enjoyed it or learned something. I certainly hope it's more robust and maintainable, and it avoids the hassles that come with learning and updating third party dependencies.

<!--
Instead of just critiquing the tutorial article, I've also [started a thread](TODO) on golang-dev, the Go development mailing list, asking if any of these suggestions could be incorporated into the original.
-->

Please let me know if you have any feedback, or suggestions to improve my code!
