---
layout: default
title: Learning Elm by porting a medium-sized web frontend from React
permalink: /writings/learning-elm/
description: How I learnt Elm (its good parts and bad) by porting a medium-sized web frontend from React.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">October 2019</p>


> Summary: To learn Elm, I ported the frontend of a small site I run from React to Elm 0.19, and had a fun and mind-expanding time doing it.
>
> **Go to:** [A taste of Elm](#a-taste-of-elm) \| [The port](#the-port) \| [Some numbers](#some-numbers) \| [What I loved](#what-i-loved-about-elm) \| [What could be improved](#what-could-be-improved)


I learn by doing. I learnt Go in a similar way -- by porting the backend of my [wedding gift registry](https://giftyweddings.com/) website from Python to Go. But it was time to learn something new on the frontend: a colleague of mine is passionate about [Elm](https://elm-lang.org), and his enthusiasm as well as the selling points on the Elm homepage and guide got me very interested.

Elm is a programming language for building web apps. So far so good. But it's also a statically typed functional programming language, and a pure functional one at that.

That was almost enough to turn me off, actually. I'd spent some time with Scala a couple of years ago, and really disliked it. The compiler is very slow, the language is complex and the learning curve steep, and people seemed to love writing indecipherable DSLs using operator overloading (ah, the punctuation!).

So Elm is functional, but it's also easy to get started with. The [official guide](https://guide.elm-lang.org) is a nice way in, there isn't punctuation everywhere, and the compiler is fast and provides helpful error messages.


A taste of Elm
--------------

The promise of Elm is "no runtime exceptions" and "safe refactoring". It achieves these through a powerful static type system, pure functions, and immutable types. Everything is type checked, there's no `null` or `undefined`, and you can't poke into an object and tweak its fields. Side effects are not possible *in the language itself*.

Every Elm app has:

* A *model* type to represent the current state, for example a list of gifts in the registry, form field values, etc -- think of this as React state
* A *view* function that takes the model and returns HTML -- this is like React's `render()`
* An *update* function that responds to messages like button clicks and form field changes and returns the new model -- like a Redux reducer

Note how none of this modifies anything ... the view function returns *new* HTML, and the update function returns a new model (and any additional side effects or "commands" to execute). The Elm `Browser` runtime takes care of all the dirty work of actually modifying the DOM and running the commands you asked for.

This pattern is much like Redux, but type safe and significantly simpler. It has come to be called *The Elm Architecture*. Note how the data flows one way ([image credit](https://dennisreimann.de/articles/elm-architecture-overview.html)):

<p align="center"><img src="/images/elm-architecture.svg" alt="The Elm architecture"></p>

So what does Elm code look like? Here's the classic [increment and decrement a counter](https://elm-lang.org/examples/buttons) app in Elm:

```elm
module Main exposing (..)

import Browser
import Html exposing (button, div, text)
import Html.Events exposing (onClick)

-- Set things up
main =
    Browser.sandbox
        { init = { count = 0 }
        , view = view
        , update = update
        }

-- Our model type (state) with one field, "count"
type alias Model =
    { count : Int }

-- Our possible messages / actions
type Msg
    = Increment
    | Decrement

-- Return new model based on an incoming message
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Decrement ->
            { model | count = model.count - 1 }

-- Return the HTML view of our model state
view model =
    div []
        [ button [ onClick Decrement ] [ text "-" ]
        , div [] [ text (String.fromInt model.count) ]
        , button [ onClick Increment ] [ text "+" ]
        ]
```

Note in particular that the `view` function is plain Elm, there's no template language or JSX syntax to learn. Each HTML node is a function that takes two arguments: a list of attributes and a list of child content nodes. The only exception is `text`, which creates a text node and only takes a single string argument. For example:

```elm
    a [ href "/example", class "eg-link" ] [ text "Example" ]
```

Even though Elm is statically typed, there are very few explicit types above! You *can* specify type signatures on functions (and get slightly better error messages), but you don't have to -- Elm uses type inference at the whole program level. If you want to add type signatures, they look like this:

```elm
-- Takes a Msg and a Model, returns a new Model
update : Msg -> Model -> Model
update msg model =
    case msg of
    ...

-- Takes a Model, returns an "Html Msg"
view : Model -> Html Msg
view model =
    div []
    ...
```

To get more of a taste of Elm, go through the very nice [official guide](https://guide.elm-lang.org).


The port
--------

When porting my gift registry app, I started with the registry page, which is the center of the app. You can view it in two modes: as an admin (the couple's view) or as a guest.

In the React codebase, the code for these is intertwined and there are lots of "if admin this else that" clauses. This was a mistake even in React-land, and I wanted to fix this in the Elm port. Other than that, however, it was a fairly direct port.

### Overall structure

I structured the app around the three views: admin, home, and guest, with the modals they manage conceptually under them. In addition there is some common functionality like the API calls, the `Date` and `Gift` types, etc:

```
Admin.elm
    AdminRegistry.elm
    EditDetailsModal.elm
    EditGiftModal.elm
    ImageModal.elm
    PersonalMessageModal.elm
    SendInvitesModal.elm

Home.elm
    FindRegistryModal.elm
    SignInModal.elm

Guest.elm
    GuestRegistry.elm
    CrossModal.elm
    UncrossModal.elm

Api.elm
Date.elm
Flash.elm
Gift.elm
Modal.elm
```

Each file "owns" a model or type (with the exception of some view helper functions in `Flash.elm` and `Modal.elm`).

I wrote the views (admin, home, guest) using `Browser.element` rather than `Browser.application` so they could just be "mounted" on the server-rendered page like I did with the React version. This was especially important on the homepage, where most of the content is server-side rendered -- only the interactive functions use Elm.

Other than that, it's very standard *Elm architecture* stuff -- every page has a `Model` type with `view` and `update` functions. Each model is initialized via Elm "flags" from JSON written into the HTML by the server.

Elm is initialized from JavaScript as follows:

```javascript
var guestApp = Elm.Guest.init({
    node: document.getElementById("registry"),
    flags: {
        registry: {% raw %}{{.Registry}}{% endraw %},
        gifts: {% raw %}{{.Gifts}}{% endraw %},
        initialMessage: session.message || null,
        initialError: session.error || null
    }
});
function reportError(message) {
    console.log('Error reported from Elm:', message);
    Raven.captureMessage(message);  // Send to Sentry
}
guestApp.ports.reportGuestError.subscribe(reportError);
```

It turns out that the only thing `reportError` is used for is when decoding the initial `flags` payload -- if I messed up the JSON (or JSON decoder) somehow, it'll get reported to me via Sentry. Other than that, all errors are handled gracefully inside Elm.

### Guest view

The first page I built was the guest view: `Guest.elm` has a very standard Elm model-view-update structure. Most important is the `Model`:

```elm
type alias Model =
    { registry : GuestRegistry
    , gifts : List Gift
    , defaultImageUrl : String
    , viewAsGuest : Bool
    , flash : Flash
    , modal : Modal
    }

-- For "flashing" messages or errors at top of screen
type Flash
    = FlashNone
    | FlashSuccess String Bool
    | FlashError String Bool

-- Pop-open modal for crossing off gifts (or un-crossing)
type Modal
    = ModalNone
    | ModalCross CrossModal.Model
    | ModalUncross UncrossModal.Model
```

To render the main part of the page there's the basic `GuestRegistry` info, a list of gifts, and a couple of settings (passed in via the server-rendered HTML template). And there's also the flash message and the modal, which are usually not visible.

### Modals

The first tricky thing for me to figure out was how to organize the modals. At first I just had everything inline in the top-level file (eg: `Guest.elm`). There are only two modals in the guest view, so that would have been okay. But it was very unwieldy for the admin view, as that has five different modals, some of them with a large number of fields.

For example, here's the model for the edit-gift modal in the admin view:

```elm
type alias Model =
    { id : Int
    , category : String
    , name : String
    , details : String
    , url : String
    , price : String
    , quantity : String
    , currencySymbol : String
    , registrySlug : String
    , numBought : Int
    , gifts : List Gift
    , defaultCategories : List String
    , showingDeleteQuestion : Bool
    , previousCategory : Maybe String
    , nameError : Maybe String
    , categoryError : Maybe String
    , quantityError : Maybe String
    , priceError : Maybe String
    }
```

I didn't want to have 50 fields in my top-level model, so I moved the modals into different files, each with their own `Model` type and `view`. That works well, and you can easily forward messages on to the modal:

```elm
viewModal : Modal -> Html Msg
viewModal modal =
    case modal of
        ModalNone ->
            text ""

        ModalCross model ->
            Html.map CrossModalMsg (CrossModal.view model)

        ModalUncross model ->
            Html.map UncrossModalMsg (UncrossModal.view model)
```

You can do the same with commands, using `Cmd.map` to translate a modal command to a top-level command to pass to the Elm runtime.

What was less obvious was how to pass other data or actions back from the modal to the top level, for example "modal should be closed". After looking around the web and browsing forums, I decided to use an "effect", an additional type that the modal's `update` function returns, telling the top level app what to do. So a modal's `update` looks like this:

```elm
update : Msg -> Model -> ( Model, Cmd Msg, Effect )
update msg model =
    case msg of
        CoupleNameChanged value ->
            ( { model | coupleName = value }, Cmd.none, NoEffect )

        CloseRequested ->
            ( model, Cmd.none, Closed )

        ...
```

Just like a regular Elm `update` function, we return the new model and a `Cmd`; but we also return an `Effect`. In most cases we return `NoEffect`, but if we need to communicate with the parent, we return an effect like `Closed` to indicate the user closed the modal.

The drawback of all this forwarding and effect passing is that it's a fair number of lines of boilerplate for each modal. If you're an Elm pro and have better ideas on how to structure this kind of thing, I'd love to hear it.

### JSON decoding

JSON decoding in Elm is somewhat tricky -- you're converting free-form JavaScript objects, complete with nulls, into well-formed Elm types. In my case, there was a mismatch between how the backend serves the "admin registry" JSON and how Elm represents it: the backend gives a flat JavaScript object with a bunch of nullable fields.

But the admin registry can be in one of four states, so here's how I've defined the type in Elm:

```elm
type AdminRegistry
    = Temp Basics             -- Initial state: temporary registry
    | Saved Basics Details    -- Once it's been saved
    | Paid Basics Details     -- Once they've paid for it
    | Passed Basics Details   -- Once their wedding date has passed

type alias Basics =
    { slug : String
    , imageUrl : Maybe String
    , personalMessage : String
    , showHowItWorks : Bool
    , currency : String
    , currencySymbol : String
    , price : Int
    , priceFormatted : String
    }

type alias Details =
    { groomFirst : String
    , groomLast : String
    , brideFirst : String
    , brideLast : String
    , email : String
    , weddingDate : String
    }
```

How do you decode a flat JSON object into that, though? The JSON has a `state` field, so first you have to decode that to determine which type we're looking at, `andThen` you decode the other parts. Here's the full decoder:

```elm
decoder : Decode.Decoder AdminRegistry
decoder =
    Decode.field "state" Decode.string
        |> Decode.andThen
            (\state ->
                case state of
                    "temp" ->
                        Decode.map Temp basicsDecoder

                    "saved" ->
                        Decode.map2 Saved basicsDecoder detailsDecoder

                    "paid" ->
                        Decode.map2 Paid basicsDecoder detailsDecoder

                    "passed" ->
                        Decode.map2 Passed basicsDecoder detailsDecoder

                    _ ->
                        Decode.fail ("unknown registry state: " ++ state)
            )

basicsDecoder : Decode.Decoder Basics
basicsDecoder =
    Decode.map8 Basics
        (field "slug" string)
        (field "image_url" (nullable string))
        (field "personal_message" string)
        (field "show_how_it_works" bool)
        (field "currency" string)
        (field "currency_symbol" string)
        (field "price" int)
        (field "price_formatted" string)

detailsDecoder : Decode.Decoder Details
detailsDecoder =
    Decode.map6 Details
        (field "groom_first_name" string)
        (field "groom_last_name" string)
        (field "bride_first_name" string)
        (field "bride_last_name" string)
        (field "email" string)
        (field "wedding_date" string)
```


Some numbers
------------

### Bundle size

First is the great news -- the Elm bundle size is much smaller than the React one:

* React: 265KB minified, 79KB minified+gzipped
* Elm: 78KB minified, 25KB minified+gzipped

That's a huge reduction, less than a third of the size! Faster to download, faster to parse, and will drain less battery doing so. Elm's small [asset sizes](https://elm-lang.org/news/small-assets-without-the-headache) are a real selling point.

Comparison point: the [React real-world example app](https://github.com/gothinkster/react-redux-realworld-example-app) bundle size is 578KB minified and 116KB minifed+gzipped, and the [Elm equivalent](https://github.com/rtfeldman/elm-spa-example) is 97KB minified and 30KB minified+gzipped.

### Lines of code

In contrast, the source code is significantly bigger:

* React: 1815 non-blank lines of code
* Elm: 3970 non-blank lines of code

I'm not surprised it's more, though I was surprised it was that much more. For comparison with the "real-world example apps" again:

* [React](https://github.com/gothinkster/react-redux-realworld-example-app): 2056 non-blank lines
* [Elm](https://github.com/rtfeldman/elm-spa-example): 3753 non-blank lines
* [ReasonML](https://github.com/jihchi/reason-react-realworld-example-app): 3659 non-blank lines (note the similarity in size; Reason is another statically typed language)

There are a number of reasons for the Elm code being more verbose:

* Type definitions: each type of a union and each field of a record definition are on separate lines (10% of total).
* `module` and `import` lines: elm-format often puts each `exposing` name on a separate line; also, my React version was in a single file, so didn't have any imports. Together these account for 10% of the total lines.
* JSON encoding and decoding: in JavaScript you don't have to write code for this. Accounts for an estimated 7% of the total lines.
* `let` ... `in` lines: each of these keywords takes a line by itself (3.5% of total).
* Modal message passing boilerplate (described above): probably another couple of hundred lines.
* Me simply wrapping lines more: in the React codebase I often used very long lines for a `<Component>` with a bunch of props. In Elm, I tended to wrap this onto multiple lines for readability.
* elm-format: I used [elm-format](https://github.com/avh4/elm-format) on all my source code. I like the go-fmt style promise of the tool, but it's particularly verbose and seems to love vertical space (more on this [below](#elm-format)).

But I think the trade-off is worth it! I was happy to let go of conciseness and gain reliability.

### Performance

Sorry to disappoint with lack of numbers here, but I didn't see the need to do any performance testing or optimizations: GiftyWeddings.com is a very simple app that doesn't need high performance. So the focus of my port was not speed, and I didn't measure it before or after. It *seems* a bit faster, but the truth is it was plenty fast in React too.

I looked at using [`Html.keyed`](https://package.elm-lang.org/packages/elm/html/1.0.0/Html-Keyed) and [`Html.lazy`](https://package.elm-lang.org/packages/elm/html/1.0.0/Html-Lazy), but it was fast enough as it was, so I decided not to bother. In the React version, I had used `key=...` and a few `shouldComponentUpdate` overrides.

Read more about [Elm's fast out-of-the-box performance](https://elm-lang.org/news/blazing-fast-html-round-two).


What I loved about Elm
----------------------

For the most part, I really loved coding in Elm. Here are some of the highlights:

**Tooling:** The `elm` command is great. Its simplicity, speed, and all-in-one usage reminds me of the `go` command. You use it to compile a single file, install new packages, start up a REPL, and build your project.

The compiler is fast and produces very nice error messages, for example, here's what you get when you mistype a field:

```
-- TYPE MISMATCH --------------------- elmapp/EditDetailsModal.elm

The `model` record does not have a `eMail` field:

326|             ( { model | eMail = value }, Cmd.none, NoEffect )
                             ^^^^^
This is usually a typo. Here are the `model` fields that are most
similar:

    { email : String
    , emailError : Maybe String
    , ...
    }

So maybe eMail should be email?
```

One aspect of tooling is super-simple deployments: just use `elm make` to build, [`uglifyjs`](https://www.npmjs.com/package/uglify-js) to minify, and upload the resulting `.js` file to your CDN. No figuring out Babel presets or fighting webpack configs.

**Packages:** To install packages, you just type `elm install elm/time`, and it downloads the latest version of the package (and any dependencies), locks the versions, and adds them to your `elm.json` dependencies list.

In the React version, `package-lock.json` lists 49 non-dev dependencies. I'm somewhat allergic to dependencies, so I didn't explicitly pull in any of those except `react` and `react-dom`. When I wrote this, I was on React 0.14.7 -- I'm pleased to see that as of the latest version (16.10.0), `react` and `react-dom` only pull in 8 dependencies.

To develop this medium-sized application in Elm, I needed the following 13 dependencies (but note that 11 of them are Elm built-in packages):

```json
{
    "direct": {
        "NoRedInk/elm-json-decode-pipeline": "1.0.0",
        "elm/browser": "1.0.1",
        "elm/core": "1.0.2",
        "elm/html": "1.0.0",
        "elm/http": "2.0.0",
        "elm/json": "1.1.3",
        "elm/regex": "1.0.0",
        "elm/time": "1.0.0",
        "elm/url": "1.0.0",
        "elm-community/list-extra": "8.2.2"
    },
    "indirect": {
        "elm/bytes": "1.0.8",
        "elm/file": "1.0.5",
        "elm/virtual-dom": "1.0.2"
    }
}
```

**Type system:** Elm's strong static typing provides a lot of guarantees, especially if you define your types to match your problem. There is of course no `null` or `undefined`. Instead, you use optionals like `Maybe Int` or, even better, custom types that exactly name the states your application can be in.

In JavaScript, you often use strings to represent message types, states, etc ("stringly typed"). In Elm, you'd make these custom types and get lots of compiler checks for free.

The compiler tells you when you've missed a branch in a `case` statement, complains if you try to misuse a type, tells you what parameters you've forgotten, etc.

One of the huge advantages of all this is that it makes refactoring safe. You can change or restructure a type used in one part of the program and just "follow the compiler" to tell you what to fix up. Almost always, when my program compiled, it worked. Occasionally I had to fight with the compiler for a few minutes, but I was usually guided back to success.

**Ergonomics and simplicity:** A lot of work has gone into the design of the Elm language and its standard library. Things just work well together. I liked the various `elm/core` packages, and I particularly liked the `elm/http` package. For example, here's my `Api.signIn` function:

```elm
signIn names password msg =
    Http.post
        { url = "/api/sign-in"
        , body =
            formBody
                [ ( "names", names )
                , ( "password", password )
                ]
        , expect = Http.expectJson msg signInDecoder
        }

signInDecoder =
    Decode.field "slug" (Decode.nullable Decode.string)
```

However, there were a couple of exceptions, notably difficult were JSON decoding and date handling (discussed below).


What could be improved
----------------------

### Documentation

The tutorial is great, but once you get past the basics there's not a lot between the tutorial and "now go build a real app". More help on how to structure a larger app would have been good. At some point I downloaded `elm-spa-example` and learned a number of things from it -- but it's almost too complex and I found it a bit hard to get into.

Much of the package documentation is good. But there are a few problems:

1) I was constantly landing on out-of-date documentation like [`elm-lang/json`](https://package.elm-lang.org/packages/elm-lang/core/5.1.1/Json-Decode) instead of [`elm/json`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode). At first I had no idea I was looking at the wrong version, but then I figured out 0.19 used the `elm/*` packages. It'd be nice if it was clear in the structure or at the top of each doc that this belonged to Elm 0.19. Or if the old results didn't show up so prominently in Google.

2) Some of the documentation is vague. For example, [`List.filterMap`](https://package.elm-lang.org/packages/elm/core/1.0.2/List#filterMap) just says "filter out certain values". That's the extent of the formal documentation, and then there is an example (which is very helpful, but I don't think examples are a substitute for thorough documentation).

I also think it would be beneficial if each function, in addition to the type signature, had a meaningful list of argument names.

Here's the current `List.filterMap` documentation:

```
    filterMap : (a -> Maybe b) -> List a -> List b

    Filter out certain values. For example...
```

And here's what it could be:

```
    filterMap : (a -> Maybe b) -> List a -> List b
    filterMap convertFn input = ...

    Filter out values of the input list where `convertFn` returns
    None. For the values where it returns `Just b`, include in the
    output list. For example...
```

Another couple of examples from the [`String`](https://package.elm-lang.org/packages/elm/core/1.0.2/String) module:

* `String.length` says merely "get the length of a string". Is that the number of bytes in its UTF-8 encoding? Number of unicode codepoints? Number of UTF-16 words?
* `String.toInt` says "try to convert a string to an int, failing on improperly formatted strings" and helpfully provides a couple of examples. But what is the range of "proper" formatting? Is whitespace allowed on either side? Are leading zeros okay? What about a leading plus sign?

Additionally, details on the Elm language itself are sparse. There's the [guide](https://guide.elm-lang.org), a [community FAQ](http://faq.elm-community.org/), a [syntax summary](https://elm-lang.org/docs/syntax) ... but no thorough language documentation or specification. When learning Go, I would regularly refer to the spec to see how a specific operator or syntax worked in detail. And I'm not talking about a formal spec or formal grammar, just detailed documentation on the language. Maybe something like this exists for Elm, but I couldn't find it.

3) In many cases, more examples would be very helpful. When I was starting to use subscriptions, at a certain point I wanted to be able to subscribe to multiple subscriptions. [`Sub.batch`](https://package.elm-lang.org/packages/elm/core/latest/Platform-Sub#batch) *seemed* related to what I wanted, but it also sounded a bit weird to "batch" subscriptions. In the end, I tried it and it worked, but an example of this would have been nice.

Or [`Cmd.map`](https://package.elm-lang.org/packages/elm/core/1.0.2/Platform-Cmd#map): the documentation doesn't have examples of its own. I ended up using it for my modals, but had to kind of guess at what it did. (It's also vague: "transform the messages produced by a command". Into what?)

### Elm-format

As a Go and `go fmt` user, I really like the concept of `elm-format`. The leading-comma thing still seems too cutesy to me, but I got over that. What I really didn't like was the huge amount of vertical space it introduced.

As an example, here's a snippet of Elm vs JavaScript code:

```elm
-- Elm: 7 non-blank lines (9 total!)
numLeft =
    Gift.numLeft model.gift

itOrSome =
    if numLeft == 1 then
        "it"

    else
        "some"
```

```javascript
// JavaScript: 2 lines
var numLeft = giftNumLeft(props.gift);
var itOrSome = (numLeft === 1) ? "it" : "some";
```

I think the way elm-format always wraps `if...else` onto four lines is a bit patronizing, especially with a blank line between the `if` and `else`.

Another example is case statements. Sometimes these are trivial, mapping one thing to another. But `elm-format` forces 3 lines per branch. For example:

```elm
parseMonth month =
    case String.toLower (String.slice 0 3 month) of
        "jan" ->
            Just Time.Jan

        "feb" ->
            Just Time.Feb

        "mar" ->
            Just Time.Mar

        ...

        _ ->
            Nothing
```

To me it seems much more sensible to use a third the number of lines:

```elm
parseMonth month =
    case String.toLower (String.slice 0 3 month) of
        "jan" -> Just Time.Jan
        "feb" -> Just Time.Feb
        "mar" -> Just Time.Mar
        ...
        _ -> Nothing
```

### JSON decoding

My first "this is weird" moment was JSON decoding: the fact that you have to count your fields and use the correct `Decode.mapN` variant feels hokey. And then if you go above 8 fields you need to pull in an external library, [`NoRedInk/elm-json-decode-pipeline`](https://package.elm-lang.org/packages/NoRedInk/elm-decode-pipeline/latest/).

### Date handling

Another significant gap was the lack of a good date library. The `elm/time` library has decent support for timestamps and converting those to human-readable values. However, there is no `Date` type, which I needed to represent a couple's wedding date.

I looked around for a bit, but the 3rd party libraries felt a bit heavy, so I wrote my own simple module. The opaque date type is as follows:

```elm
type Date
    = Date { year : Int, month : Time.Month, day : Int }
```

And then I wrote `parse` and `format` functions to go along with that.

For `parse`, I already had some nice regexes for parsing dates in "Sep 26, 2019" or "26 Sep 2019" or "2019-09-26" form, so I re-used those from the JavaScript version (though I realize using `elm/parser` would have been more idiomatic).

My `format` function is relatively simple: you give it a formatting style and a date and it returns a string:

```elm
type Style
    = MonDDYYYY
    | DDMonYYYY
    | YYYYMMDD

format : Style -> Date -> String
format style (Date date) =
    let
        ( month, monthAbbr ) =    -- eg: ( 26, "Sep" )
            monthInfo date.month
    in
    case style of
        MonDDYYYY ->
            monthAbbr ++ " "
                ++ String.fromInt date.day ++ ", "
                ++ String.fromInt date.year

        DDMonYYYY ->
            String.fromInt date.day ++ " "
                ++ monthAbbr ++ " "
                ++ String.fromInt date.year

        YYYYMMDD ->
            String.padLeft 4 '0' (String.fromInt date.year)
                ++ "-"
                ++ String.padLeft 2 '0' (String.fromInt month)
                ++ "-"
                ++ String.padLeft 2 '0' (String.fromInt date.day)
```

So it would have been nice if I didn't have to write so much to parse and format dates, or convert 1...12 to Jan...Dec. But then again, I really agree with Elm's philosophy of fewer, better modules.


All in all
----------

Overall I'm extremely happy with how it turned out, and if I were creating Gifty Weddings from scratch today I'd choose Elm again. I don't know the language at a deep level yet by any means, but I didn't feel I needed to explore every nook and cranny to get the project built.

I also recommend watching some talks by Evan Czaplicki, Elm's creator, to give you an idea of how he and the Elm community think. These videos are really good:

* [The life of a file](https://www.youtube.com/watch?v=XpDsk374LDE)
* [What is success?](https://www.youtube.com/watch?v=uGlzRt-FYto)
* [The hard parts of open source](https://www.youtube.com/watch?v=o_4EX4dPppA)

All in all, I love the speed, simplicity, and philosophy of Elm, and I recommend trying it for a frontend project near you. There's even a blog post about [How to Use Elm at Work](https://elm-lang.org/news/how-to-use-elm-at-work)!
