INSTRUCTION: Repositories (detailed)

Purpose
- This file contains repository-layer guidance. Repositories live in `server/Repositories/` and abstract data access (Entity Framework Core).

What they do
- Repositories perform CRUD and queries against `EventDressRentalContext` (EF Core DbContext).
- They return Entities defined under `server/Entities` and sometimes tuples like `(List<Model> Items, int TotalCount)` for paging.

Naming and patterns
- Interfaces are `I{name}Repository` and implementations are `{Name}Repository`.
- Keep methods async and return `Task<T>`.
- Avoid leaking EF Core types outside repositories; map to DTOs in Services using AutoMapper.

Common pitfalls
- Don't change the `EventDressRentalContext` registration in `Program.cs` (it configures SQL Server connection string key `Home`).
- Avoid calling `.ToList()` or enumerating queries in Controllers; keep that inside Repositories or Services.

Cache invalidation
- Repository changes that affect public lists (eg. Models, Dresses) should trigger cache invalidation in the Service layer (not in Controllers). See `server/Services/ModelService.cs` for an example that deletes Redis keys matching `*Models_*`.

Tests
- Unit tests for Repositories are under `server/Tests/TestRepository`. Use their style as reference.

Where to look for details
- `server/Repositories/ModelRepository.cs` and `IModelRepository.cs` show the expected shapes and return types.

When adding a new Repository
- Add interface to `server/Repositories/` and implementation.
- Register it in `Program.cs` with `AddScoped<IYourRepository, YourRepository>();`
- Add unit tests in `server/Tests/TestRepository`.
