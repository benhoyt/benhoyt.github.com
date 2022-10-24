---
layout: default
title: "Modernizing AWK, a 45-year old language, by adding CSV support"
permalink: /writings/goawk-csv/
description: "Why and how I added proper CSV support to GoAWK, my POSIX-compatible AWK interpreter."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">May 2022</p>


I recently added proper handling of CSV files to [GoAWK](https://github.com/benhoyt/goawk), my POSIX-compatible AWK interpreter, and I think it's a feature that will make AWK significantly more useful for developers and data analysts in our data-heavy world.

Whether it's producing input for a spreadsheet, analyzing data from a public data source, or writing scripts to process "big data", [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) and [TSV](https://en.wikipedia.org/wiki/Tab-separated_values) files are ubiquitous today. Whether it's the *best* format is up for debate, but like guy said, there are only two kinds of data formats: the ones people complain about and the ones nobody uses.

I've been thinking about adding CSV support to GoAWK since a Hacker News [comment](https://news.ycombinator.com/item?id=17786824), shortly after I released GoAWK in 2018:

> Ha. I was just thinking how useful it would be to have the awk programming language available in a tool that natively understood csv files. Suddenly that seems a lot more doable!

At the time I replied with a noncommittal response:

> Interesting point. I've thought that AWK should have a mode where it does proper quote parsing of CSV files. Maybe I'll add a -csv option for that (or just have it do it automatically when the FS is ',' -- though that wouldn't be backwards compatible).

Well, now we do have such a mode! The command line option ended up being `-i csv` ("input CSV"), but close enough.

A big thank-you to the [library of the University of Antwerp](https://www.uantwerpen.be/en/library/), who sponsored this feature. They're one of two major teams or projects I know of that use GoAWK -- the other one is the [Benthos](https://github.com/benthosdev/benthos) stream processor.


## But why?

Why do we need this in the first place? Unfortunately standard AWK doesn't have a way to handle CSV files with quoted fields, which is very important for processing real-world CSV files.

You can set the field separator to comma (`-F,` or `FS=","`), but it's a total hack, and will break on the first whiff of a quoted field. For example:

```
$ cat quoted.csv
"Smith, Bob",42
$ awk -F, '{ print $1 }' quoted.csv
"Smith    # you want to print the first field: Smith, Bob
```

There are currently several workarounds to process CSV using AWK, such as [Gawk's FPAT feature](https://www.gnu.org/software/gawk/manual/html_node/Splitting-By-Content.html), various [CSV extensions](http://mcollado.z15.es/xgawk/) for Gawk, or Adam Gordon Bell's [csvquote](https://github.com/adamgordonbell/csvquote) tool, which you run to transform your input before running `awk`, and then run `csvquote -u` to undo the transform afterwards.

There's also [frawk](https://github.com/ezrosent/frawk), which is an amazing tool by Eli Rosenthal that natively supports CSV, but unfortunately it deviates somewhat from POSIX-standard AWK. (Frawk inspired some of GoAWK's CSV support, including the `-i` and `-o` command line options.)

So I think there's a real need for proper CSV support in a POSIX-compatible version of AWK, and GoAWK provides that.

Before we dive in, let's correct the quoting problem in the example above by using GoAWK's CSV input mode:

```
$ goawk -i csv '{ print $1 }' quoted.csv
Smith, Bob    # that's better!
```


## Features

**CSV input mode.** The `-i csv` option tells GoAWK to use CSV input mode: in other words, ignore the standard field and record separators (`FS` and `RS`), and use CSV parsing instead. There's also a TSV mode, or you can use a custom separator character.

In addition, if you use the `-H` option, GoAWK uses the first row of the input as field names and adds a useful `@"named-field"` syntax that allows you to fetch a field by name instead of number.

For example, if we have a `states.csv` file whose contents are as follows:

```
"State","Abbreviation"
"Alabama","AL"
"Alaska","AK"
"Arizona","AZ"
...
```

We can output just the state's abbreviation using this script:

```
$ goawk -i csv -H '{ print @"Abbreviation" }' states.csv
AL
AK
AZ
...
```

Or, to count the number of states that have "New" in the name:

```
$ goawk -i csv -H '@"State" ~ /New/ { n++ } END { print n }' states.csv
4
```

The `~` is the regular expression match operator from standard AWK, so this code means: for records where the State field matches the regular expression `New`, increment `n`; at the end, print `n`.

**CSV output mode.** The `-o csv` command line argument tells GoAWK to use CSV output mode: this makes `print` with one or more arguments write its output with proper CSV encoding.

For example, to convert `states.csv` to TSV, you could use the following (here we're *not* using `-H`, so the header row is included):

```
$ goawk -i csv -o tsv '{ print $1, $2 }' states.csv
State   Abbreviation
Alabama AL
Alaska  AK
Arizona AZ
...
```

Plus, we have all the features of standard AWK, so there's a lot more you can do.

**[Read the CSV documentation](https://github.com/benhoyt/goawk/blob/master/docs/csv.md) for full details and many more examples.**


## Implementation notes

The [implementation](https://github.com/benhoyt/goawk/pull/107) is about 2000 lines of code, including extensive tests.

There is of course a Go API that allows you to enable CSV input or output mode using the [`interp.Config`](https://pkg.go.dev/github.com/benhoyt/goawk/interp#Config) struct to configure the options. You can also set the `INPUTMODE` or `OUTPUTMODE` special variables in the `BEGIN` block.

For various reasons, I wasn't able to use [`encoding/csv.Reader`](https://pkg.go.dev/encoding/csv#Reader) directly for CSV input mode, but I reused the structure of the standard library code in my [`csvSplitter`](https://github.com/benhoyt/goawk/blob/acb9a737b8df4628a3fd980254d1b88a87e1933d/interp/io.go#L422) and massaged it into a [`bufio.SplitFunc`](https://pkg.go.dev/bufio#SplitFunc) that parses the fields and provides the entire row as the token.

In addition to [many of my own tests](https://github.com/benhoyt/goawk/blob/acb9a737b8df4628a3fd980254d1b88a87e1933d/interp/interp_test.go#L1453), I run the [relevant subset](https://github.com/benhoyt/goawk/blob/master/interp/csvreader_test.go) of the standard library's `csv.Reader` tests on my implementation to make sure I didn't mess anything up and am still conforming to [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180.html).

For CSV output mode, I *was* able to use [`encoding/csv.Writer`](https://pkg.go.dev/encoding/csv#Writer) directly (though writing CSV is significantly simpler than reading it). See the [`writeCSV`](https://github.com/benhoyt/goawk/blob/acb9a737b8df4628a3fd980254d1b88a87e1933d/interp/io.go#L67) function for details.


## Performance

I haven't yet spent much time on performance. I intend to profile it properly at some point, but for now, it's "good enough": on a par with using Go's `encoding/csv` package directly, and much faster than the `csv` module in Python. It can read a gigabyte of complex CSV input in about three seconds on my laptop.

Compared to `frawk`, CSV input speed is significantly slower, though (somewhat surprisingly) CSV output speed is significantly faster.

Below are the results of some simple read and write [benchmarks](https://github.com/benhoyt/goawk/blob/master/scripts/csvbench) using `goawk` and `frawk` as well as plain Python and Go. The output of the write benchmarks is a 1GB, 3.5 million row CSV file with 20 columns (including quoted columns); the input for the read benchmarks uses that same file. Times are in seconds, showing the best of three runs on a 64-bit Linux laptop with an SSD drive:

Test            | goawk | frawk | Python |   Go
--------------- | ----- | ----- | ------ | ----
Reading 1GB CSV |  3.18 |  1.01 |   13.4 | 3.22
Writing 1GB CSV |  5.64 |  13.0 |   17.0 | 3.24


## Conclusion

Computers are really fast now, so you can use GoAWK to process most CSV datasets, even gigabyte-sized ones, using just your developer laptop or a relatively small virtual machine. Who needs Hadoop anyway?

So please try out GoAWK on your next CSV processing task. AWK is 45 years old and [still widely used](https://lwn.net/Articles/820829/), and my hope is that this feature will make it even more useful in developers' data tool kits.


{% include sponsor.html %}
