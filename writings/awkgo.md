---
layout: default
title: "AWKGo, an AWK-to-Go compiler"
permalink: /writings/awkgo/
description: "A discussion of AWKGo, a simple compiler that translates a useful subset of the AWK text processing language into Go source code."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2021</p>


I'm such a nerd that I [nerd-sniped](https://xkcd.com/356/) myself.

As the author of [GoAWK](/writings/goawk/), an AWK interpreter written in Go, I was wondering one day how hard it would be to translate AWK programs into Go code. Couldn't be that hard, right? I decided to try it.

It wasn't particularly hard -- at least, not for the subset of AWK that my compiler supports -- and I was able to reuse GoAWK's parser and many of its tests. To show off my creative naming skills, I'm calling the compiler AWKGo.

The rest of this article describes what AWKGo does, how it works, a few of the interesting things I learned while writing and testing it, and shows some examples of its output. I'll also look briefly at the performance of the resulting code.

You can view the [AWKGo source on GitHub](https://github.com/benhoyt/goawk/tree/awkgo/awkgo).

> **Go to:** [The subset](#the-subset) \| [Examples](#example-output) \| [Typing](#typing) \| [Compiler](#the-compiler) \| [Helpers](#helper-functions) \| [Testing](#testing) \| [Perf](#performance) \| [Conclusion](#conclusion)



## The subset

AWKGo supports a useful subset of AWK, but deviates from AWK semantics in several ways. Most small AWK scripts should work fine, though some will need minor changes.

Here's what is supported:

* `BEGIN`, `END`, and pattern-action blocks, including range patterns.
* Control structures: `if`, `else`, `for`, `while`, `break`, and so on.
* Automatic field splitting of the input (`$1`, `$2`, etc).
* Output using `print` and `printf` -- it's fast and buffered using Go's `bufio` package.
* Scalar and array variables, both use and assignment, as well as augmented assignment like `x+=10` and increment/decrement operations such as `x++`.
* The commonly-used special variables such as `FS`, `NF`, and `OFS`.
* Automatic type conversions, as in AWK: if a number is used in a string context, it's automatically converted to a string, and vice versa.
* The usual unary and binary operators, including `~` (regular expression match). Also, the ternary conditional, for example `n!=1?"s":""` -- this works as long as both cases yield the same type.
* Most built-in functions: the math functions, `split`, `sprintf`, `sub`, `substr`, and so on.

And here is what's *not* supported:

* Dynamic typing: AWK has its own form of dynamic typing, whereas Go is statically typed. So in AWKGo, if you set a variable to a string, it must stay a string, and if you set it to a number, it must stay a number.
* Numeric strings: related to the above, when an AWK value is read from user input and looks like a number, it's considered a "numeric string" and can be treated as either a string or a number. AWKGo tries to do the right thing, but once it has decided something is a string (or number), it must stay that type.
* Null values: in AWK, unset variables are "null" and appear as the empty string when output. In contrast, AWKGo outputs `0` for an unset number variable.
* User-defined functions: they're generally only used in large scripts (by AWK standards), and they were a bit hard to implement without dynamic typing.
* Non-literal `printf` format strings: you can say things like `printf("%s %d", k, v)`, but not `printf(fmt, k, v)`. The latter is rare in simple scripts.
* Print redirection: AWKGo doesn't support forms such as `print "foo" >"out.txt"`, nor does it support `getline`.
* Non-existent array elements: in POSIX, a reference to a non-existent array element is supposed to create it. I think this is a horrible feature, and anyway, I wanted to stick with Go's `map` semantics.
* Some forms of augmented assignment, like `x = y+=2`. There's no reason it couldn't support these less common constructs, I just didn't get to it.
* Some special variables, such as `ARGC` and `FILENAME`. Also, some special variables such as `NF` are read-only in AWKGo.


## Example output

What does AWKGo's output look like? Like many "transpilers", the output is neither beautiful nor idiomatic. Some constructs translate well, others not so much. Let's look at three examples, from simple to slightly more complex.

I'm not going to include the `import` declarations at the beginning, nor the [runtime helper functions](#helper-functions) included at the end, as these are the same every time.

I'm also going to elide some common setup code that's not particularly interesting. You can see those in the links I've provided to the full code, but here I'm just going to copy the interesting part -- the guts of what the compiler outputs.

The first example is a simple program that you might use on a web server log to scan for requests to the "about" page and print the 4th field:

```awk
/about/ { print $4 }
```

This compiles to:

```go
func main() {
    _output = bufio.NewWriter(os.Stdout)
    defer _output.Flush()

    _scanner = bufio.NewScanner(os.Stdin)

    // A few lines of setup code elided...

    for _scanner.Scan() {
        _lineNum++
        _line = _scanner.Text()
        _fields = _splitHelper(_line, FS)

        // The is the heart of the translated code
        if _re1.MatchString(_line) {
            fmt.Fprintln(_output, _getField(4))
        }
    }

    if _scanner.Err() != nil {
        fmt.Fprintln(os.Stderr, _scanner.Err())
        os.Exit(1)
    }
}

var (
    _re1 = regexp.MustCompile("about")
)
```

You can see how the helper functions like `_splitHelper` and `_getField` are defined in the [full output on GitHub](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/examples/about.go), but here they basically amount to `strings.Fields(_line)` and `_fields[3]`, respectively.

Note how we're pre-compiling the regular expression literal (`_re1`) using Go's `regexp.MustCompile` function at the top level.

As you can see, this example comes out pretty readable, and not too different from how you'd write it in Go by hand. Because I/O handling (and most variables) in AWK are global state, for simplicity I've defined them as globals in Go as well.

The second example is more complex, but still a fairly real-world example: counting the frequencies of unique words in a text file, and then printing the words and their counts:

```awk
{
    for (i = 1; i <= NF; i++)
        counts[tolower($i)]++
}

END {
    for (k in counts)
        print k, counts[k]
}
```

This compiles to the following ([full output on GitHub](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/examples/countwords.go)):

```go
func main() {
    // Common setup code elided...

    counts = make(map[string]float64)

    for _scanner.Scan() {
        _lineNum++
        _line = _scanner.Text()
        _fields = _splitHelper(_line, FS)

        // The action (first for loop)
        for i = 1.0; i <= float64(len(_fields)); i++ {
            counts[strings.ToLower(_getField(int(i)))]++
        }
    }

    // Error handling elided...

    // The END for loop
    for k = range counts {
        fmt.Fprintln(_output, k, _formatNum(counts[k]))
    }
}
```

AWKGo only recognizes two types: strings and numbers, so it doesn't detect that we could use just an integer for the first `for` loop -- all numbers are defined as `float64`. This mirrors AWK semantics in a simple way, but obviously if writing it directly in Go you'd use an `int`.

Note how the AWK associative array operations translate to fairly idiomatic Go `map` usage. AWKGo detects that you're building a map of string to number. Also, `tolower` translates directly to `strings.ToLower`.

For our third example, we'll compile something a bit trickier:

```awk
$1+0 == $2 { x += ++n }
END { print x }
```

This compiles to the following ([full output on GitHub](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/examples/trickier.go)):

```go
func main() {
    // Common setup code elided...

    for _scanner.Scan() {
        _lineNum++
        _line = _scanner.Text()
        _fields = _splitHelper(_line, FS)

        if _numToStr(_strToNum(_getField(1))+0.0) == _getField(2) {
            x += func() float64 { n++; return n }()
        }
    }

    // Error handling elided...

    fmt.Fprintln(_output, _formatNum(x))
}
```

Probably not a particularly useful program, but it shows a couple of interesting things about AWKGo that we'll discuss further below: we sometimes need to prod AWKGo's type detection with constructs like `+0` to force an expression to a number (or string). The output also shows how we translate things like increment, which are expressions in AWK but statements in Go. More on those below.


## Typing

AWK has been called "stringly typed". That's rather pejorative, however, and in actual fact it's *almost* statically typed: apart from a few edge cases such as "numeric strings", you can detect the types of most expressions at compile time -- and that's without any explicit type declarations.

I actually think that with a few small tweaks to the language, AWK types could be fully determined at compile time, and the language would probably be better for it. "Numeric strings" are one of the tricky things to get your head around when learning AWK.

In any case, AWKGo's job is to try to convert dynamically typed AWK into statically typed Go. To do that, there is a ["typer"](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/typer.go) that performs a pass to determine the type of each expression and variable in the AWK code.

If a number literal or a math operation is being performed, we know it's a number. If a string literal or a string operation is being done, we know it's a string. Once the typer knows the type of the right hand side of an assignment, it designates the variable on the left hand side as that type too.

Here is a snippet of code from the typer to show you how this works in practice (from the function that determines the type of an expression):

```go
func (t *typer) expr(expr Expr) (typ valueType) {
    switch e := expr.(type) {
    case *FieldExpr:
        t.expr(e.Index)
        return typeStr

    case *UnaryExpr:
        t.expr(e.Value)
        return typeNum // all unary operators yield num

    case *BinaryExpr:
        t.expr(e.Left)
        t.expr(e.Right)
        if e.Op == CONCAT {
            return typeStr
        }
        return typeNum // all binary operators except CONCAT yield str

    case *InExpr:
        for _, index := range e.Index {
            t.expr(index)
        }
        t.expr(e.Array)
        return typeNum

    case *NumExpr:
        return typeNum // number literal

    case *StrExpr:
        return typeStr // string literal

    ...
}
```

The typer walks over the syntax tree twice to ensure we detect the types of variables assigned after they're first used, for example in `while (i<5) i++` the `i++` is the assignment, and `i<5` is the use.

As mentioned above, sometimes with AWKGo you need to use a no-operation expression like `n+0` (add zero) to force an expression to a number, or `s ""` (concatenate empty string) to force it to a string. This is required if you're comparing "numeric strings" like the `$1 == $2` shown above, because AWKGo doesn't know whether it should compare them as strings or numbers. So you need to tell it: either say `$1+0 == $2` to compare them numbers, or `$1 "" == $2` to compare them as strings. For many AWK scripts, you're comparing against expressions of a known type, so you don't need to use this trick.

The other time you need an explicit conversion is when you assign a field directly to a variable without an operation. In this case, AWKGo treats fields such as `$1` as strings, so if you try to do `n = $1; n++`, it'll tell you `variable "n" already set to str, can't set to num`. You'll need to write `n = $1+0; n++` to force its hand.



## The compiler

The AWKGo [compiler](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/compiler.go) is a simple "tree walker" that walks over the syntax tree again, printing Go code to the output. It's tedious but nothing at all fancy. Here's a taste, showing part of the function that compiles expressions:

```go
func (c *compiler) expr(expr Expr) string {
    switch e := expr.(type) {
    case *NumExpr:
        if e.Value == float64(int(e.Value)) {
            return fmt.Sprintf("%d.0", int(e.Value))
        }
        if math.IsInf(e.Value, 0) {
            panic(errorf("number literal out of range"))
        }
        return fmt.Sprintf("%g", e.Value)

    case *StrExpr:
        return strconv.Quote(e.Value)

    case *FieldExpr:
        return "_getField(" + c.intExpr(e.Index) + ")"

    case *VarExpr:
        switch e.Scope {
        case ScopeSpecial:
            return c.special(e.Name, e.Index)
        case ScopeGlobal:
            return e.Name
        default:
            panic(errorf("unexpected scope %v", e.Scope))
        }

    case *RegExpr:
        return fmt.Sprintf("_boolToNum(%s.MatchString(_line))", c.regexLiteral(e.Regex))

    case *BinaryExpr:
        return c.binaryExpr(e.Op, e.Left, e.Right)

    case *IncrExpr:
        exprStr := c.expr(e.Expr) // will be an lvalue (VarExpr, IndexExpr, FieldExpr)
        if e.Pre {
            // Change ++x expression to:
            // func() float64 { x++; return x }()
            return fmt.Sprintf("func() float64 { %s%s; return %s }()",
                exprStr, e.Op, exprStr)
        } else {
            // Change x++ expression to:
            // func() float64 { _t := x; x++; return _t }()
            return fmt.Sprintf("func() float64 { _t := %s; %s%s; return _t }()",
                exprStr, exprStr, e.Op)
        }

    ...
}
```

There's a fair bit more code, including handling of pattern-actions, control structures, assignment, built-in functions like `tolower()`, and so on.

One interesting problem was how to handle constructs like `x++` (shown above) that are expressions in AWK and can be used as a value, but are top-level statements in Go. To solve this, we use the technique shown above, where we turn `x++` into an immediate call to an anonymous function -- the function allows us to return a value, and also allows Go statements in the body of the function.

To give an example, the compiled version of `y = x++` (split onto multiple lines) would be:

```go
y = func() float64 {
    _t := x // temp variable to store current x
    x++
    return _t
}()
```

However, the compiler uses an "optimization" when an increment or assignment expression is used as a statement. In these cases, because the expression's value is not being used (it's only the side effect we care about), we can shorten it to use a regular Go assignment or increment statement.

For example, `{ x++; print x }` would compile to straightforward Go:

```go
x++
fmt.Fprintln(_output, _formatNum(x))
```

One shortcut I've taken in the compiler is to not worry about whitespace or extra parentheses. The Go compiler doesn't care about lack of whitespace or extra parentheses, and for the examples above I've just run the output through `gofmt -r '(x) -> x'`, which formats the code and uses a rewrite rule to remove unneeded parentheses.

So I don't have to try to convert AWK's operator precedence to Go's at all. I simply output parentheses around every binary or unary operation, and `gofmt` fixes it up. For example, the AWK program `BEGIN { print 1+2*3 }` would compile to:

```go
func main() {
// Common setup code elided...
fmt.Fprintln(_output, _formatNum((1.0 + (2.0 * 3.0))))
}
```

But after running through the above `gofmt` command we get:

```go
func main() {
    // Common setup code elided...
    fmt.Fprintln(_output, _formatNum(1.0+2.0*3.0))
}
```


## Helper functions

There's a small AWK "runtime" needed for operations like getting and setting fields (for example, `$1`), converting strings to and from numbers, and implementing the built-in functions such as `match`, `substr`, and `sub`.

These are the same every time, so I've just included them as a multi-line string containing Go source code in [helpers.go](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/helpers.go). Each of the names is prefixed with an underscore to avoid name clashes (not foolproof, I know, but good enough).

For example, the helpers to get and set fields (`$i` and `$i = s`, respectively) are shown below. In a hand-written Go program, I'd probably avoid globals for things like `_line` and `_fields`, but in AWK, that state *is* global, so translating it that way makes sense.

```go
func _getField(i int) string {
    if i < 0 || i > len(_fields) {
        return ""
    }
    if i == 0 {
        return _line
    }
    return _fields[i-1]
}

func _setField(i int, s string) {
    if i == 0 {
        _line = s
        _fields = _splitHelper(_line, FS)
        return
    }
    for j := len(_fields); j < i; j++ {
        _fields = append(_fields, "")
    }
    _fields[i-1] = s
    _line = strings.Join(_fields, OFS)
}

func _splitHelper(s, fs string) []string {
    var parts []string
    if fs == " " {
        parts = strings.Fields(s)
    } else if s == "" {
        // NF should be 0 on empty line
    } else if utf8.RuneCountInString(fs) <= 1 {
        parts = strings.Split(s, fs)
    } else {
        parts = _reCompile(fs).Split(s, -1)
    }
    return parts
}
```


## Testing

I already had a volley of tests from GoAWK that ensure various aspects of the interpreter are working correctly. I copied them into the `awkgo` directory, and hacked them to run through AWKGo and execute the result.

Like the original tests, the AWKGo tests are written as table-driven tests with a single [`TestAWKGo` function](https://github.com/benhoyt/goawk/blob/31a9e5dc25c9c72b4c4893efc8d9f0ac778b5253/awkgo/awkgo_test.go#L613) to drive them. It parses and compiles the AWK source, outputting the Go code to a temporary file. This is then executed using `go run`, and the output is compared against what we expect.

I also wrote a little script, [awkgo/run_tests.sh](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/run_tests.sh), that runs the tests, strips from the output some stuff like timings that change from run to run, and writes the output to [awkgo/tests.txt](https://github.com/benhoyt/goawk/blob/awkgo/awkgo/tests.txt).

When I started, only a few tests passed. But with each feature implemented or bug fixed, slowly but surely the number of PASSes started to exceed the number of FAILs. It's really satisfying when you fix an issue that affects a number of tests and see a lot of failures disappear from the `tests.txt` diff.

When I finished the features I wanted to implement, I drew a line in the sand and commented out the rest of the tests so that `go test` can run without failures.


## Performance

How does the performance of an AWKGo program compare with the same program run using an AWK interpreter, or with the program written in Go by hand?

Well, it depends on the program. Programs which do math operations in a tight loop get *much* faster. Let's use the following AWK one-liner, which sums the integers from 0 to 100,000,000:

```awk
BEGIN { for (i=0; i<100000000; i++) s += i; print s }
```

We'll compare the execution time of the AWKGo version with GoAWK, Gawk, mawk, and the original Kernighan awk. I've shown the best of three runs for each, sorted from slowest to fastest:

**Version** | **Time (seconds)**
goawk       | 6.59
awk         | 6.27
gawk        | 5.73
mawk        | 2.88
awkgo       | 0.33

The first three interpreters are all similar, with Gawk coming out a bit ahead. mawk is very fast for an interpreter! But of course the compiled Go code is about 9x as fast as that.

For comparison, a hand-written Go version of this program, which uses locals instead of globals and `int` instead of `float64`, runs in 0.098s, more than 3x as fast again.

Programs which perform I/O (and to be fair, that's usually what you use AWK for) are only a little bit faster. The "count word frequencies" program I showed above run on a 10x concatenation of the King James Bible (and the output piped to `/dev/null`) runs as follows:

**Version** | **Time (seconds)**
awk         | 4.56
gawk        | 3.55
goawk       | 3.16
mawk        | 1.23
awkgo       | 0.98

Mawk is again way ahead of the pack of interpreters, almost on a par with the compiled AWKGo version. I know it uses a bytecode compiler, but then, so does Gawk ... an interesting article would be, "How does Mawk achieve its speed?" If you write it, send me the link!


## Conclusion

Was it worth it? To me, almost certainly. I enjoy languages and compilers, and making a simple three pass compiler was a good experience. I've written simple compilers before, but not one with a "typing" pass that compiles to a statically-typed language.

Is it useful? Not really. If you want performance, just use Mawk! And if you want your text processing script in a more maintainable language than AWK, you'd probably just write it in something like Go from the start. You're pretty certain to end up with more idiomatic Go that way, and it'll probably be more efficient as well.

Still, if you have some AWK scripts lying around that you want to convert to "real programs", AWKGo might not be a bad place to start: you could compile a script to Go to get the structure, then clean it up and maintain the cleaned-up version.

In any case, please let me know if you find AWKGo interesting or useful. Feedback welcome!


{% include sponsor.html %}
