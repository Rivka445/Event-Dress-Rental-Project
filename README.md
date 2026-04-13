# 👗 Event Dress Rental Ecosystem

### Enterprise-Grade Full-Stack Solution for Fashion Rental Management

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512bd4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-v17+-dd0031?logo=angular)](https://angular.io/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Overview

פתרון Full-Stack מלא לניהול מערכת השכרת שמלות אירועים, הכולל:

* Backend מבוסס **ASP.NET Core 9**
* Frontend מודרני מבוסס **Angular**
* ארכיטקטורה מבוססת **DDD + Clean Architecture**
* דגש על **Scalability, Security, Maintainability**

---

## 💎 Technical Highlights

* **Clean Architecture & DDD**
  חלוקה לשכבות: `Domain`, `Application`, `Infrastructure`

* **Asynchronous Pipeline**
  שימוש מלא ב־`async/await` לשיפור ביצועים ו־scalability

* **Repository Pattern + EF Core**
  הפרדת לוגיקה עסקית מגישה לנתונים

* **JWT Authentication**
  אימות והרשאות מבוססי Roles

* **Logging & Auditing (NLog)**
  ניטור שגיאות ורישום פעילות בטבלת `Rating`

---

## 🛠️ Stack & Tools

### Backend (`server/`)

* **Framework:** ASP.NET Core 9 (Web API)
* **ORM:** Entity Framework Core (Database First)
* **Mapping:** AutoMapper
* **DTOs:** C# Records (Immutable)
* **Testing:** xUnit, Moq, Integration Tests

### Frontend (`Client/`)

* **Framework:** Angular (SPA)
* **State Management:** RxJS + Services
* **Authentication:** HTTP Interceptors (JWT Injection)

---

## 📂 Project Structure

```text
├── 📂 Client/                # Angular SPA
├── 📂 server/
│   ├── 📂 WebApiShop/        # Controllers + Middleware
│   ├── 📂 Services/          # Business Logic
│   ├── 📂 Repositories/      # Data Access Layer
│   ├── 📂 Entities/          # EF Core Models
│   ├── 📂 DTOs/              # Data Transfer Objects
│   └── 📂 Tests/             # Unit + Integration Tests
```

---

## 🔄 Data Flow

```text
Client (Angular)
   ➔ Controllers (API)
      ➔ Services (Business Logic)
         ➔ Repositories (Data Access)
            ➔ SQL Server
```

---

## 📊 Database Schema

ישויות מרכזיות:

* **Users** – ניהול משתמשים והרשאות
* **Categories & Models** – קטלוג שמלות
* **Dresses** – מלאי לפי מידה וזמינות
* **Orders & OrderItems** – הזמנות והשכרות
* **Rating** – Auditing וניטור פעילות API

---


## 🧪 Testing & QA

### סוגי בדיקות:

* **Unit Tests**
  בדיקות לוגיקה בשכבת Services עם Moq

* **Integration Tests**
  בדיקות מול DB אמיתי עם `DatabaseFixture`

### הרצת בדיקות:

```bash
dotnet test server/Tests/Tests.csproj
```

---

## 🛡️ Security & Data Management

* **Separation of Concerns** – הפרדה מלאה בין שכבות
* **JWT Authorization** – Role-Based Access Control
* **Global Error Handling Middleware** – טיפול אחיד בשגיאות ללא חשיפת מידע רגיש

---

## 📈 Roadmap

* [ ] Dockerization (Docker + Compose)
* [ ] CI/CD עם GitHub Actions
* [ ] Azure Blob Storage לניהול תמונות

---

## 📫 Contact

נבנה על ידי **Rivka445**

* פתיחת Issues לשיפורים / באגים
* Pull Requests מתקבלים
