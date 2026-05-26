INSTRUCTION: Controllers (detailed)

Purpose
- Controllers are the HTTP surface, located at `server/WebApiShop/Controllers/`.
- They are thin: call Services, return DTOs or status codes.

Patterns
- Controllers inject Services (eg. `IModelService`) via constructor DI and call service methods.
- Keep controller logic minimal: validate model state and forward to service.

Routing and swagger
- Controllers rely on default routing and are exposed via Swagger in Development (see `Program.cs`).
- If you add new endpoints, update Swagger annotations if needed (current project uses Swashbuckle).

Authentication/Authorization
- Authentication is configured via JWT in `Program.cs`. Use the `[Authorize]` attribute on controllers or actions as required.

Error handling
- Global error handling middleware is used (`app.UseErrorHandling()` in `Program.cs`). Prefer throwing service-level exceptions and let middleware map them to responses.

When adding controllers
- Add controller class under `server/WebApiShop/Controllers`, inject required services, keep actions short.
- Use DTOs from `server/DTOs` for inputs/outputs.

Testing controllers
- There are tests under `server/Tests/`—mirror the existing tests for routing and behavior.

Notes about unrelated tokens/questions
- Repositories and Controllers are detailed and should have their own focused instructions (this file). Avoid using these files for unrelated tool tokens or filler content — keep them focused on code and runtime guidance.
