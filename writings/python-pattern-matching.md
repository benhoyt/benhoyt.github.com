---
layout: default
title: "Structural pattern matching in Python 3.10"
permalink: /writings/python-pattern-matching/
description: "A critical but informative look at the new structural pattern matching feature in Python 3.10, with real-world code examples."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">September 2021</p>

> Summary: Python 3.10, which is due out in early October 2021, will include a large new language feature called *structural pattern matching*. This article is a critical but hopefully informative presentation of the feature, with examples based on real-world code.
>
> **Go to:** [What it is](#what-it-is) \| [Where it shines](#where-it-shines) \| [My code](#using-it-in-my-code) \| [Other projects](#using-it-in-other-projects) \| [Problems](#some-problems-with-the-feature) \| [Wrapping up](#wrapping-up)

TODO: ensure all code examples are tested


At a recent local Python meetup, a friend was presenting some of the new features in Python 3.8 and 3.9, and we then got to talking about the pattern matching feature in Python 3.10. I went on a bit of rant about how I thought Python had lost the plot: first [assignment expressions using `:=`](https://www.python.org/dev/peps/pep-0572/), and now this rather sprawling feature.

My friend interpreted my rant rather generously, and soon decided "it sounds like you want to give a talk about it at our next meetup". Well, why not! In the meantime, I thought I'd write up my thoughts and some code examples in article form. As you can gather, I'm rather biased, but I'll try to present some positives as well as just criticism.

This feature has no fewer than three PEPs (Python Enhancement Proposals) to describe it:

* [PEP 634](https://www.python.org/dev/peps/pep-0634/): the specification
* [PEP 635](https://www.python.org/dev/peps/pep-0635/): motivation and rationale
* [PEP 636](https://www.python.org/dev/peps/pep-0636/): a tutorial for the feature

The tutorial in particular provides a good overview of the feature, so if you just want to read one of the PEPs, read that one. I'll also demo the features below.

The cynical side of me notes that the rationale is by far the longest (clocking in at 8500 words). *Methinks thou dost protest too much?* To be fair, however, it looks like they just moved the usual "Rejected Ideas" section of the PEP to its own PEP due to the length.

I think what's missing here is an evaluation of the costs versus the benefits. The costs are significant new language semantics for developers to learn, as well as the cost of implementation (for CPython and other Python implementations). The benefits need to be discussed in light of real-world code, the kind of code people use Python for on a day-to-day basis (not just the fairly contrived examples in the "Motivation" section). Part of what I want to do here is evaluate some real code and see how much (or little) pattern matching improves it.

But first, let's take a brief look at what structural pattern matching in Python looks like.


## What it is

You can think of pattern matching as a `switch` statement on steriods. Many people have asked for a `switch` in Python over the years, and I can see why it has never been added. It just doesn't provide enough value over a bunch of `if ... elif` statements to pay for itself. The new `match ... case` feature provides the features of `switch`, plus the "structural" matching part -- and some.

The basic syntax is shown in the following switch-like example (imagine we're rolling our own `git` CLI):

```python
parser = argparse.ArgumentParser()
parser.add_argument('command', choices=['push', 'pull', 'commit'])
args = parser.parse_args()

match args.command:
    case 'push':
        print('pushing')
    case 'pull':
        print('pulling')
    case _:
        parser.error(f'{args.command!r} command not yet implemented')
```

Python evaluates the `match` expression, and then tries each `case` from the top, executing the first one that matches, or the `_` default case if none match.

But here's where the *structural* part comes in: the `case` patterns don't just have to be literals. The patterns can also:

* Use variable names that are set if a `case` matches
* Match sequences using list or tuple syntax (like Python's existing *iterable unpacking* feature)
* Match mappings using dict syntax
* Use `*` to match the rest of a list
* Use `**` to match other keys in a dict
* Match objects using class syntax
* Include "or" patterns with `|`
* Capture sub-patterns with `as`
* Include an `if` "guard" clause

Wow! That's a lot of features. Let's see if we can use them all in one go, in a very contrived example this time:

```python
class Car:
    __match_args__ = ('key', 'name')

    def __init__(self, key, name):
        self.key = key
        self.name = name

expr = eval(input('Expr: '))
match expr:
    case (0, x):              # seq of 2 elems with first 0
        print(f'(0, {x})')
    case ['a', b, 'c']:       # seq of 3 elems: 'a', anything, 'c'
        print(f"'a', {b!r}, 'c'")
    case {'foo': bar}:        # dict with key 'foo' (may have others)
        print(f"{% raw %}{{'foo': {bar}}}{% endraw %}")
    case [1, 2, *rest]:       # seq of: 1, 2, ... other elements
        print(f'[1, 2, *{rest}]')
    case {'x': x, **kw}:      # dict with key 'x' (others go to kw)
        print(f"{% raw %}{{'x': {x}, **{kw}}}{% endraw %}")
    case Car(key=key, name='Tesla'):  # Car with name 'Tesla' (any key)
        print(f"Car({key!r}, 'TESLA!')")
    case Car(key, name):      # similar to above, but uses __match_args__
        print(f"Car({key!r}, {name!r})")
    case 1 | 'one' | 'I':     # int 1 or str 'one' or 'I'
        print('one')
    case ['a'|'b' as ab, c]:  # seq of 2 elems with first 'a' or 'b'
        print(f'{ab!r}, {c!r}')
    case (x, y) if x == y:    # seq of 2 elems with first equal to second
        print(f'({x}, {y}) with x==y')
    case _:
        print('no match')
```

As you can see, it's complex but also powerful. The exact details of how matching is done are provided in the spec. Much of it is fairly self-explanatory, though the `__match_args__` attribute requires an explanation: if position arguments are used in a class pattern, the items in the class's `__match_args__` tuple provide the names of the attributes. This is a (rather magical!) shorthand to avoid specifying the attribute names in the class pattern.

One thing to note is that `match` and `case` are not real keywords but "soft keywords", meaning they only operate as keywords in a `match ... case` block. This is by design, because people use `match` as a variable name all the time -- I almost always use a variable named `match` as the result of a regex match.


## Where it shines

As I mentioned, I don't think it pays off if you're just using it as a glorified `switch`. So where does it pay off?

In the tutorial PEP there are several examples that make it shine (I guess it's fair enough when showing off a new feature): matching commands and their arguments in a simple text-based game. I've merged some of those examples and copied them below:

```python
command = input("What are you doing next? ")
match command.split():
    case ["quit"]:
        print("Goodbye!")
        quit_game()
    case ["look"]:
        current_room.describe()
    case ["get", obj]:
        character.get(obj, current_room)
    case ["drop", *objects]:
        for obj in objects:
            character.drop(obj, current_room)
    case ["go", direction] if direction in current_room.exits:
        current_room = current_room.neighbor(direction)
    case ["go", _]:
        print("Sorry, you can't go that way")
    case _:
        print(f"Sorry, I couldn't understand {command!r}")
```

Let's do a quick rewrite of that snippet without pattern matching. You'd almost certainly use a bunch of `if ... elif` blocks. I'm going to set a new variable `fields` to the pre-split fields, and `n` to the number of fields to make the boolean expressions simpler:

```python
command = input("What are you doing next? ")
fields = text.split()
n = len(fields)

if fields == ["quit"]:
    print("Goodbye!")
    quit_game()
elif fields == ["look"]:
    current_room.describe()
elif n == 2 and fields[0] == "get":
    obj = fields[1]
    character.get(obj, current_room)
elif n >= 1 and fields[0] == "drop":
    objects = fields[1:]
    for obj in objects:
        character.drop(obj, current_room)
elif n == 2 and fields[0] == "go":
    direction = fields[1]
    if direction in current_room.exits:
        current_room = current_room.neighbor(direction)
    else:
        print("Sorry, you can't go that way")
else:
    print(f"Sorry, I couldn't understand {command!r}")
```

Apart from being a bit shorter, I think it's fair to say that the structural matching version is significantly easier to read, and the variable binding avoids the manual indexing like `fields[1]`. In pure readability terms, this example seems like a clear win for pattern matching.

The tutorial also provides examples of class-based matching, in what is presumably part of the game's event loop:

```python
match event.get():
    case Click((x, y), button=Button.LEFT):  # This is a left click
        handle_click_at(x, y)
    case Click():
        pass  # ignore other clicks
    case KeyPress(key_name="Q") | Quit():
        game.quit()
    case KeyPress(key_name="up arrow"):
        game.go_north()
    ...
    case KeyPress():
        pass # Ignore other keystrokes
    case other_event:
        raise ValueError(f"Unrecognized event: {other_event}")
```

Let's try rewriting this one using plain `if ... elif`. Similar to how I handled the "go" command in the rewrite above, I'll merge cases together where it makes sense (events of the same class):

```python
e = event.get()
if isinstance(e, Click):
    x, y = e.position
    if e.button == Button.LEFT:
        handle_click_at(x, y)
    # ignore other clicks
elif isinstance(e, KeyPress):
    key == e.key_name
    if key == "Q":
        game.quit()
    elif key == "up arrow":
        game.go_north()
    # ignore other keystrokes
elif isinstance(e, Quit):
    game.quit()
else:
    raise ValueError(f"Unrecognized event: {e}")
```

To me this one seems more border-line. It's definitely a bit nicer with pattern matching, but not by much. The `match` has the advantage of the `case`s all lining up; the `if ... elif` has the advantage that the event types are grouped more strongly, and we avoid repeating the types.

Despite my skepticism, I'm trying to be fair: these examples do look nice, and even if you haven't read the pattern matching spec, it's reasonably clear what they do -- with the possible exception of the `__match_args__` magic.

There's also an [expression parser and evaluator](https://github.com/gvanrossum/patma/blob/master/examples/expr.py) that Guido van Rossum wrote to show-case the feature. It uses `match ... case` heavily (11 times in a fairly small file). Here's one example:

```python
def eval_expr(expr):
    """Evaluate an expression and return the result."""
    match expr:
        case BinaryOp('+', left, right):
            return eval_expr(left) + eval_expr(right)
        case BinaryOp('-', left, right):
            return eval_expr(left) - eval_expr(right)
        case BinaryOp('*', left, right):
            return eval_expr(left) * eval_expr(right)
        case BinaryOp('/', left, right):
            return eval_expr(left) / eval_expr(right)
        case UnaryOp('+', arg):
            return eval_expr(arg)
        case UnaryOp('-', arg):
            return -eval_expr(arg)
        case VarExpr(name):
            raise ValueError(f"Unknown value of: {name}")
        case float() | int():
            return expr
        case _:
            raise ValueError(f"Invalid expression value: {repr(expr)}")
```

What would that look like with `if ... elif`? Once again, you'd probably structure it slightly differently, with all the `BinaryOp`s together. Note that that doesn't actually increase the indentation level, due to the double nesting required for the `case` clauses in a `match`:

```python
def eval_expr(expr):
    """Evaluate an expression and return the result."""
    if isinstance(expr, BinaryOp):
        op, left, right = expr.op, expr.left, expr.right
        if op == '+':
            return eval_expr(left) + eval_expr(right)
        elif op == '-':
            return eval_expr(left) - eval_expr(right)
        elif op == '*':
            return eval_expr(left) * eval_expr(right)
        elif op == '/':
            return eval_expr(left) / eval_expr(right)
    elif isinstance(expr, UnaryOp):
        op, arg = expr.op, expr.arg
        if op == '+':
            return eval_expr(arg)
        elif op == '-':
            return -eval_expr(arg)
    elif isinstance(expr, VarExpr):
        raise ValueError(f"Unknown value of: {name}")
    elif isinstance(expr, (float, int)):
        return expr
    raise ValueError(f"Invalid expression value: {repr(expr)}")
```

It's two more lines due to the manual attribute unpacking for the `BinaryOp` and `UnaryOp` fields. Maybe it's just me, but I find this one just as easy to read as the `match` version, and a bit more obvious and explicit.


## Using it in my code

Let's look at converting some real-world code to use the new feature. I'm basically scanning for `if ... elif` blocks to see if it makes sense to convert them. I'll start with a few examples of code I've written.

The first couple of examples are from [pygit](https://benhoyt.com/writings/pygit/), a toy subset of `git` that's just enough enough of a Git client to create a repo, commit, and push itself to GitHub ([full source code](https://github.com/benhoyt/pygit/blob/master/pygit.py)).

Here's a snippet from `find_object`:

```python
def find_object(sha1_prefix):
    ...
    objects = [n for n in os.listdir(obj_dir) if n.startswith(rest)]
    if not objects:
        raise ValueError('object {!r} not found'.format(sha1_prefix))
    if len(objects) >= 2:
        raise ValueError('multiple objects ({}) with prefix {!r}'.format(
                len(objects), sha1_prefix))
    return os.path.join(obj_dir, objects[0])
```

It's quite clear as is, but let's see if it's simpler using `match`:

```python
def find_object(sha1_prefix):
    ...
    objects = [n for n in os.listdir(obj_dir) if n.startswith(rest)]
    match objects:
        case []:
            raise ValueError('object {!r} not found'.format(sha1_prefix))
        case [obj]:
            return os.path.join(obj_dir, obj)
        case _:
            raise ValueError('multiple objects ({}) with prefix {!r}'
                .format(len(objects), sha1_prefix))
```

The cases themselves are a bit nicer, especially how `obj` is bound automatically instead of using `objects[0]`.

However, one thing that's not great is how the "success case" ends up sandwiched in the middle, so the normal code path gets a bit lost. You could hack it to the end with the following (but then it's definitely not as clear as the original):

```python
    match objects:
        case []:
            raise ValueError('object {!r} not found'.format(sha1_prefix))
        case [_,_,*_]:
            raise ValueError('multiple objects ({}) with prefix {!r}'
                .format(len(objects), sha1_prefix))
        case [obj]:
            return os.path.join(obj_dir, obj)
```

Overall I think rewriting this to use `match` is over-use of the feature, and we should keep it as is.

Here's another example, from the `cat_file` function:

```python
def cat_file(mode, sha1_prefix):
    obj_type, data = read_object(sha1_prefix)
    if mode in ['commit', 'tree', 'blob']:
        if obj_type != mode:
            raise ValueError('expected type {}, got {}'.format(
                    mode, obj_type))
        sys.stdout.buffer.write(data)
    elif mode == 'size':
        print(len(data))
    elif mode == 'type':
        print(obj_type)
    elif mode == 'pretty':
        if obj_type in ['commit', 'blob']:
            sys.stdout.buffer.write(data)
        elif obj_type == 'tree':
            ... # pretty print tree
        else:
            assert False, 'unhandled type {!r}'.format(obj_type)
    else:
        raise ValueError('unexpected mode {!r}'.format(mode))
```

A direct translation would be the following (note the nested `match` in the "pretty" case):

```python
def cat_file(mode, sha1_prefix):
    obj_type, data = read_object(sha1_prefix)
    match mode:
        case 'commit' | 'tree' | 'blob':
            if obj_type != mode:
                raise ValueError('expected type {}, got {}'.format(
                        mode, obj_type))
            sys.stdout.buffer.write(data)
        case 'size':
            print(len(data))
        case 'type':
            print(obj_type)
        case 'pretty':
            match obj_type:
                case 'commit' | 'blob':
                    sys.stdout.buffer.write(data)
                case 'tree':
                    ... # pretty print tree
                case _:
                    assert False, 'unhandled type {!r}'.format(obj_type)
        case _:
            raise ValueError('unexpected mode {!r}'.format(mode))
```

We're using `match` as a simple switch, but it's a very slight win. What about if we try reworking it to match `mode` and `obj_type` at the same time as a tuple:

```python
def cat_file(mode, sha1_prefix):
    obj_type, data = read_object(sha1_prefix)
    match (mode, obj_type):
        case ('commit' | 'tree' | 'blob', _) if obj_type == mode:
            sys.stdout.buffer.write(data)
        case ('size', _):
            print(len(data))
        case ('type', _):
            print(obj_type)
        case ('pretty', 'commit' | 'blob'):
            sys.stdout.buffer.write(data)
        case ('pretty', 'tree'):
            ... # pretty print tree
        case _:
            raise ValueError('unexpected mode {!r} or type {!r}'.format(
                mode, obj_type))
```

Now I think it's more streamlined than the original, though arguably no more clear!

The other case in pygit where it would make sense to use `match` is when switching on the CLI sub-command, but again it would a simple switch, not making use of the *structural* features:

```python
args = parser.parse_args()
if args.command == 'add':
    ... # do add
elif args.command == 'cat-file':
    ... # do cat-file
elif args.command == 'commit':
    ... # do commit
...
```

Using `match` would reduce the visual noise:

```python
args = parser.parse_args()
match args.command:
    case 'add':
        ... # do add
    case 'cat-file':
        ... # do cat-file
    case 'commit':
        ... # do commit
    ...
```

But we don't really need a whole new feature for that. You can reduce most of the visual noise by assigning a short variable name:

```python
args = parser.parse_args()
cmd = args.command
if cmd == 'add':
    ... # do add
elif cmd == 'cat-file':
    ... # do cat-file
elif cmd == 'commit':
    ... # do commit
...
```

Here's an example from [`pebble.py`](https://github.com/canonical/operator/blob/master/ops/pebble.py) that I wrote for work, part of Canonical's Python Operator Framework. It handles the various types allowed for the `layer` parameter:

```python
def add_layer(self, label, layer, *, combine=False):
    ...
    if isinstance(layer, str):
        layer_yaml = layer
    elif isinstance(layer, dict):
        layer_yaml = Layer(layer).to_yaml()
    elif isinstance(layer, Layer):
        layer_yaml = layer.to_yaml()
    else:
        raise TypeError('layer must be str, dict, or pebble.Layer')
    # use layer_yaml
```

The `match` version uses the class matching syntax:

```python
def add_layer(self, label, layer, *, combine=False):
    ...
    match layer:
        case str():
            layer_yaml = layer
        case dict():  # could also be written "case {}:"
            layer_yaml = Layer(layer).to_yaml()
        case Layer():
            layer_yaml = layer.to_yaml()
        case _:
            raise TypeError('layer must be str, dict, or pebble.Layer')
    # use layer_yaml
```

At first I thought it was weird how the variables bound (and assigned) in a `case` block outlive the entire `match` block. But as shown in the above, it makes sense -- you'll often want to use the variables in the code below the `match`.

Is the `match` version clearer? It's less noisy, but I like the explicitness of the `isinstance()` calls. In addition, the empty parens in the various cases are a bit weird -- they look unnecessary without position arguments or attributes, but without them you'd be binding new variables `str` or `dict`.

Here's another example from the same codebase, from code I'm [working on](https://github.com/canonical/operator/blob/da244446532d8c98323c6af96e2901b539c5579f/ops/pebble.py#L1647-L1663) now:

```python
def exec(command, stdin=None, encoding='utf-8', ...):
    if isinstance(command, (bytes, str)):
        raise TypeError('command must be a list of str, not {}'.format(
            type(command).__name__))
    if len(command) < 1:
        raise ValueError('command must contain at least one item')

    if stdin is not None:
        if isinstance(stdin, str):
            if encoding is None:
                raise ValueError('encoding must be set if stdin is str')
            stdin = io.BytesIO(stdin.encode(encoding))
        elif isinstance(stdin, bytes):
            if encoding is not None:
                raise ValueError('encoding must be None if stdin is bytes')
            stdin = io.BytesIO(stdin)
        elif not hasattr(stdin, 'read'):
            raise TypeError('stdin must be str, bytes, or a readable file-like object')
    ...
```

Does `match` help simplify those checks? Let's see:

```python
def exec(command, stdin=None, encoding='utf-8', ...):
    match command:
        case bytes() | str():
            raise TypeError('command must be a list of str, not {}'
                .format(type(command).__name__))
        case []:
            raise ValueError('command must contain at least one item')

    match stdin:
        case str():
            if encoding is None:
                raise ValueError('encoding must be set if stdin is str')
            stdin = io.BytesIO(stdin.encode(encoding))
        case bytes():
            if encoding is not None:
                raise ValueError('encoding must be None if stdin is bytes')
            stdin = io.BytesIO(stdin)
        case None:
            pass
        case _ if not hasattr(stdin, 'read'):
            raise TypeError('stdin must be str, bytes, or a readable file-like object')
    ...
```

I'd argue this is no clearer. The `case None` is awkward -- we could avoid it by wrapping the whole thing in `if stdin is not None:` like the original code did, but that adds a third nesting level, which is less than ideal.

The default case with a guard, `case _ if not hasattr(stdin, 'read')`, is also a bit more obscure than the original `elif` version. You could of course just use `case _:` and then nest the `if not hasattr`.

Maybe I just don't write much of the kind of code that would benefit from this feature. My guess is that there are a lot of people that fall into this camp. However, let's scan code from a couple of popular Python projects to see what we can find.


## Using it in other projects

Let's try the same thing for a few well-known repositories on the net. I'm going to pick examples from three different types of code: library code (from the [standard library](https://github.com/python/cpython/tree/main/Lib)), framework code (from the [Django](https://github.com/django/django) web framework), and application code (from the [Warehouse](https://github.com/pypa/warehouse) server that powers the Python Package Index).

In an effort to be fair, I tried to find examples that would really benefit from `match` and were more than a glorified `switch` (there were a lot of those, but they're not using the *structural* part of pattern matching, so converting them doesn't seem like a huge win). I was looking for `elif` blocks which looked like they tested the structure of the data. There might be some good uses of `match` in code which just uses `if` without `elif`, but I think that would be rare, so let's look for the obvious ones first.

### The standard library

Python's standard library has about 709,000 lines of code, including tests (measured using [scc](https://github.com/boyter/scc)). The [ripgrep](https://github.com/BurntSushi/ripgrep) search tool (`rg --type=py 'elif ' | wc`) tells us that 2529 of those lines are `elif` statements, or 0.4%. I realize this would find “elif&nbsp;” in comments, but presumably that's rare.

The first good use case I found was, not surprisingly, in the `ast` module, inside `literal_eval`'s [`_convert`](https://github.com/python/cpython/blob/dea59cf88adf5d20812edda330e085a4695baba4/Lib/ast.py#L82-L107) helper:

```python
def _convert(node):
    if isinstance(node, Constant):
        return node.value
    elif isinstance(node, Tuple):
        return tuple(map(_convert, node.elts))
    elif isinstance(node, List):
        return list(map(_convert, node.elts))
    elif isinstance(node, Set):
        return set(map(_convert, node.elts))
    elif (isinstance(node, Call) and isinstance(node.func, Name) and
          node.func.id == 'set' and node.args == node.keywords == []):
        return set()
    elif isinstance(node, Dict):
        if len(node.keys) != len(node.values):
            _raise_malformed_node(node)
        return dict(zip(map(_convert, node.keys),
                        map(_convert, node.values)))
    elif isinstance(node, BinOp) and isinstance(node.op, (Add, Sub)):
        left = _convert_signed_num(node.left)
        right = _convert_num(node.right)
        if isinstance(left, (int, float)) and isinstance(right, complex):
            if isinstance(node.op, Add):
                return left + right
            else:
                return left - right
    return _convert_signed_num(node)
```

Converting that to use `match`:

```python
def _convert(node):
    match node:
        case Constant(value):
            return value
        case Tuple(elts):
            return tuple(map(_convert, elts))
        case List(elts):
            return list(map(_convert, elts))
        case Set(elts):
            return set(map(_convert, elts))
        case Call(Name('set'), args=[], keywords=[]):
            return set()
        case Dict(keys, values):
            if len(keys) != len(values):
                _raise_malformed_node(node)
            return dict(zip(map(_convert, keys),
                            map(_convert, values)))
        case BinOp(left, (Add() | Sub()) as op, right):
            left = _convert_signed_num(left)
            right = _convert_num(right)
            match (op, left, right):
                case (Add(), int() | float(), complex()):
                    return left + right
                case (Sub(), int() | float(), complex()):
                    return left - right
    return _convert_signed_num(node)
```

Definitely a win! Syntax tree processing seems like the ideal use case for `match`. In Python 3.10, the `ast` module's node types already have `__match_args__` set, so that makes it even cleaner. We could have used `as` assignments in the `BinOp` case, but the pattern gets a bit noisy.

Still, I want to find one outside the `ast` module. There's a nice long `if ... elif` chain in [`curses/textpad.py:do_command`](https://github.com/python/cpython/blob/dea59cf88adf5d20812edda330e085a4695baba4/Lib/curses/textpad.py#L95): it's mostly a simple switch, but it would benefit from `match ... case` with a few `if` guards.

What about this, from [`dataclasses.py:_asdict_inner`](https://github.com/python/cpython/blob/dea59cf88adf5d20812edda330e085a4695baba4/Lib/dataclasses.py#L1235):

```python
def _asdict_inner(obj, dict_factory):
    if _is_dataclass_instance(obj):
        result = []
        for f in fields(obj):
            value = _asdict_inner(getattr(obj, f.name), dict_factory)
            result.append((f.name, value))
        return dict_factory(result)
    elif isinstance(obj, tuple) and hasattr(obj, '_fields'):
        return type(obj)(*[_asdict_inner(v, dict_factory) for v in obj])
    elif isinstance(obj, (list, tuple)):
        return type(obj)(_asdict_inner(v, dict_factory) for v in obj)
    elif isinstance(obj, dict):
        return type(obj)((_asdict_inner(k, dict_factory),
                          _asdict_inner(v, dict_factory))
                         for k, v in obj.items())
    else:
        return copy.deepcopy(obj)
```

Let's try converting that to `match`:

```python
def _asdict_inner(obj, dict_factory):
    match obj:
        case _ if _is_dataclass_instance(obj):
            result = []
            for f in fields(obj):
                value = _asdict_inner(getattr(obj, f.name), dict_factory)
                result.append((f.name, value))
            return dict_factory(result)
        case tuple(_fields=_):
            return type(obj)(*[_asdict_inner(v, dict_factory) for v in obj])
        case list() | tuple():
            return type(obj)(_asdict_inner(v, dict_factory) for v in obj)
        case {}:
            return type(obj)((_asdict_inner(k, dict_factory),
                              _asdict_inner(v, dict_factory))
                             for k, v in obj.items())
        case _:
            return copy.deepcopy(obj)
```

A nice little improvement, though the first `case _` with the `if` guard is a bit weird. It may be able to be moved to a regular `if` statement inside the final `case _`, but I don't know the code well enough to know if that ordering would still do what we want.

Here's a quite different example from [`email/_parseaddr.py:_parsedate_tz`](https://github.com/python/cpython/blob/dea59cf88adf5d20812edda330e085a4695baba4/Lib/email/_parseaddr.py#L57):

```python
def _parsedate_tz(data):
    ...
    tm = tm.split(':')
    if len(tm) == 2:
        [thh, tmm] = tm
        tss = '0'
    elif len(tm) == 3:
        [thh, tmm, tss] = tm
    elif len(tm) == 1 and '.' in tm[0]:
        # Some non-compliant MUAs use '.' to separate time elements.
        tm = tm[0].split('.')
        if len(tm) == 2:
            [thh, tmm] = tm
            tss = 0
        elif len(tm) == 3:
            [thh, tmm, tss] = tm
    else:
        return None
    # use thh, tmm, tss
```

Interestingly, while testing this I found that this code has a bug that raises an `UnboundLocalError` on invalid user input: if you pass a time with more than 3 dotted segments like `12.34.56.78`, the `thh`/`tmm`/`tss` variables won't be defined for the following code. Check this out:

```
$ python3.10 -c 'import email.utils; \
    email.utils.parsedate_tz("Wed, 3 Apr 2002 12.34.56.78+0800")'
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/usr/local/lib/python3.10/email/_parseaddr.py", line 50, in parsedate_tz
    res = _parsedate_tz(data)
  File "/usr/local/lib/python3.10/email/_parseaddr.py", line 134, in _parsedate_tz
    thh = int(thh)
UnboundLocalError: local variable 'thh' referenced before assignment
```

All it needs is another `else: return None` in the dot case. I've opened an [issue](https://bugs.python.org/issue45239) and a [pull request](https://github.com/python/cpython/pull/28452) that adds a test case for this and fixes the bug.

Anyway, let's have a shot at converting that (we'll fix the bug as well):

```python
def _parsedate_tz(tm):
    ...
    match tm.split(':'):
        case [thh, tmm]:
            tss = '0'
        case [thh, tmm, tss]:
            pass
        case [s] if '.' in s:
            match s.split('.'):
                case [thh, tmm]:
                    tss = 0
                case [thh, tmm, tss]:
                    pass
                case _:
                    return None
        case _:
            return None
    # use thh, tmm, tss
```

This is definitely a good bit cleaner. It's always a bit of a pain when you use `str.split()` to have to test the length before unpacking the tuple (you could also catch the `ValueError` exception, but it's not as clear, and the nesting levels get a bit much).

Side note: the `str.partition()` method is often useful in cases like this, but only when you have two items with a separator in between.

### Django

Django has 327,000 lines of code, including tests. Of these, there are 905 uses of `elif`, or 0.3%.

Here's one from [`_check_fieldsets_item`](https://github.com/django/django/blob/ca9872905559026af82000e46cde6f7dedc897b6/django/contrib/admin/checks.py#L302-L323) that looks interesting:

```python
def _check_fieldsets_item(self, obj, fieldset, label, seen_fields):
    if not isinstance(fieldset, (list, tuple)):
        return must_be('a list or tuple', option=label, obj=obj, id='admin.E008')
    elif len(fieldset) != 2:
        return must_be('of length 2', option=label, obj=obj, id='admin.E009')
    elif not isinstance(fieldset[1], dict):
        return must_be('a dictionary', option='%s[1]' % label, obj=obj, id='admin.E010')
    elif 'fields' not in fieldset[1]:
        return [
            checks.Error(
                "The value of '%s[1]' must contain the key 'fields'." % label,
                obj=obj.__class__,
                id='admin.E011',
            )
        ]
    elif not isinstance(fieldset[1]['fields'], (list, tuple)):
        return must_be('a list or tuple', option="%s[1]['fields']" % label, obj=obj, id='admin.E008')

    seen_fields.extend(flatten(fieldset[1]['fields']))
    ...
```

This is interesting: it's doing a lot of nested structural matching, which seems like a great fit. Let's see about converting it:

```python
def _check_fieldsets_item(self, obj, fieldset, label, seen_fields):
    match fieldset:
        case (_, {'fields': [*fields]}):
            pass
        case _:
            return must_be('a list or tuple of length 2 with a fields dict')

    seen_fields.extend(flatten(fields))
    ...
```

If the specific error messages don't matter, that's really nice! However, in this case they probably do, otherwise it wouldn't be carefully broken out the way it is. To fix that, we need to specify all the cases, but in the opposite order from the original, so that the most specific is matched first:

```python
def _check_fieldsets_item(self, obj, fieldset, label, seen_fields):
    match fieldset:
        case [_, {'fields': [*fields]}]:
            pass  # valid, fall through
        case [_, {'fields': _}]:
            return must_be('a list or tuple', option="%s[1]['fields']" % label, obj=obj, id='admin.E008')
        case [_, {}]:
            return [
                checks.Error(
                    "The value of '%s[1]' must contain the key 'fields'." % label,
                    obj=obj.__class__,
                    id='admin.E011',
                )
            ]
        case [_, _]:
            return must_be('a dictionary', option='%s[1]' % label, obj=obj, id='admin.E010')
        case [*_]:
            return must_be('of length 2', option=label, obj=obj, id='admin.E009')
        case _:
            return must_be('a list or tuple', option=label, obj=obj, id='admin.E008')

    seen_fields.extend(flatten(fields))
    ...
```

Is it clearer? Arguably. It's a little strange repeating yourself, getting less and less specific. It also seems less obvious to me with the cases "backwards", falling through to the looser matches. And `[_, _]` followed by `[*_]` to mean "not of length 2" is not exactly explicit.

This example highlights one of the problems I see with `match`: it adds another way to do things. The [Zen of Python](https://www.python.org/dev/peps/pep-0020/) says, "There should be one -- and preferably only one -- obvious way to do it." In reality, Python has always had many different ways to do things. But now there's one that adds a fair bit of cognitive load to developers: in a case like the above, we may often need to try both with and without `match`, and still be left debating which is more "obvious".

## Warehouse

Warehouse, PyPI's server code, has 59,000 lines of Python code, including tests. There are 35 uses of `elif`, or 0.06%. Interestingly, that's an order of magnitude less than either the standard library or Django, which matches with my conjecture that `match` won't pay off as much in "regular" code. I only found one example that looked like it would benefit from `match`, in [`sync_bigquery_release_files`](https://github.com/pypa/warehouse/blob/ae9fc472cfdf4ef8838f917644ca93150f68a97a/warehouse/packaging/tasks.py#L194-L208):

```python
for sch in table_schema:
    if hasattr(file, sch.name):
        field_data = getattr(file, sch.name)
    elif hasattr(release, sch.name) and sch.name == "description":
        field_data = getattr(release, sch.name).raw
    elif sch.name == "description_content_type":
        field_data = getattr(release, "description").content_type
    elif hasattr(release, sch.name):
        field_data = getattr(release, sch.name)
    elif hasattr(project, sch.name):
        field_data = getattr(project, sch.name)
    else:
        field_data = None
```

However, on closer inspection, these structural tests are being done on three different values (`file`, `release`, and `project`), and the structure they're being tested for is dynamic. At first I was thinking `object(name=name)` would do what we want, but the code is actually matching on an attribute with a name of whatever `sch.name`'s value is. Tricky!

Hmmm, it seems Warehouse wasn't exactly crying out for `match`. I decided to keep it here anyway, as I think it's a good counterpoint.

Let's look at one other large application: TODO


## Some problems with the feature

As I've shown, pattern matching does make code clearer in a few cases, but there are a number of concerns I have with this feature. Obviously the ship has already sailed -- Python 3.10 is due out in a few days! -- but I think it's valuable to consider them for future designs.

There's some trivial stuff like how `match ... case` requires two indentation levels: the PEP authors [considered](https://www.python.org/dev/peps/pep-0635/#the-match-statement) various alternatives, and I believe they chose the right route -- that's only a minor annoyance. But what about larger problems?

**Learning curve and surface area.** As you can see from the size of the spec PEP, there is a lot too this feature, with about 10 sub-features packed into one. Python has always been an easy-to-learn language, and this feature, while it looks good on the page, has a lot of complexity in its semantics.

**Only useful in rarer domains.** As shown above, there are cases where `match` really shines. But they are few and far between, mostly when handling syntax trees and writing parsers. The other cases that benefit are essentially plain `switch`, and `if ... elif` works almost as well for those.

My hunch is that the PEP authors (Brandt Bucher and Guido van Rossum, both Python core developers) regularly write the kind of code that does benefit from pattern matching, but most application developers and script writers will need `match` far less often. Guido van Rossum in particular has been working on the [Mypy](http://mypy-lang.org/) type checker for a while, and now he's working on speeding up CPython -- compiler-like work involving ASTs.

**Syntax works differently.** There are at least two parts of this feature where syntax that looks like one thing in "normal Python" acts differently inside a pattern:

1. Variable names: a variable in a `case` clause doesn't return its value like in ordinary code, it binds it as a name. This means `case RED` doesn't work as you expect -- it will set a new variable named `RED`, not match your colour constant. To match on constants, they have to have a dot in them -- so `case Colors.RED` works. In writing some of the code above I actually made this mistake: I wrote `case ('commit' | 'tree' | 'blob', mode)`, expecting it to match if the tuple's second item was equal to `mode`, but of course it would have set `mode` to the second item.
2. Class patterns: these look like function calls, but they're really `isinstance` and `hasattr` tests. It looks nice, but it's sometimes confusing. It also means you can't match on the result of an actual function call -- that would have to be in an `if` guard.

**The __match_args__ magic.** In my opinion the `__match_args__` feature is too magical, and requires developers to decide which of a class's attributes should be position-matchable, if any. It's also strange that the `__match_args__` order could be different from the order of the class's `__init__` parameters (though in practice you'd try not to do that). I can see why they've included this feature, as it makes the likes of AST node matching really nice, but it's not very explicit.

**Cost for other implementations.** CPython is by far the most commonly-used Python interpreter, but there are also others, such as PyPy and Micropython, that will have to decide whether or not to implement this feature. Other interpreters are always playing catch-up anyway, but a feature of this size at this stage in the game will make it even harder for other implementations to keep up.


## Wrapping up

I do like some aspects of pattern matching, and certain code is definitely cleaner with `match ... case` than with `if ... elif`. But does the feature provide enough value to justify the complexity, not to mention the cognitive burden it places on people learning Python or reading Python code?

That said, Python has always been a pragmatic programming language, not a purist's dream. As Bjarne Stroustrup, the creator of C++, said, "There are only two kinds of languages: the ones people complain about and the ones nobody uses." I have always liked Python, and I've used it successfully for many years. I'll almost certainly continue to use it for many tasks. It's not perfect, but if it were, no one would use it.

I've also been using Go a lot recently, and there's definitely something good about how slowly the language changes (by design). Most of the release notes start with "there are no changes to the language" -- for example, in [Go 1.16](https://golang.org/doc/go1.16) all the changes were in the tooling and standard library. That said, Go will have its own large new feature in a few months with [generics coming in Go 1.18](https://go.dev/blog/generics-proposal).

Overall I'm a bit pessimistic about structural pattern matching in Python. It's just a big feature to add so late in the game (Python is 30 years old this year). Is the language starting to implode under its own weight?

Or, as my friend predicted, is it one of those features that will be over-used for everything for a couple of years, and then the community will settle down and only use it where it really improves the code? We shall see!
