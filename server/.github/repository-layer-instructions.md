# Repository Layer Instructions

These notes apply specifically to the `Repositories/` project and data access pattern.

## Responsibilities
- Implement data access against `EventDressRentalContext` (EF Core, SQL Server).
- This project follows **Database First** with EF Core Power Tools; treat the context/entities as generated.
- Keep repository methods **async** and return domain entities (not DTOs).
- Avoid business logic here; validations and mapping belong in Services.

## Structure & conventions
- Interfaces live alongside implementations (e.g., `ICategoryRepository` + `CategoryRepository`).
- Each repository is registered for DI in `WebApiShop/Program.cs` as scoped.
- Use the existing DbSets on `EventDressRentalContext` and maintain naming consistency.
- Save writes with `SaveChangesAsync`.
- Prefer `FindAsync`, `AnyAsync`, and `ToListAsync` for EF operations.

## Updating or adding repositories
1. **Add/Update interface** in `Repositories/`.
2. **Implement** the interface using `EventDressRentalContext`.
3. **Register** the repository in `WebApiShop/Program.cs`.
4. **Add unit tests** in `Tests/TestRepository/UnitTest` using Moq.EntityFrameworkCore.
5. If adding new entities or schema changes, update `Entities/` and consider regenerating the EF Core context (currently auto-generated).

## Testing guidance
- Unit tests mock `EventDressRentalContext` with `Moq.EntityFrameworkCore`.
- Integration tests in `Tests/TestRepository/IntegrationTest` use a **local SQL Server** and create a `Test` database (see `DatabaseFixture`). Expect failures if SQL Server isn’t available.
- Methods that use `ExecuteUpdateAsync` (e.g., soft deletes/status updates) don’t work with mocked DbSets; cover them with integration tests or mark unit tests as skipped.

## Watch-outs
- `EventDressRentalContext` is **auto-generated** by EF Core Power Tools; avoid manual edits unless you intend to regenerate.
- Keep repository methods deterministic and side-effect free beyond DB I/O.
- Maintain naming rules from `.editorconfig` (PascalCase for types/methods).
