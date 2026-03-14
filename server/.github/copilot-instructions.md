# Event Dress Rental — Copilot Instructions

## Summary
This solution is an ASP.NET Core Web API for an event dress rental system. It exposes CRUD-style endpoints for categories, models, dresses, orders, users, and authentication. It uses a **three-layer architecture** (Web API → Services → Repositories) backed by EF Core entities, plus DTOs and AutoMapper.

## Tech stack
- **Language & runtime**: C# on .NET 9 (SDK-style projects).
- **Web API**: ASP.NET Core (controllers, JWT auth, Swagger).
- **Data access**: Entity Framework Core with SQL Server; EF Core Power Tools generated context.
- **Mapping**: AutoMapper.
- **Logging**: NLog (file + mail targets).
- **Tests**: xUnit + Moq + Moq.EntityFrameworkCore.

## Project structure
The README describes conceptual folders (e.g., `DressRental.API`, `DressRental.Services`, `DressRental.Repositories`). In this repo, those map to the actual folders below:
- `WebApiShop/` — ASP.NET Core Web API host (controllers, middleware, appsettings, Swagger, NLog).
- `Services/` — business logic (interfaces + implementations, AutoMapper profile).
- `Repositories/` — data access (interfaces + EF Core repositories + `EventDressRentalContext`).
- `Entities/` — EF Core entity classes.
- `DTOs/` — request/response DTOs (mostly C# `record` types).
- `Tests/` — unit/integration tests for repository and service layers.

## Coding guidelines
- Follow `.editorconfig` naming rules:
  - Types/methods: PascalCase.
  - Parameters: camelCase.
  - Private fields: `_camelCase`.
- Prefer **async** EF Core methods and `SaveChangesAsync`.
- Keep controllers thin: delegate logic to services; services call repositories.
- Use DTOs (records) and AutoMapper for API contracts.
- Don’t edit the auto-generated `EventDressRentalContext` directly unless you’re regenerating it.
- Controllers and services use constructor dependency injection.

## Configuration & environment notes
- Connection strings are in `WebApiShop/appsettings.Development.json`.
- App configuration stays in `appsettings.json` files (avoid hard-coding settings in code).
- JWT `TokenKey` is stored in appsettings; keep it out of logs and commits if changed.
- NLog is configured in `WebApiShop/nlog.config` (file + email targets); verify local paths and credentials before enabling email.
- CORS policy allows `http://localhost:4200` (Angular dev server).

## Build, run, and test
Use PowerShell syntax on Windows.

### Build solution
```powershell
dotnet build .\EventDressRental.sln
```

### Run API
```powershell
dotnet run --project .\WebApiShop\EventDressRental.csproj
```

### Run tests
Unit tests use Moq. Integration tests expect a local SQL Server instance and will create a `Test` database.
```powershell
dotnet test .\Tests\Tests.csproj
```

To run only unit tests (skip integration DB tests), use a filter by namespace or class name in `Tests/TestRepository/UnitTest`.

## Existing tools and resources
- EF Core Power Tools config: `Repositories/efpt.config.json`.
- Swagger enabled in Development (root path `/` shows UI).
- Middleware:
  - `ErrorHandlingMiddleware` returns 500 and logs.
  - `RatingMiddleware` records request metadata to `Rating` table via `IRatingService`.

## Common patterns
- Add a new feature end-to-end: update **Entity → DTO → Repository → Service → Controller**.
- Register new services/repositories in `WebApiShop/Program.cs`.
- Add unit tests under `Tests/TestService` or `Tests/TestRepository/UnitTest`.
