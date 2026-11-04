# C# Coding Guideline — ReSharper Conventions

This guideline describes the C# code style that **ReSharper InspectCode enforces with the
rule file `harness/PersonManager.sln.DotSettings`** (the JetBrains defaults plus the
overrides in that file).

**The rule file is authoritative.** If this guideline and the rule file disagree, the rule
file wins and this guideline must be corrected — never the other way round.

All C# source code in this repository (currently `/code/backend`) MUST produce **zero
InspectCode findings** with that rule file (see §8). AI agents must apply these rules from
the first line of code they write — not as an afterthought or cleanup step.

---

## 1. Naming Conventions

| Element                                   | Style              | Example                       |
|-------------------------------------------|--------------------|-------------------------------|
| Namespaces                                 | `UpperCamelCase`   | `Backend.Data.Configurations` |
| Types (class, struct, enum, delegate)      | `UpperCamelCase`   | `PersonConfiguration`         |
| Interfaces                                 | `I` + `UpperCamelCase` | `IEntityTypeConfiguration` |
| Type parameters                            | `T` + `UpperCamelCase` | `TEntity`, `TResult`       |
| Methods                                    | `UpperCamelCase`   | `GetPersons()`                |
| Properties                                 | `UpperCamelCase`   | `CategoryId`                  |
| Events                                     | `UpperCamelCase`   | `DataChanged`                 |
| Public fields                              | `UpperCamelCase`   | `MaxRetries`                  |
| Protected/internal instance fields         | `UpperCamelCase`   | `CacheSize`                   |
| Private instance fields                    | `_` + `lowerCamelCase` | `_cache`                  |
| Private static fields (not readonly)       | `_` + `lowerCamelCase` | `_instanceCount`          |
| Constant fields                            | `UpperCamelCase`   | `DefaultPageSize`             |
| Static readonly fields                     | `UpperCamelCase`   | `EmptyResult`                 |
| Enum members                               | `UpperCamelCase`   | `OrderState.Shipped`          |
| Local variables                            | `l_` + `lowerCamelCase` | `l_personCount`          |
| Local constants                            | `lowerCamelCase` (no `l_`) | `maxAge`              |
| Parameters (including lambda and primary constructor parameters) | `lowerCamelCase` | `categoryId` |
| Async methods (returning `Task`/`Task<T>`) | **no** suffix (see §5) | `GetPersons()`            |

Additional naming rules:
- The `l_` prefix applies to **every** local variable: `var` declarations, `for`/`foreach`
  variables, `using`/`await using` variables, pattern variables, `out var`, deconstruction
  and `catch` variables. Lambda parameters, local function parameters and local constants
  take no prefix.
- Apart from the prefixes above: no Hungarian notation, no `m_` prefixes, no ALL_CAPS constants.
- Abbreviations of two letters stay uppercase (`Id` is the exception: `PersonId`, not `PersonID`).
- Event handlers: `On` + event name or `<Subject>_<Event>` only in generated code.

## 2. File & Type Organization

- **One top-level type per file**; file name matches the type name (`Person.cs` → `class Person`).
  Exception: `Dtos/{X}Dtos.cs` holds all DTO types of an entity (design rule DTO05).
- Namespace must **match the folder structure** relative to the project root
  (`Data/Configurations/PersonConfiguration.cs` → `Backend.Data.Configurations`).
- Prefer **file-scoped namespaces** (`namespace Backend.Models;`).
- `using` directives:
  - placed **at the top of the file, outside the namespace**,
  - `System.*` namespaces **sorted first**, then all others alphabetically,
  - **no unused usings** (ReSharper flags them immediately).
- Member order inside a type: fields → constructors → properties → methods (public before private is not enforced, but keep a consistent, logical order).

## 3. Formatting

- **Indentation: 4 spaces**, never tabs.
- **Braces: BSD/Allman style** — opening brace on its **own line** for *all* constructs
  (types, methods, properties, `if`, `for`, `while`, `try`, lambdas with block bodies):

  ```csharp
  public class Person
  {
      public int GetAge()
      {
          if (_birthDate == default)
          {
              return 0;
          }

          return CalculateAge(_birthDate);
      }
  }
  ```

- Maximum line length: **120 characters** (ReSharper default wrap margin); wrap longer lines.
- At most **one consecutive blank line** inside members; at most two between members.
- Spaces:
  - after control-flow keywords: `if (condition)`, `for (...)`, `while (...)`
  - **no** space between method name and parenthesis: `DoWork()`
  - around binary operators: `a + b`, `x == null`
  - after commas, none before: `Method(a, b, c)`
- One statement per line; one declaration per line.

## 4. Language & Syntax Style (ReSharper suggestions)

These are the styles ReSharper actively suggests with default settings — code must
already conform so no squiggles appear:

- **`var` everywhere**: use `var` for local variable declarations, including
  built-in types, whenever the type is evident from the right-hand side:
  ```csharp
  var l_count = 5;
  var l_persons = new List<Person>();
  var l_category = await db.Categories.FindAsync(id);
  ```
- **Built-in type keywords**, never CLR type names: `int`, `string`, `bool` — not `Int32`, `String`, `Boolean`.
- **Explicit access modifiers** on all types and members (`private` is written out, not implied).
- **Modifier order** (C# canonical order enforced by ReSharper):
  `public/protected/internal/private` → `new` → `abstract/virtual/override/sealed` → `static` → `readonly` → `extern` → `unsafe` → `volatile` → `async`.
- **No redundant `this.` qualifier** — only use it when required for disambiguation.
- **No redundant code** (ReSharper greys these out):
  - no unused parameters/variables, no redundant casts, no redundant parentheses,
  - no redundant base constructor calls, no empty argument lists on object initializers,
  - no redundant `else` after `return`/`throw`/`continue`/`break`.
- **Object & collection initializers** instead of sequential assignments:
  ```csharp
  var l_person = new Person { Name = "Alice", Age = 29 };
  ```
- **Expression-bodied members** for simple single-expression properties and accessors;
  regular block bodies for methods with logic:
  ```csharp
  public string DisplayName => $"{Name} ({Age})";
  ```
- **String interpolation** instead of `string.Format` or concatenation:
  `$"Category {id} not found"`.
- **`nameof(...)`** instead of string literals for symbol names.
- **Null-propagation and null-coalescing** where applicable: `person?.Category?.Name`, `value ?? fallback`.
- **Pattern matching** over `as` + null check: `if (obj is Person l_person)`.
- **Not-null pattern** for nullable values, never a type check that only tests for null:
  `if (request.PetId is { } l_petId)`, not `is int l_petId`.
- Prefer **`is null` / `is not null`** or `== null` consistently (do not mix styles in one file).
- **Invert `if` to reduce nesting** where it improves readability (ReSharper suggests early returns).
- Use **LINQ methods** where they simplify loops (ReSharper suggests e.g. `Where`/`Select`/`Any` conversions).
- **Primary constructors** instead of a constructor that only assigns parameters to fields
  (`ConvertToPrimaryConstructor`).

## 5. Async & Error Handling

- Async all the way: never block with `.Result` or `.Wait()`.
- **No `Async` name suffix in this codebase** — the design contract (rule API06 in
  `harness/_design.ndrules`) deviates from the common convention here and wins.
- Do not catch exceptions without handling them; never swallow with an empty `catch`.

## 6. Comments & Documentation

- Comments in **English**, explaining *why*, not *what*.
- XML doc comments (`///`) for public APIs where the intent is not obvious from the signature.
- No commented-out code in committed files.
- `// TODO:` only with a concrete description.

## 7. Compliance Example

A fully conformant snippet in this codebase looks like (style shown on a controller,
because the design contract `harness/_design.md` forbids service classes):

```csharp
using Backend.Data;
using Backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/persons")]
public class PersonsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonResponse>>> GetPersons()
    {
        var l_persons = await db.Persons
            .AsNoTracking()
            .Include(p => p.Category)
            .OrderBy(p => p.Id)
            .Select(p => new PersonResponse(p.Id, p.Name, p.Age, p.CategoryId, p.Category.Name))
            .ToListAsync();

        return Ok(l_persons);
    }
}
```

## 8. Enforcement (`harness/analyse_code.py`)

Compliance is verified with ReSharper InspectCode. Only the rule file and the JetBrains
defaults count; personal, global and solution-level settings are ignored:

```
python harness/analyse_code.py   # exit 0 = compliant, 1 = findings, 2 = check not possible
python harness/analyse_all.py    # build, then ReSharper and NDepend (harness/_design.md)
```

The rule file changes exactly one default (the `l_` prefix for local variables) and disables
**no** inspection. Every finding of severity SUGGESTION or higher must be fixed in the code,
including the `*.Global` inspections. Do not silence findings with `// ReSharper disable`
comments: that bypasses the rule file. Conventions at HINT severity (`var`, built-in type
keywords, no `this.`) are not reported by InspectCode, but they still apply.

Some inspections fire on members that only a framework uses, or on shapes the design rules
prescribe. These fixes satisfy both rule files:

| Finding | Where | Fix |
|---|---|---|
| `NotAccessedPositionalProperty.Global` | Response records (DTO02) | `[property: JsonInclude]` on each positional parameter |
| `UnusedAutoPropertyAccessor.Global`, `AutoPropertyCanBeMadeGetOnly.Global` | Request DTOs (DTO06) | `[JsonInclude]` on each property |
| `CollectionNeverUpdated.Global` | Collections in request DTOs | `IReadOnlyList<T>` instead of `List<T>` |
| `PropertyCanBeMadeInitOnly.Global` | Entity properties set only in initializers, typically `Id` (ENT04) | `{ get; init; }` |
| `ConvertToPrimaryConstructor` | Controllers, `AppDbContext` (API03, API04, EF06) | Primary constructor |

`[JsonInclude]` does not change the JSON contract of public properties.

---

**Rule of thumb:** if opening the file in Rider/ReSharper with the rule file would show any
squiggle, greyed-out code, or "Code cleanup" change — the code is not compliant.
