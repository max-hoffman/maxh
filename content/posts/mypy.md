---
title: "Mypy and Doltpy"
type: "post"
date: 2018-02-22T12:55:06-05:00
draft: false
---

This is a cross-post from [Dolthub's
Blog](https://www.dolthub.com/blog/2021-02-22-mypy-and-doltpy/).

## Dolt
Dolt is an SQL-database with Git-versioning.
The goal of [Doltpy](https://github.com/dolthub/doltpy), in
concert with [Dolt](http://github.com/dolthub/dolt), is to solve
reproducibility and versioning problems for data and machine
learning engineers using Python.

## Mypy

Mypy was created by Guido van Rossum, the primary developer of the
Python language, as a way to apply
[PEP standards](https://www.python.org/dev/peps/pep-0008/) to Python source
code. When lines of code are added to the Python core libraries,
their respective mypy stubs are updated lockstep.

So when we fix mypy errors we are enforcing rules of the Python type system.
This point is subtle but important: mypy errors when your code is not doing
what you've declared it should do. Static checking can't anticipate what
input your code will be fed at runtime, but as a developer you can write
code that is self-consistent with function and type signatures.

Adding type-hints without enforcement is a common anti-pattern.
Mypy is separately installed from Python and its typing modules -- it
is up to the developer to actually validate type-hints after adding them.
Code with contradictory typing documentation can mislead
developers and users alike. Mypy is that bridge between type-aesthetics
and type-correctness.

Mypy involves three main modules:
- [mypy](https://github.com/python/mypy): A source code parsing and
    applying PEP constraints.
- [typeshed](https://github.com/python/typeshed): Type-stubs core and
    3rd party libraries; code whose implementations are
    correctness-checked when used in new code.
- [typing](https://github.com/python/typing): Modules for compatibility
    between python versions.

All three of these modules are regularly used when using mypy (`typing`
less so if you only suport one Python version). One addendum is that you
can define custom type stubs in your own code, in the same manner `typeshed`
provides type stubs for popular pip packages, like
[boto](https://github.com/python/typeshed/tree/master/stubs/boto/boto)
and
[requests](https://github.com/python/typeshed/tree/master/stubs/requests/requests).

## Examples

### Typing inconsistency

We use `mypy` in Doltpy 2.0 to help ensure code-quality. Below is an
an example from Doltpy 1.0 to demonstrate mypy in action:

```python
def log(self, number: int = None, commit: str = None) -> OrderedDict:
    args = ["log"]:
    if number:
        args.extend(["--number", number])
```

Inside the `log` function signature, `number: int` correctly reflects the developer intent,
but `args: List[str]` disallows integers. This means that calling `Dolt.log(1)`
fails with an error, while `Dolt.log("1")` succeeds.

The intended behavior is clear, and mypy preemptively notices the inconsistency:
```bash
> python -m mypy .
example.py:4: error: List item 1 has incompatible type "int"; expected "str"
```

fixing the type inconsistency restores the expected behavior:
```python
def log(self, number: int = None, commit: str = None) -> OrderedDict:
    args = ["log"]:
    if number:
    args.extend(["--number", str(number)])
```

and makes mypy happy:
```bash
> python -m mypy .
Success: no issues found in 1 source file
```

### Custom typing stub

As a final example, here are first few lines for a custom type stub of the
`doltpy.cli.Dolt`
[class](https://github.com/dolthub/doltpy/blob/master/doltpy/types/dolt.py])
in doltpy:
```python
class DoltT(Generic[_T]):
    _repo_dir: str

    @abc.abstractmethod
    def repo_dir(self):
        ...

    @staticmethod
    @abc.abstractmethod
    def init(repo_dir: Optional[str] = None) -> "Dolt":  # type: ignore
        ...
```

After defining `class Dolt(DoltT)`, mypy will enforce our interface
the same way mypy enforces standard library and other 3rd party type
stubs. As a plus, code editors like VSCode should also give hints for
function signature definitions.

## Summary

In this post I touched on the utility of using type-hints
with mypy, and the comparative pitfalls of using type-hints without.
We used specific examples from Doltpy to highlight the nature
of static type-checking, and how we use mypy in production at Dolthub.

Are you interested in learning more about Dolt and Doltpy?
[Try it out](https://docs.dolthub.com/getting-started/installation).
If you have any questions, come chat with us in our
[Discord](https://discord.com/invite/RFwfYpu).

