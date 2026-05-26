# Event Dress Rental

מערכת להשכרת שמלות לאירועים — Angular frontend + ASP.NET Core Web API backend + Python AI service.

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | Angular 21 (standalone components, PrimeNG) |
| Backend | ASP.NET Core Web API (.NET 9) |
| ORM | Entity Framework Core (Database-First) |
| DB | Microsoft SQL Server |
| Cache | Redis (Docker) |
| AI Service | Python (FastAPI) — `localhost:8001` |
| Logging | NLog |
| Tests | xUnit + Moq |

---

## מבנה הפרויקט

```
PROJECT!/
├── Client/                  # Angular app
│   └── src/app/
│       ├── components/
│       │   ├── chat-component/        # AI chatbot
│       │   ├── filter-bar-component/  # סינון + חיפוש סמנטי
│       │   └── list-models-component/ # גריד שמלות + תוצאות חיפוש
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

## הפעלה מקומית

### 1. Redis (Docker)
```bash
cd server/WebApiShop
docker-compose up -d
```

### 2. Python AI Service
```bash
# נדרש להיות רץ על localhost:8001
# endpoints: POST /chat, POST /search
```

### 3. Backend
```bash
cd server/WebApiShop
dotnet run
# רץ על https://localhost:44362
```

### 4. Frontend
```bash
cd Client
npm install
npm start
# רץ על http://localhost:4200
```

---

## פיצ'רים

### AI Chatbot
- כפתור צ'אט קבוע בפינה — נפתח כחלון שיחה
- שולח הודעה + היסטוריה + רשימת מוצרים מה-DB ל-Python AI
- רשימת המוצרים נשמרת ב-Redis (TTL שעה) — DB נשאל פעם אחת בלבד
- עיצוב בסגנון האתר: צבע `#6b5b5e`, RTL, אנימציית typing

**זרימה:**
```
Angular → POST /api/Chat → .NET (מוסיף products מ-Redis/DB) → Python /chat → תשובה
```

### חיפוש סמנטי
- שדה חיפוש בסרגל הסינון — מופעל עם Enter או "החל סינון"
- שולח שאילתה + רשימת מוצרים ל-Python AI לחיפוש וקטורי
- תוצאות מוצגות כאותם כרטיסי מוצר בגריד
- איפוס חיפוש מחזיר לרשימה הרגילה
- רשימת המוצרים נשמרת ב-Redis (אותו cache key עם ChatController)

**זרימה:**
```
Angular → POST /api/Search → .NET (מוסיף products מ-Redis/DB) → Python /search → כרטיסים
```

---

## Redis Cache

- מוגדר ב-`docker-compose.yml` עם סיסמה
- `appsettings.json` → `ConnectionStrings.Redis`
- `ChatController` ו-`SearchController` משתמשים באותו cache key: `product_list`
- TTL: שעה אחת

---

## הוראות לסוכן קוד

ראה `.github/INSTRUCTION.md` לסיכום כללי.
ראה `.github/INSTRUCTION_CONTROLLERS.md` לפרטים על Controllers.
ראה `.github/INSTRUCTION_REPOSITORIES.md` לפרטים על Repositories.
