Repository onboarding — quick INSTRUCTION

Purpose
- Short guide for an automated coding agent seeing this repo for the first time.

Top-level summary
- This project is "Event Dress Rental" — ASP.NET Core Web API backend (net9.0) + Angular client. The server code is under `server/` and the client under `Client/`.

What to open first
- `server/WebApiShop/Program.cs` to see DI and server configuration.
- `Client/src/app/app.config.ts` to see how the new HttpClient is provided and interceptors are registered.

Key run commands (Windows PowerShell)
- Start Redis (local dev):
  cd "<repo-root>"; docker compose -f docker-compose.redis.yml up -d
- Run server:
  cd "server/WebApiShop"; dotnet run
- Run client (Angular):
  cd "Client"; npm install; npm start

Where to put focused guidance
- This file is a short entry. For deeper, context-rich instructions about Repositories and Controllers, see the separate files in `.github/`:
  - `INSTRUCTION_REPOSITORIES.md`
  - `INSTRUCTION_CONTROLLERS.md`

Coding practices summary
- Preserve existing DI registrations in `Program.cs` when adding services/repositories.
- Use the existing AutoMapper profiles.
- For async operations prefer Task-based signatures.

If anything fails
- Run `dotnet build` in `server/WebApiShop` and inspect errors.
- Check `appsettings.json` for missing connection strings (SQL Server, Redis).

Limit: keep edits small and localized; prefer to add features in Services/Repositories and expose through Controllers.
