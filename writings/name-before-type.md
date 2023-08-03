---
layout: default
title: "Name before type: why 'age int' is better than 'int age'"
permalink: /writings/name-before-type/
description: "A variable's name is more important than its type, so the name should be more prominent and come first in declarations."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">August 2023</p>


> Summary: A variable's name is more important than its type, so the name should be more prominent and come first in declarations.


In many popular programming languages, including C, C++, Java, and C#, when you define a field or variable, you write the type before the name. For example (in C++):

```c++
// Struct definition
struct person {
    std::string name;
    std::string email;
    int age;
};

// Stand-alone variables
std::vector<person> people = get_people();
int min_age = find_minimum_age(people);
std::string domain = parse_email_domain(people[0].email);
```

In other languages, including Go, Rust, TypeScript, and Python (with type hints), you write the *name before the type*. For example (in Go):

```go
// Struct definition
type Person struct {
    Name  string
    Email string
    Age   int
}

// Stand-alone variables
var people []Person = getPeople()
var minAge int = findMinimumAge(people)
var domain string = parseEmailDomain(people[0].Email)

// Though it's more typical in Go to use := (short variable declarations)
people := getPeople()
minAge := findMinimumAge(people)
domain := parseEmailDomain(people[0].Email)
```

There's a nice answer in the Go FAQ about why Go chose this order: ["Why are declarations backwards?"](https://go.dev/doc/faq#declarations_backwards). It starts with "they're only backwards if you're used to C", which is a good point -- name-before-type has a long history in languages like Pascal. In fact, Go's type declaration syntax (and packages) were [directly inspired](https://go.dev/doc/faq#ancestors) by Pascal.

The FAQ goes on to point out that parsing is simpler with name-before-type, and declaring multiple variables is less error-prone than in C. In C, the following declares `x` to be a pointer, but (surprisingly at first!) `y` to be a normal integer:

```c
int* x, y;
```

Whereas the equivalent in Go does what you'd expect, declaring both to be pointers:

```go
var x, y *int
```

The Go blog even has an in-depth article by Rob Pike on [Go's Declaration Syntax](https://go.dev/blog/declaration-syntax), which describes more of the advantages of Go's syntax over C's, particularly with arrays and function pointers.

Oddly, the article only hints at what I think is the more important reason to prefer name-before-type for everyday programming: it's clearer.

**A variable's name is more important than its type, so the name should be more prominent and come first in declarations.**

I believe this is easy to prove in a few different ways:

1. By the popularity of type inference in variable declarations, a feature that's included in most languages now: `var` in C# and Java, `:=` in Go, `auto` in C++, and so on.
2. By the existence of dynamically-typed languages (like Python and Ruby), which don't need types at all -- you *only* have the name!
3. The name holds more semantic meaning. In the example above, `minAge` clearly means the minimum  age value, and knowing that it's an `int` doesn't add much information. It's useful for type checking, of course, but even when the type is inferred, the code is clear. (English uses type inference too: you'd never say "Person Ben Hoyt wrote this text article.")

I've held this view for a while, but what triggered me to write it down was the recent release of [Cap'n Proto 1.0](https://capnproto.org/news/2023-07-28-capnproto-1.0.html), which reminded me of the difference in schema syntax between [Protocol Buffers](https://protobuf.dev/programming-guides/proto3/) and [Cap'n Proto](https://capnproto.org/language.html).

In which example below is it easier to spot the field names? This Protocol Buffers schema:

```
message SearchResponse {
  repeated Result results = 1;
}

message Result {
  string url = 1;
  string title = 2;
  repeated string snippets = 3;
}
```

Or this Cap'n Proto one:

```
struct SearchResponse {
  results @1 :List(Result);
}

struct Result {
  url @1 :Text;
  title @2 :String;
  snippets @3 :List(Text);
}
```

I don't know about you, but I think the most important part (the field names) get a bit lost in the Protocol Buffers version. In the Cap'n Proto version they're easily visible due to the left-alignment.

I think the takeaway is this: we can't change the past, but if you're creating a new language, please put names before types!


{% include sponsor.html %}
