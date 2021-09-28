---
layout: default
title: "Simple Lists: a tiny to-do list app written the old-school way (server-side Go, no JS)"
permalink: /writings/simple-lists/
description: "TODO"
---
<h1>{{ page.title }}</h1>
<p class="subtitle">September 2021</p>

<!-- TODO:
* run Heroku version on branch with red warning banner: "this is a demo. lists may be deleted every few hours"
-->


> Summary: This article describes why and how I wrote Simple Lists, a tiny to-do list web app written in Go. It's built in the old-school way: HTML rendered by the server, plain old `GET` and `POST` with HTML forms, and no JavaScript.
>
> **Go to:** [Features](TODO) \| [No JS](TODO) \| [Go](TODO) \| [Routing](TODO) \| [DB](TODO) \| [Testing](TODO) \| [HTML/CSS](TODO) \| [Security](TODO) \| [Conclusion](TODO)


I've been wanting to do a little side project again: creating and coding, just for the joy of it. And I wanted to create something that might be useful for myself or my family, so I made a little to-do list app. I know there are thousands of to-do list apps out there, but I just like building stuff, especially things that fit with the principles of the [small web](/writings/the-small-web-is-beautiful/).

To jump straight in, you can try a [**live demo**](https://go-simplelists.herokuapp.com/) (thanks to Heroku's free tier). Please don't use this for any real lists -- it's just a demo, and **demo lists will be deleted** regularly.

If you have [Go installed](https://golang.org/doc/install), you can also run the app locally very easily (it will take a few seconds the first time to download and build):

```
$ git clone https://github.com/benhoyt/simplelists.git
Cloning into 'simplelists'...
...
$ cd simplelists
$ go run .
2021/09/28 20:51:14 listening on http://localhost:8080
```

See the [source code](https://github.com/benhoyt/simplelists), which we'll describe further below. Let's dive in!


## Features

<img src="/images/simple-lists.png" alt="Screenshot of Simple Lists" title="Screenshot of Simple Lists" class="right">

The feature list for Simple Lists is not very long:

* You can create new lists. Each list has a random ID in the URL, so they're semi-private: you can only go to a list if you know its URL.
* You can add items to a list.
* You can cross items off (and undo a cross-off).
* You can delete items from a list.
* Works fine on a phone.
* Safe against [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) (XSS) and [cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) (CSRF).

Optional features (I use these for my personal instance):

* If you run the server with the `-lists` flag, it shows a list of lists on the homepage, and allows you to delete lists.
* If you run the server with the `-username` flag, you have to sign in with the username and password to access the site. (It's for my personal use, so there's only one user.)

To keep it simple, here's what it doesn't do:

* You can't reorder items in a list.
* You can't edit items. Just delete and re-add.
* No fancy colors, images, or styling.

Like I said, *Simple* Lists. But it works for me!


## No JS (not Node JS!)

I actually started out using a sprinkling of client-side JavaScript, in an attempt to make things a bit slicker. But apart from the fact that I like programming in Go better than in JavaScript, I realized I don't need client-side scripting at all -- just make it small and fast, and a few page reloads aren't a problem.

So I removed the little bit of JavaScript I did have, and just used the HTTP `POST` method with plain old HTML forms for modifying the state of your to-do list database. The beauty of this is you're just using Go, with a bit of HTML thrown in. There's zero lines of JavaScript, and you don't need fancy build tools like Babel or Webpack.

For those of you that have only used client-side JavaScript for interactivity, let's have a quick look at how this works.

For each list item (inside a `<ul>` unordered list), we use the following HTML:

```html
<li style="margin: 0.7em 0">
 <form style="display: inline;" action="/update-done"
       method="POST" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="csrf-token" value="{% raw %}{{ $.Token }}{% endraw %}">
  <input type="hidden" name="list-id" value="{% raw %}{{ $.List.ID }}{% endraw %}">
  <input type="hidden" name="item-id" value="{% raw %}{{ .ID }}{% endraw %}">
  <input type="hidden" name="done" value="on">
  <button id="done-{% raw %}{{ .ID }}{% endraw %}" style="width: 1.7em">&nbsp;</button>
  <label for="done-{% raw %}{{ .ID }}{% endraw %}">{% raw %}{{ .Description }}{% endraw %}</label>
 </form>
 <form style="display: inline;" action="/delete-item"
       method="POST" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="csrf-token" value="{% raw %}{{ $.Token }}{% endraw %}">
  <input type="hidden" name="list-id" value="{% raw %}{{ $.List.ID }}{% endraw %}">
  <input type="hidden" name="item-id" value="{% raw %}{{ .ID }}{% endraw %}">
  <button style="padding: 0 0.5em; border: none; background: none;
                 color: #ccc" title="Delete Item">✕</button>
 </form>
</li>
```

It looks like there's a fair bit going on here, but it's not difficult. For each item, there are two forms -- one for updating an item's "done" flag (to cross it off), and one for deleting the item.

HTML forms don't need to be UI-heavy things with text input and file upload fields, they can be just a couple of hidden data fields with a button. As shown in the delete-item form, the button can be styled -- in this case to look like a nice ✕ icon.

With the first form, you'll notice the use of an `id` attribute on the button. This is linked to the `<label>` via its `for` attribute, so the item's description text acts as a label for the "cross it off" button -- you can click or tap anywhere on the list item's label and the browser will click the button for you, crossing the item off the list. Browsers can do a lot without JavaScript!


## Yes to Go

I'm regularly impressed by how well thought out the Go standard library is, especially compared to Python (the other language I know well). The only dependencies the server uses are the SQLite database driver and the not-quite-stdlib [golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto) package for a couple of bcrypt password hashing functions.

In some of my other projects, I use the popular [mattn/go-sqlite3](https://github.com/mattn/go-sqlite3) SQLite database driver. However, for this one I wanted to try the [modernc.org/sqlite](https://pkg.go.dev/modernc.org/sqlite) driver. It's quite a feat of engineering: a pure Go port of SQLite (no CGo bindings), done by transpiling the C source code of SQLite to Go. The generated Go is of course horrible to look at, but it works well, and avoids the need for a C compiler.

I tried to write the Go code in an idiomatic way. For example, I used error returns everywhere, even when it was tempting to panic (like in the database code: surely these in-process SQLite queries should only fail if I've messed up the query?).

I still don't love the verbosity of Go's error handling, particularly in HTTP request handlers, where the `return` is on its own line. One line of code, four lines of error handling. It doesn't make the code difficult to understand, just adds a bit of noise. For example, compare [this code in server.go](https://github.com/benhoyt/simplelists/blob/c4189585c48d2b3c6eb82c39d5265aa6f38c4628/server.go#L228-L236):

```go
list, err := s.model.GetList(id)
if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
}
if list == nil {
    http.NotFound(w, r)
    return
}
```

In Python, the error would simply raise an exception that your web framework would catch (and return the Internal Server Error), and the not-found check would be a bit more succinct, something like this:

```python
lst = self.model.get_list(list_id)
if lst is None:
    raise HTTPStatus(NotFound)
```

You *could* achieve this in Go using panics, but it's well outside the idiomatic zone. Go just isn't very terse, and the sooner one stops worrying about that, the better.

TODO: link to .go files, mention that Server and SQLModel could be in their own packages, but just made them flat for simplicity.


## Simple `ServeMux` routing

I've written extensively about [different approaches to HTTP routing in Go](/writings/go-routing/), and I was all set to use the regex table approach, or perhaps the [chi](https://github.com/go-chi/chi) router.

However, because I was creating a web app from scratch, I had complete control over the URL structure, so I decided to simplify. I'm so used to REST-like URL structures that this felt weird -- but pragmatically, why is `DELETE /lists/{list-id}/items/{item-id}` any better than `POST /delete-item` with the list and item IDs in the body? And if you're not using JavaScript, why do you need a JSON-based API?

Once I'd decided this, I was able to use Go's simple, built-in [`http.ServeMux`](https://pkg.go.dev/net/http#ServeMux) type to route the URLs. I simplified and reduced dependencies by designing the problem away.

The only slightly weird thing about `ServeMux` is that the root pattern `/`, like all patterns that end in a slash, matches `/` as well as everything under it. So you need to check for that explicitly. Here's the full routing code for the app:

```go
mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" { // because "/" pattern matches /*
        s.home(w, r)
    } else {
        http.NotFound(w, r)
    }
})
mux.HandleFunc("/sign-in", csrf(s.signIn))
mux.HandleFunc("/sign-out", s.signedIn(csrf(s.signOut)))
mux.HandleFunc("/lists/", s.signedIn(s.showList))
mux.HandleFunc("/create-list", s.signedIn(csrf(s.createList)))
mux.HandleFunc("/delete-list", s.signedIn(csrf(s.deleteList)))
mux.HandleFunc("/add-item", s.signedIn(csrf(s.addItem)))
mux.HandleFunc("/update-done", s.signedIn(csrf(s.updateDone)))
mux.HandleFunc("/delete-item", s.signedIn(csrf(s.deleteItem)))
```

The `signedIn` function is a middleware wrapper that adds username/password authentication. By default (and on the demo site) username authentication is turned off and `isSignedIn` always returns true:

````go
func (s *Server) signedIn(h http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if !s.isSignedIn(r) {
            location := "/?return-url=" + url.QueryEscape(r.URL.Path)
            http.Redirect(w, r, location, http.StatusFound)
            return
        }
        h(w, r)
    }
}
```

The `csrf` function is a middleware wrapper that add protection from cross-site request forgery. It wraps the given handler, ensuring that the HTTP method is `POST` and that the CSRF token in the "csrf-token" cookie matches the token in the "csrf-token" form field. This ensures that the form actions can only be submitted from a page on Simple Lists itself:

```go
func csrf(h http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != "POST" {
            w.Header().Set("Allow", "POST")
            http.Error(w, "405 method not allowed",
                http.StatusMethodNotAllowed)
            return
        }
        token := r.FormValue("csrf-token")
        cookie, err := r.Cookie("csrf-token")
        if err != nil || token != cookie.Value {
            http.Error(w, "invalid CSRF token or cookie",
                http.StatusBadRequest)
            return
        }
        h(w, r)
    }
}
```


## Database handling

The choice of database was a no-brainer. I've long admired SQLite, and for a project of this size it just made sense. The only alternative I'd consider for a larger project would be PostgreSQL, because I trust it and really like it (it's fast, well-documented, and has excellent features like JSON support).

Model interface: note that in this case don't need it, but it's a good pattern for unit testing and it doesn't add much weight. TODO

ORMs, sqlx, plain database/sql


## Testing

TODO: write end-to-end tests? also one test with db mocked out just to show how that's done?


## Minimal HTML and CSS

I've used Go's [html/template](https://pkg.go.dev/html/template) package for HTML templating. It's a bit quirky, but once you've read the documentation (the bulk of the templating documentation is actually in [text/template](https://pkg.go.dev/text/template)), it's not bad.

The HTML is very simple: there are only two pages, which I've done in two separate templates. The `html/template` package has support for "blocks", which allow template reuse, but it's simpler just to have a bit of repetition between the two templates.

See the [full template source](https://github.com/benhoyt/simplelists/blob/master/templates.go). Note the `meta` viewport tag, which makes the layout work nicely on mobile phones -- it's "fully responsive"!

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

The HTML uses a small amount of CSS to style the list elements and buttons. For this size app, I find it easiest just to use inline CSS, for example, to remove the border and set the colour of the delete-item button (and note the use of the Unicode `✕` for the button label -- who needs icons!):

```html
<button style="padding: 0 0.5em; border: none; background: none;
               color: #ccc" title="Delete Item">✕</button>
```

If you were creating a larger app, you'd probably want to use CSS classes to make it easier to reuse these styles and define them all in one place.


## Security

First, this app has not had a security review, and I don't promise anything here. It's [not good practice](https://security.stackexchange.com/questions/9455/is-it-safe-to-store-the-password-hash-in-a-cookie-and-use-it-for-remember-me-l) to store the hashed password directly in a cookie. However, the authentication is just for my personal site (which I run over HTTPS), and I'm not storing anything hugely sensitive there, so it's good enough for my purposes.

* TODO: mention sign-in out, bcrypt, etc
* TODO: CSRF protection
