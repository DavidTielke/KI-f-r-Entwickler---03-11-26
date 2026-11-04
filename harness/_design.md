# Backend Design Contract — People Manager

Binding design decisions for the backend (`/code/backend`). Every new feature MUST follow these patterns exactly.

**The rule file `harness/_design.ndrules` is authoritative.** If this contract and the rule file disagree, the rule file wins and this contract must be corrected — never the other way round. IDs in parentheses name the enforcing rule; statements without an ID cannot be checked statically (see §7).

Code style: see `harness/_code.md`. `{X}` = entity singular, `{Xs}` = plural (`y` → `ies`, otherwise `+ s`), `{Y}` = related principal entity.

## 1. Architecture

- 2-tier: Controller → `AppDbContext` (EF Core) → SQLite, compiled into `Backend.dll`.
- **No** additional layers: no type name outside `Backend.Migrations` may end in `Service`, `Repository`, `Manager`, `Handler`, `Mediator`, `UnitOfWork`, `Factory`, `Provider`, `Helper`, `Util` or `Utils` (ARCH01).
- **No** interfaces in application code (ARCH02), no AutoMapper (ARCH04), no custom middleware, MVC filters or exception handlers (ARCH09).
- Namespaces = folders. Only these are allowed (ARCH03): `Backend.Controllers`, `Backend.Data`, `Backend.Data.Configurations`, `Backend.Dtos`, `Backend.Models`, `Backend.Migrations`, `Backend`, and the global namespace for `Program`.
- Layer dependencies:
  - `Backend.Models` uses no other `Backend.*` namespace (ARCH05).
  - `Backend.Dtos` uses no other `Backend.*` namespace; only DataAnnotations and `System` types (ARCH06).
  - `Backend.Data*` never uses `Backend.Controllers` or `Backend.Dtos` (ARCH07).
  - Entities are used only by `Backend.Data*`, `Backend.Controllers`, `Backend.Models` and `Backend.Migrations` (ARCH08).
- A new entity consists of **exactly 4 files** plus wiring:
  1. `Models/{X}.cs` · 2. `Dtos/{X}Dtos.cs` (DTO05) · 3. `Data/Configurations/{X}Configuration.cs` (EF02) · 4. `Controllers/{Xs}Controller.cs` (API02)
  + one `DbSet` line in `AppDbContext` (EF03) + an EF migration (`dotnet ef migrations add <Name>`).
- `Program.cs` (top-level statements) already handles: DI, SQLite connection (`DefaultConnection`), CORS (policy `FrontendCorsPolicy`, only `http://localhost:5173`), Swagger (dev only), auto-migration at startup (`db.Database.Migrate()`). New controllers need **no** registration; only touch `Program.cs` for genuinely new infrastructure.
- Every class in `Backend.Controllers` is an entity controller and must satisfy API01–API08. Test support is therefore not a controller: `POST /api/testdata/reset` is mapped in `Program.cs` (only with `EnableTestEndpoints=true`) and implemented in `Backend.Data.TestData`.

## 2. Entities (`Models/{X}.cs`)

Plain POCOs, **zero attributes** — mapping lives exclusively in configurations; entities use neither DataAnnotations nor EF Core types (ENT03):

```csharp
public class Person
{
    public int Id { get; init; }                      // int PK (ENT01), always first
    public string Name { get; set; } = string.Empty;  // strings default to string.Empty
    public int CategoryId { get; set; }               // FK: int {Y}Id ...
    public Category Category { get; set; } = null!;   // ...+ required nav = null! (ENT05)
}
```

- All properties are public with a public setter or `init` accessor (ENT04). Use `init` where the property is only set in object initializers, typically `Id` (see `harness/_code.md` §8).
- Only auto-properties: no methods, no computed logic, no parameterized constructors (ENT02).
- A navigation property requires a **non-nullable** `int {Y}Id` FK property (ENT05). An optional relationship therefore has **no** navigation property on either side, only the FK `int? {Y}Id`, and display names are read with a query.
- Principal side gets the inverse collection (ENT06): `public ICollection<{X}> {Xs} { get; set; } = new List<{X}>();`

## 3. DTOs (`Dtos/{X}Dtos.cs`)

One file per entity containing all of its DTO types; entities never leave the controller (ARCH08). The `Backend.Dtos` namespace contains only `*Request` and `*Response` types (DTO01), and every entity has both a `{X}Response` and a `{X}Request` (DTO05).

DTOs cannot reference `Backend.Models`, including enums declared there (ARCH06). A closed value set is a `string` on both the entity and the DTOs, and the request validates it with `[RegularExpression]`.

- **Response**: positional record (DTO02); `[property: JsonInclude]` marks each value as used by the serializer — carries the FK id **and** the related display name (e.g. `CategoryName`) so clients need no second call:

```csharp
public record PersonResponse(
    [property: JsonInclude] int Id,
    [property: JsonInclude] string Name,
    [property: JsonInclude] int CategoryId,
    [property: JsonInclude] string CategoryName);
```

- **Request**: mutable class with public setters, never a record (DTO06); no `Id` property (DTO03); `[JsonInclude]` marks each property as set by the serializer:

```csharp
public class PersonRequest
{
    [JsonInclude]
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [JsonInclude]
    [Required]
    [Range(0, 150)]
    public int Age { get; set; }

    [JsonInclude]
    [Required]
    public int CategoryId { get; set; }
}
```

- Validation attributes (`[Required]`, `[MaxLength]`, `[Range]`) are the single source of request validation; `[ApiController]` turns violations into automatic 400 responses. Every request type uses at least `[Required]` (DTO04). Limits MUST match the EF configuration.
- One request type is reused for both create and update (no separate Create/Update DTOs).

## 4. EF configuration (`Data/`)

- `AppDbContext` is the only `DbContext` (EF04). It has exactly one constructor, taking `DbContextOptions<AppDbContext>`, and no `OnConfiguring` (EF06): `public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)`.
- Sets are expression-bodied — `public DbSet<{X}> {Xs} => Set<{X}>();` (EF03).
- `OnModelCreating` calls `base` then `ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` — never add per-entity code there (EF05).
- Per entity: `public class {X}Configuration : IEntityTypeConfiguration<{X}>` in `Data/Configurations/` (EF01, EF02); that namespace contains nothing else. Statements in this order inside `Configure`:
  1. `builder.ToTable("{Xs}");` (PascalCase plural)
  2. `builder.HasKey(x => x.Id);`
  3. `builder.Property(x => x.Id).ValueGeneratedOnAdd();`
  4. Per property: `.IsRequired()` / `.HasMaxLength(n)` — identical limits as the DTO annotations.
  5. Relationships configured from the **dependent** side: `builder.HasOne(x => x.{Y}).WithMany(y => y.{Xs}).HasForeignKey(x => x.{Y}Id).OnDelete(DeleteBehavior.Restrict);` — always `Restrict`, never cascade. Without navigation properties: `builder.HasOne<{Y}>()`.
  6. `// Seed data` comment + `builder.HasData(...)` with explicit ids; every entity ships a handful of seed rows.

## 5. Controllers (`Controllers/{Xs}Controller.cs`)

Class shape (API01): name ends in `Controller`, `[ApiController]`, `[Route("api/{xs}")]` (lowercase plural, literal string — no `[controller]` token), `: ControllerBase`.

The only dependency is `AppDbContext`, injected through a primary constructor: `public class {Xs}Controller(AppDbContext db) : ControllerBase`. That is exactly one constructor with exactly one parameter (API03), and the captured parameter is the single private, immutable instance field (API04). No logging (API09).

Exactly these 5 actions per resource (API08) — all `async`/`await` returning `Task` (API05), **no** `Async` suffix on any method anywhere in the codebase (API06), public method names start with `Get`, `Create`, `Update` or `Delete` (API07), id-routes constrained `"{id:int}"`:

| Action | Route | Signature | Flow |
|---|---|---|---|
| `Get{Xs}()` | `GET` | `Task<ActionResult<IEnumerable<{X}Response>>>` | `AsNoTracking()` → `Include` needed navs → `OrderBy(x => x.Id)` → `Select` projection to DTO → `ToListAsync()` → `Ok(list)` |
| `Get{X}(int id)` | `GET {id}` | `Task<ActionResult<{X}Response>>` | `AsNoTracking()` + `Include` → `FirstOrDefaultAsync` → null ⇒ `NotFound()` → `Ok(new {X}Response(...))` |
| `Create{X}(request)` | `POST` | `Task<ActionResult<{X}Response>>` | FK check ⇒ 400 → `new {X} { ... }` from request → `Add` → `SaveChangesAsync` → `CreatedAtAction(nameof(Get{X}), new { id = x.Id }, response)` |
| `Update{X}(int id, request)` | `PUT {id}` | `Task<ActionResult<{X}Response>>` | `FindAsync(id)` ⇒ 404 → FK check ⇒ 400 → mutate props → `SaveChangesAsync` → `Ok(response)` |
| `Delete{X}(int id)` | `DELETE {id}` | `Task<IActionResult>` | `FindAsync(id)` ⇒ 404 → dependent check (`AnyAsync`) ⇒ 409 → `Remove` → `SaveChangesAsync` → `NoContent()` |

**Sanctioned exception — manual ordering (API08):** an entity with a user-controlled order (currently only `Person`, via `SortOrder`) additionally exposes one action whose name matches `Update{X}Position`: `Update{X}Position(int id, {X}PositionRequest request)` on `PUT "{id:int}/position"`. The request carries `TargetIndex` (zero-based position in the ordered list, validated via `[Required]` (DTO04) and `[Range(0, int.MaxValue)]`, and clamped server-side to the list bounds); the action loads all rows ordered by `SortOrder`, moves the entity to the target index, renumbers `SortOrder` sequentially (1-based) and returns **204**. The auxiliary `{X}PositionRequest` lives in the same `Dtos/{X}Dtos.cs` file. New persons get `SortOrder = max + 1` on create.

Method-level rules:
- **Reads** project to DTOs inside the query (`Select(x => new {X}Response(...))`); **writes** load via `FindAsync` and build the response DTO manually. Never return tracked entities or anonymous success bodies.
- Null checks use pattern matching with braces: `if (l_x is null) { return NotFound(); }` (404 has no body).
- **FK validation** precedes every write, and the loaded principal is reused for the response name:
  ```csharp
  var l_category = await db.Categories.FindAsync(request.CategoryId);
  if (l_category is null)
  {
      return BadRequest(new { message = $"Category with id {request.CategoryId} does not exist." });
  }
  ```
- **Referential guard** on principal delete: `await db.{Xs}.AnyAsync(x => x.{Y}Id == id)` ⇒ `Conflict(new { message = "Cannot delete {y} because {xs} are assigned to it." })`.
- Error bodies are always anonymous objects `new { message = "..." }` — full English sentences ending with `.`. No ProblemDetails, no error codes.
- Request DTOs are plain parameters (implicit `[FromBody]`); no `ModelState` checks (handled by `[ApiController]`, API10); no try/catch (no expected exceptions).

## 6. API conventions

- Routes: `api/{plural-lowercase}`; JSON camelCase (framework default); responses are bare DTOs/arrays — no envelope, no HATEOAS.
- Status codes: **200** GET/PUT · **201** POST via `CreatedAtAction` (Location header) · **204** DELETE · **400** validation (automatic + manual FK checks) · **404** unknown id · **409** referential conflict.
- List endpoints return everything ordered by `Id` (entities with manual ordering: by `SortOrder`, currently only `Person`) — **no** paging, filtering, sorting, search params, auth, or versioning (API11). Do not introduce any of these unprompted.
- Schema changes always go through a migration; never edit existing migrations or the snapshot by hand.

## 7. Enforcement (`harness/analyse_swd.py`)

Compliance is verified with NDepend against the rule file:

```
python harness/analyse_swd.py   # exit 0 = compliant, 1 = violations, 2 = check not possible
python harness/analyse_all.py   # build, then ReSharper (harness/_code.md) and NDepend
```

The rule file declares these points as **not statically enforceable**. They remain binding and must be reviewed manually: HTTP status-code mapping, `CreatedAtAction` usage, `AsNoTracking`/`OrderBy(Id)` in reads, anonymous `{ message }` error bodies, lowercase route strings and `{id:int}` constraints, DTO limits equal to EF limits, seed data presence, statement order in configurations, `DeleteBehavior.Restrict`, one request type for create and update, migration discipline, `string.Empty` property defaults, `Id`-first property order, responses carrying `{Y}Name`, absence of try/catch, and the `Program.cs` wiring (CORS policy, Swagger dev-only, auto-migration).
