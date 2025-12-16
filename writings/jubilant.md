---
layout: default
title: "Don't fear Python subprocess or Go codegen"
permalink: /writings/jubilant/
description: "Discusses some design choices used in Jubilant: Python subprocess.run to wrap a CLI tool, a code generator to convert Go structs to Python dataclasses, and the use of uv with a simple Makefile to run commands."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">December 2025</p>


[Jubilant](https://github.com/canonical/jubilant/) is a Python API that I created for [Juju](https://canonical.com/juju), a deployment and operations tool made by [Canonical](https://canonical.com). While Jubilant itself is very simple, this article describes some design choices that might be interesting to other developers: the use of Python's `subprocess.run`, code generation to create Python dataclasses from Go structs, and the use of Make and uv.

I don't usually write directly about work stuff on this website, but why not? Almost everything we make at Canonical is open source, and Jubilant is no exception.

Plus, I'm *jubilant* about the name -- it was named by my colleague [Dave Wilding](https://maybecoding.bearblog.dev/).


## Subprocess.run

Jubilant is a Python API that uses [`subprocess.run`](https://docs.python.org/3/library/subprocess.html#subprocess.run) to shell out to the `juju` command. Here's a much-simplified example:

```python
def deploy(app: str):
    subprocess.run(['juju', 'deploy', app])
```

Haven't we been told not to do that? Isn't it a terrible idea?

Much less terrible than you'd think. In our case it turned out to be simpler and more stable than the old Python API, [python-libjuju](https://github.com/juju/python-libjuju). The old library calls the complex Juju API, complete with custom RPC, websockets, asynchronously updating data structures, Python's `async` and `await`, and a huge API surface. It wasn't fun to use or maintain.

In addition, most Juju CLI operations are inherently asynchronous, so the complexity of `asyncio` was not necessary. For example, `juju deploy myapp` returns to the user quickly, and the Juju controller deploys your app in the background.

But doesn't spawning a new process have a lot of overhead? For this use case, relatively little (especially on Linux, where spawning new processes is fast). The `deploy` command might take a second or two, so adding a few milliseconds on top of that is no big deal.

But what about stability? That was a real concern. But the Juju team commits to a stable CLI within a major version: they won't change the command-line arguments. They sometimes change the default text output, but they don't break the JSON output format, which is what Jubilant uses (`--format json`).

Jubilant doesn't replace all uses of python-libjuju, of course: if you want to stream something or subscribe to events, you're out of luck. But python-libjuju was used mainly to integration-test Juju operators (called "charms"), and Jubilant works great for that.

So for a tool with a complex API and a simple CLI, wrapping the CLI may just be the way to go. It's certainly been working well for us.

### Unit tests with this approach

Let's say we want to test the `version` method (which runs `juju version` and parses its output). The code under test looks like this:

```python
def version(self) -> Version:
    # self.cli() is a helper that calls subprocess.run
    stdout = self.cli('version', '--format', 'json', '--all',
                      include_model=False)
    version_dict = json.loads(stdout)
    return Version._from_dict(version_dict)
```

To test, we use a mocked version of `subprocess.run`. We've made our [own little mock](https://github.com/canonical/jubilant/blob/53fe846d77954b47872476380a7da34d968f5362/tests/unit/mocks.py#L18); it's nicer to use than a generic `MagicMock`.

Below is what a unit test looks like, using Pytest. This is a from [test_version.py](https://github.com/canonical/jubilant/blob/53fe846d77954b47872476380a7da34d968f5362/tests/unit/test_version.py#L10):

```python
def test_simple(run: mocks.Run):
    version_dict = {
        'version': '3.6.11-genericlinux-amd64',
        'git-commit': '17876b918429f0063380cdf07dc47f98a890778b',
    }
    run.handle(['juju', 'version', '--format', 'json', '--all'],
               stdout=json.dumps(version_dict))

    juju = jubilant.Juju()
    version = juju.version()

    assert version == jubilant.Version(
        3, 6, 11,
        release='genericlinux',
        arch='amd64',
        git_commit='17876b918429f0063380cdf07dc47f98a890778b',
    )
    assert version.tuple == (3, 6, 11)
```

The `run.handle` call tells the mock, "when called with these CLI arguments, return the given output".


## A Pythonic wrapper, typed

Juju admins are already used to the Juju CLI, so we wanted Jubilant to feel like the CLI, but Pythonic. It was one of our [design goals](https://documentation.ubuntu.com/jubilant/explanation/design-goals/) to wrap the CLI commands one-to-one, including command names and arguments names.

For example, admins are used to running commands like this:

```
juju deploy webapp
juju deploy mysql --config cluster-name=testclust
juju integrate webapp mysql
```

This translates directly into Python:

```python
juju = jubilant.Juju()

juju.deploy('webapp')
juju.deploy('mysql', config={'cluster-name': 'testclust'})
juju.integrate('webapp', 'mysql')
```

Positional CLI args become positional method args in Python, while CLI flags like `--config` become keyword arguments. And rich options, like key-value pairs such as `cluster-name=testclust`, become proper Python types like dictionaries.

The `deploy` method is defined as follows:

```python
def deploy(
    self,
    charm: str | pathlib.Path,
    app: str | None = None,
    *,  # this makes the rest of the arguments keyword-only
    attach_storage: str | Iterable[str] | None = None,
    base: str | None = None,
    bind: Mapping[str, str] | str | None = None,
    channel: str | None = None,
    config: Mapping[str, ConfigValue] | None = None,
    # ...
) -> None:
```

The type annotations are good documentation (for example, [deploy](https://documentation.ubuntu.com/jubilant/reference/jubilant/#jubilant.Juju.deploy)), but they also make Jubilant a joy to use in your IDE: you get great autocomplete on argument names, as well as hints for what types to use.

We type-check Jubilant using [Pyright](https://github.com/microsoft/pyright) in strict mode. This includes our unit and integration tests, which ensures that the types make sense to users of the library.

Some CLI commands in Juju are overloaded, for example `juju config myapp` without arguments *gets* the app's configuration, but with arguments like `juju config myapp foo=bar baz=42` it *sets* configuration. For this we use Python's [`@overload` decorator](https://typing.python.org/en/latest/spec/overload.html):

```python
ConfigValue = bool | int | float | str

# Get configuration values (return them)
@overload
def config(self, app: str) -> Mapping[str, ConfigValue]: ...

# Set configuration values
@overload
def config(
    self,
    app: str,
    values: Mapping[str, ConfigValue],
    *,
    reset: Iterable[str] = (),
) -> None: ...

# Only reset values
@overload
def config(self, app: str, *, reset: Iterable[str]) -> None: ...

# The definition itself (no @overload)
def config(
    self,
    app: str,
    values: Mapping[str, ConfigValue] | None = None,
    *,
    reset: Iterable[str] = (),
) -> Mapping[str, ConfigValue] | None:
    # actual implementation here
```

The overloads tell the type checker that you're only allowed to call `config()` in one of the following ways:

```python
# Get configuration values
config = juju.config('myapp')
assert config['foo'] == 'bar'

# Set configuration values
juju.config('myapp', {'foo': 'bar', 'baz': 42})

# Only reset values
juju.config('myapp', reset=['foo', 'baz'])
```


## Go generating Python dataclasses

Some of the Juju CLI commands return data, for example `juju status`. By default, this command returns human-readable textual output, for example:

```
$ juju status
Model  Controller           Cloud/Region         Version  SLA          Timestamp
tt     localhost-localhost  localhost/localhost  3.6.11   unsupported  15:13:39+13:00

Model "admin/tt" is empty.
```

However, almost all Juju commands that return output allow you to request JSON or YAML output, for example (using `jq` to pretty-print the JSON):

```
$ juju status --format json | jq
{
  "model": {
    "name": "test",
    "type": "iaas",
    "controller": "localhost-localhost",
    "cloud": "localhost",
    "region": "localhost",
    "version": "3.6.11",
    "model-status": {
      "current": "available",
      "since": "18 Nov 2025 11:06:43+13:00"
    },
    "sla": "unsupported"
  },
  "machines": {},
  "applications": {},
  "storage": {},
  "controller": {
    "timestamp": "15:14:15+13:00"
  }
}
```

Jubilant uses `--format json` and parses that into a suite of status dataclasses. The top-level one returned by the `status` method is just called [`Status`](https://github.com/canonical/jubilant/blob/53fe846d77954b47872476380a7da34d968f5362/jubilant/statustypes.py#L752). Each class has a `_from_dict` method to create an instance from a dict (from the JSON). For example:

```python
@dataclasses.dataclass(frozen=True)
class Status:
    model: ModelStatus
    machines: dict[str, MachineStatus]
    apps: dict[str, AppStatus]
    # ...

    @classmethod
    def _from_dict(cls, d: dict[str, Any]) -> Status:
        return cls(
            model=ModelStatus._from_dict(d['model']),
            machines={k: MachineStatus._from_dict(v)
                      for k, v in d['machines'].items()},
            apps={k: AppStatus._from_dict(v)
                  for k, v in d['applications'].items()},
            # ...
        )
```

But the `Status` object is big. It's composed of 28 different classes, each of which has several fields with various types: usually `str`, `int`, or a `dict` whose values are instances of another dataclass.

The source of truth for these is a bunch of Go structs in the Juju codebase. For example, the `Status` class above corresponds to the [`formattedStatus`](https://github.com/juju/juju/blob/9ffafc8f7ca5f6b71ab09648d4a5078a59207919/cmd/juju/status/formatted.go#L18) struct in Juju:

```go
type formattedStatus struct {
    Model        modelStatus                  `json:"model"`
    Machines     map[string]machineStatus     `json:"machines"`
    Applications map[string]applicationStatus `json:"applications"`
    // ...
}
```

To avoid mistakes, I really didn't want to write the Python dataclasses by hand. So I wrote a [simplistic code generator](https://github.com/juju/juju/compare/main...benhoyt:juju:status-dataclasses) in Go that uses [runtime reflection](https://pkg.go.dev/reflect) to spit out Python code.

The guts of it is a recursive function that populates a map of field information from a given struct. Here's a snippet to give you a taste:

```go
func getFields(t reflect.Type, m map[string][]FieldInfo, typeName string, level int) {
    if _, ok := m[typeName]; ok {
        return
    }
    // ...
    if t.Kind() != reflect.Struct {
        return
    }
    m[typeName] = nil
    var result []FieldInfo
    for i := 0; i < t.NumField(); i++ {
        field := t.Field(i)
        jsonTag := field.Tag.Get("json")
        if jsonTag == "" {
            jsonTag = field.Name
        }
        tagFields := strings.Split(jsonTag, ",")
        jsonField := tagFields[0]
        if jsonField == "-" {
            jsonField = ""
        }
        fieldType := field.Type.String()
        niceName := getNiceName(fieldType)
        result = append(result, FieldInfo{
            Name:      field.Name,
            Type:      niceName,
            JSONField: jsonField,
            Pointer:   fieldType[0] == '*',
            OmitEmpty: slices.Contains(tagFields[1:], "omitempty"),
        })
        if jsonField == "" {
            continue
        }
        switch field.Type.Kind() {
        case reflect.Struct:
            getFields(field.Type, m, niceName, level+1)
        case reflect.Map:
            elemType := field.Type.Elem()
            niceElemName := getNiceName(elemType.String())
            getFields(elemType, m, niceElemName, level+1)
        case reflect.Slice:
            elemType := field.Type.Elem()
            niceElemName := getNiceName(elemType.String())
            getFields(elemType, m, niceElemName, level+1)
        case reflect.Pointer:
            elemType := field.Type.Elem()
            niceElemName := getNiceName(elemType.String())
            getFields(elemType, m, niceElemName, level+1)
        }
    }
    m[typeName] = result
}
```

I knew I was just going to run this once (and then maintain the Python dataclasses directly), so it's not exactly high-quality code. But it did what we needed: generate a big Python file of dataclasses, fields, and `_from_dict` methods -- and we knew they matched the source of truth exactly, with no typos.

What's the take-away? Don't be afraid to write little throw-away programs to help convert data structures from one language to another. The source of truth doesn't have to be some over-engineered schema language; a Go struct will do fine.


## Make and uv

One other aspect of Jubilant that I want to highlight is the developer tooling. It's the first time I've used Astral's [uv](https://docs.astral.sh/uv/) for a project, and it was excellent. They've really solved the pain in Python dependency management.

We have a [`pyproject.toml`](https://github.com/canonical/jubilant/blob/main/pyproject.toml) with all the project configuration, including library dependencies (Jubilant's only dependency is PyYAML) and dev dependencies (Pyright, Pytest, Ruff, and so on).

We also have a [dead-simple Makefile](https://github.com/canonical/jubilant/blob/main/Makefile) that we use as a command runner [until uv gets its own](https://github.com/astral-sh/uv/issues/5903). I know there are alternatives like Just, but I'm a fan of using the 50-year old program that's installed everywhere, despite its quirks.

Below is a snippet of our Makefile, showing the commands I use most:

```makefile
# We're using Make as a command runner, so always make
# (avoids need for .PHONY)
MAKEFLAGS += --always-make

help:  # Display help
    @echo "Usage: make [target] [ARGS='additional args']\n\nTargets:"
    @awk -F'#' '/^[a-z-]+:/ { sub(":.*", "", $$1); print " ", $$1, "#", $$2 }' Makefile | column -t -s '#'

all: format lint unit  # Run all quick, local commands

docs:  # Build documentation
    MAKEFLAGS='' $(MAKE) -C docs run

format:  # Format the Python code
    uv run ruff format

lint:  # Perform linting and static type checks
    uv run ruff check
    uv run ruff format --diff
    uv run pyright

unit:  # Run unit tests, eg: make unit ARGS='tests/unit/test_deploy.py'
    uv run pytest tests/unit -vv --cov=jubilant $(ARGS)
```

The funky `awk` command in the "help" target lets you type `make help` to get a list of commands with their documentation, for example:

```
$ make help
Usage: make [target] [ARGS='additional args']

Targets:
  help      Display help
  all       Run all quick, local commands
  docs      Build documentation
  format    Format the Python code
  lint      Perform linting and static type checks
  unit      Run unit tests, eg: make unit ARGS='tests/unit/test_deploy.py'
```

With this Makefile, my development cycle consists of writing some code, typing `make all` to ensure it's linted and the tests pass, and then pushing up a PR.


## Conclusion

If you've got a big tool that you want to drive from Python, you may want to consider one or more of the following:

- Go out on a limb and wrap it with `subprocess.run`
- Write a code generator to avoid copying mistakes
- Use Make and uv!

Keep it stupid-simple, and enjoy Christmas 2025!


{% include sponsor.html %}
