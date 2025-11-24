# 📅 Event Planner — Angular, Tailwind, JSON Server

Event Planner is a full Angular application built **from scratch** as a final project.
It allows authenticated users to browse upcoming events, register for them, and manage their own registrations.
Admins can create, edit, and delete events.

The project follows **SOLID principles**, uses **standalone components**, and includes custom pipes, directives, validators, authentication, routing, reactive forms, services, and full HTTP interactions.

---

## 🚀 Features

### 🔐 Authentication

* User registration + login
* Local storage token persistence
* AuthGuard to protect `/events/*`
* RoleGuard to restrict admin actions
* Auth interceptor adding Authorization headers

### 📅 Events

* List of upcoming events
* Event detail page
* Create & edit events (ADMIN only)
* Remaining seats calculation
* Prevent double registration
* Highlight events happening soon (custom directive)

### 🧾 Registrations

* Register to an event
* Cancel registration
* View all your registrations
* Real-time UI updates

### 🎨 UI & UX

* Responsive layout with **TailwindCSS**
* Clean event cards
* Header showing user email & role
* Notification system auto-closing after 3 seconds

### 🧰 Angular Assignment Requirements

✔ Authentication
✔ Routing (with params)
✔ Standalone components
✔ Inputs/Outputs
✔ Services
✔ HTTP (JSON Server)
✔ Reactive Forms + Custom Validators
✔ Custom Pipe (`eventStatus`)
✔ Custom Directive (`highlightUpcoming`)
✔ Organized & SOLID architecture

---

## 🗂 Project Structure

```
src/
 ├── app/
 │   ├── core/
 │   │    ├── dto/
 │   │    ├── guards/
 │   │    ├── interceptors/
 │   │    ├── models/
 │   │    ├── services/
 │   ├── features/
 │   │    ├── auth/
 │   │    ├── events/
 │   ├── shared/
 │   │    ├── components/
 │   │    ├── directives/
 │   │    ├── pipes/
 │   ├── app.routes.ts
 │   ├── app.config.ts
```

---

# 🧭 Routing

The app uses **lazy-loaded modules** and guards to protect sensitive routes.

## 🔝 Top-level routes (`app.routes.ts`)

```ts
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.module').then(m => m.EventsModule),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: '**', redirectTo: 'events' }
];
```

### Explanation

* `/auth/**` → Public routes (login, register)
* `/events/**` → Protected
* `/events/new` & `/events/:id/edit` → ADMIN only via `RoleGuard`
* Default redirect to `/events`

---

## 🔐 Auth routes

```ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
```

---

## 📅 Event routes

```ts
const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'my-registrations', component: MyRegistrationsComponent },
  {
    path: 'new',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: ':id/edit',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: ':id', component: EventDetailComponent }
];
```

---

# 🗄 JSON Server

Start backend:

```bash
npm run json-server
```

Runs on:

```
http://localhost:3000
```

### `db.json` Example

```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "password": "Admin123!",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    {
      "id": 2,
      "email": "john@example.com",
      "password": "User123",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  ],
  "events": [],
  "registrations": []
}
```

---

# 🔑 Test Accounts

## 👑 Admin Account

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@example.com` |
| Password | `Admin123!`         |
| Role     | ADMIN               |

---

## 👤 User Account

| Field    | Value              |
| -------- | ------------------ |
| Email    | `john@example.com` |
| Password | `User123`          |
| Role     | USER               |

---

# 🛠 Environment

`src/environments/environment.ts`

```ts
export const environment = {
  apiUrl: 'http://localhost:3000'
};
```

---

# 🧪 Technologies Used

| Technology  | Purpose            |
| ----------- | ------------------ |
| Angular 17+ | Frontend framework |
| TailwindCSS | Styling            |
| JSON Server | Mock backend       |
| RxJS        | Reactivity         |
| SOLID       | Architecture       |
| TypeScript  | Strong typing      |

---

# 🛠 Angular Features

### ✔ Custom Validators

* `passwordMatchValidator`
* `eventDateRangeValidator`

### ✔ Custom Pipe

* `eventStatus`

### ✔ Custom Directive

* `highlightUpcoming`

### ✔ Standalone Components

* `HeaderComponent`
* `EventCardComponent`

### ✔ Feature Components

Auth: Login, Register
Events: List, Detail, Form, My Registrations

### ✔ Services

* AuthService
* EventsService
* NotificationService
* ApiService

### ✔ Guards

* AuthGuard
* RoleGuard

### ✔ Interceptors

* authInterceptor

---

# 🤖 Continuous Integration (CI) — GitHub Actions

This project includes a **CI pipeline** using GitHub Actions.

## 🧪 What the CI Does

| Step                 | Purpose                      |
| -------------------- | ---------------------------- |
| Checkout code        | Get repository               |
| Setup Node           | Install Node 20 with caching |
| Install dependencies | `npm ci`                     |
| Run tests            | Headless Chrome              |
| Build                | Production build             |

Ensures PRs never break the app.

---

## 📄 CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --watch=false --browsers=ChromeHeadless

      - name: Build app
        run: npm run build -- --configuration=production
```

---

# 📦 Installation

```bash
git clone https://github.com/enstso/Event-Planner
cd event-planner
npm install
npm run json-server
npm start
```

Or both:

```bash
npm run dev
```

---

# 🎉 Demo Features

### User

✔ Login
✔ Register
✔ See own registrations

### Admin

✔ Create events
✔ Edit events
✔ Delete events

### System

✔ Seat tracking
✔ Prevent double registration
✔ Real-time UI update

---

# 🧹 Scripts

| Command               | Description   |
| --------------------- | ------------- |
| `npm start`           | Start Angular |
| `npm run json-server` | Start backend |
| `npm run dev`         | Start both    |
| `npm test`            | Run tests     |
| `npm run build`       | Build prod    |

---

# 🏁 Conclusion

This project demonstrates:

✔ Clean Angular architecture

✔ Standalone components

✔ Reactive HTTP services

✔ Custom validators, pipes, directives

✔ Realistic event management system

✔ TailwindCSS

✔ **Automated CI pipeline with GitHub Actions**
