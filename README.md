# Event Dress Rental

A dress rental platform for events — Angular frontend + ASP.NET Core Web API backend + Python AI service.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 (standalone components, PrimeNG) |
| Backend | ASP.NET Core Web API (.NET 9) |
| ORM | Entity Framework Core (Database-First) |
| DB | Microsoft SQL Server |
| Cache | Redis (Docker) |
| AI Service | Python (FastAPI) — `localhost:8001` |
| Auth | JWT Bearer tokens |
| Logging | NLog |
| Tests | xUnit + Moq |

---

## Project Structure

```
PROJECT!/
├── Client/                  # Angular app
│   └── src/app/
│       ├── components/
│       │   ├── chat-component/        # AI chatbot widget
│       │   ├── filter-bar-component/  # Filters + semantic search
│       │   └── list-models-component/ # Dress grid + search results
│       └── services/
│           ├── chat-service.ts        # POST /api/Chat
│           └── search-service.ts      # POST /api/Search
└── server/
    ├── WebApiShop/          # API Controllers + Program.cs
    ├── Services/            # Business logic
    ├── Repositories/        # EF Core data access
    ├── Entities/            # DB models
    ├── DTOs/                # Request/Response shapes
    └── Tests/               # xUnit + Moq
```

---

## Running Locally

### 1. Redis (Docker)
```bash
cd server/WebApiShop
docker-compose up -d
```
Redis runs on `localhost:6379` with password `YourStrongPassword123` (change before production).

### 2. Python AI Service
```bash
# Must be running on localhost:8001
# Required endpoints: POST /chat, POST /search
```

### 3. Backend
```bash
cd server/WebApiShop
dotnet run
# Runs on https://localhost:44362
# Swagger UI available at https://localhost:44362 (Development only)
```

### 4. Frontend
```bash
cd Client
npm install
npm start
# Runs on http://localhost:4200
# Proxies /api → https://localhost:44362 via proxy.conf.json
```

---

## Configuration — appsettings.json

```json
{
  "TokenKey": "<your-jwt-secret-key>",
  "ConnectionStrings": {
    "Home": "<sql-server-connection-string>",
    "Redis": "localhost:6379,password=YourStrongPassword123"
  },
  "RedisCacheOptions": {
    "TTL_In_Seconds": 3600
  }
}
```

---

## Authentication — JWT

- All protected endpoints require `Authorization: Bearer <token>` header
- Token is signed with `TokenKey` from `appsettings.json`
- Issued by `TokenService` on login/register
- Swagger UI supports Bearer token input for testing

---

## Redis Cache

- Configured in `docker-compose.yml` — runs as a Docker container on port `6379`
- Password set via `--requirepass` in docker-compose and matched in `appsettings.json`
- `ChatController` and `SearchController` share cache key: `product_list`
- TTL: 1 hour — DB is queried only on first request, all subsequent requests served from cache
- Product list capped at 50 items to keep AI payload small

---

## Rate Limiting

- Policy: `PerIpPolicy` — Token Bucket per IP address
- Limit: 60 tokens, refill 1 token/second, queue up to 10 requests
- Exceeded requests → `429 Too Many Requests` with `Retry-After: 5` header

---

## CORS

- Allowed origin: `http://localhost:4200` (Angular dev server)
- Update to your production domain before going live

---

## Middleware Pipeline (in order)

1. HTTPS Redirection
2. CORS
3. Error Handling (global exception middleware)
4. Rating Middleware
5. Static Files
6. Authentication
7. Authorization
8. Controllers

---

## Features

### AI Chatbot
- Chat button fixed on every page (`<app-chat>` in `app.html`)
- Sends message + conversation history + real product list from DB to Python AI
- Product list served from Redis cache — DB queried only once per hour
- Validation: empty message → 400, message over 1000 chars → 400
- Styled to match the site: color `#6b5b5e`, RTL, typing animation, Hebrew welcome message

**Flow:**
```
Angular → POST /api/Chat → .NET (injects products from Redis/DB) → Python /chat → reply
```

### Semantic Search
- Search field in the filter bar — triggered only on Enter or "Apply Filters"
- Sends query + product list to Python AI for vector search
- Results displayed as product cards in the same grid
- Clearing search restores the normal product list
- Validation: empty query → 400, query over 500 chars → 400

**Flow:**
```
Angular → POST /api/Search → .NET (injects products from Redis/DB) → Python /search → cards
```

---

## Before Going Live

| Action | Location |
|--------|----------|
| Replace `allow_origins=['*']` with your actual domain | Python AI service |
| Set system prompt with store-specific rules | Python AI service |
| Replace `TokenKey` with a strong secret | `appsettings.json` |
| Update Redis password | `appsettings.json` + `docker-compose.yml` |
| Update CORS allowed origin | `Program.cs` |

---

## Agent Instructions

See `.github/INSTRUCTION.md` for a general overview.
See `.github/INSTRUCTION_CONTROLLERS.md` for Controllers guidance.
See `.github/INSTRUCTION_REPOSITORIES.md` for Repositories guidance.
