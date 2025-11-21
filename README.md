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

* ✔ Authentication
* ✔ Routing (with params)
* ✔ Standalone components
* ✔ Inputs/Outputs
* ✔ Services
* ✔ HTTP (JSON Server)
* ✔ Reactive Forms + Custom Validators
* ✔ Custom Pipe (`eventStatus`)
* ✔ Custom Directive (`highlightUpcoming`)
* ✔ Organized & SOLID architecture

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

**Explanation:**

* `/auth/**` → Public routes (login, register)
* `/events/**` → Protected by `AuthGuard`
* `/events/new` and `/events/:id/edit` → ADMIN only via `RoleGuard`
* Default redirect to `/events`

---

## 🔐 Auth routes (`AuthRoutingModule`)

```ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
```

---

## 📅 Event routes (`EventsRoutingModule`)

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

The project uses **JSON Server** as a fake backend.
Start it with:

```bash
npm run json-server
```

Runs on:

```
http://localhost:3000
```

### Default `db.json` example (with working login accounts)

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

# 🔑 Test Accounts (Login Credentials)

You can use these accounts immediately.

## 👑 Admin Account

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@example.com` |
| Password | `Admin123!`          |
| Role     | ADMIN               |

Permissions:
✔ Create/Edit/Delete events
✔ View/Manage events
✔ Full access

---

## 👤 Standard User Account

| Field    | Value              |
| -------- | ------------------ |
| Email    | `john@example.com` |
| Password | `User123`          |
| Role     | USER               |

Permissions:
✔ View events
✔ Register for events
✔ Cancel registration
✘ Cannot create/edit events

---

# 🛠 Environment Configuration

`src/environments/environment.ts`

```ts
export const environment = {
  apiUrl: 'http://localhost:3000'
};
```

---

# 🧪 Technologies Used

| Technology            | Description         |
| --------------------- | ------------------- |
| Angular 17+           | Framework           |
| Standalone Components | Modern architecture |
| TailwindCSS           | Styling             |
| JSON Server           | Fake API            |
| RxJS                  | Reactivity          |
| TypeScript            | Strong typing       |
| SOLID                 | Clean architecture  |

---

# 🛠 Key Angular Features Used

### ✔ Custom Validators

* `passwordMatchValidator`
* `eventDateRangeValidator`

---

### ✔ Custom Pipe

* `eventStatus` (returns *Upcoming*, *Ongoing*, or *Finished*)

---

### ✔ Custom Directive

* `highlightUpcoming` (highlights events happening within 7 days)

---

### ✔ Standalone UI Components (Shared Components)

These are reusable UI components used throughout the application.

* `HeaderComponent` — App header displaying navigation + user info
* `EventCardComponent` — Event preview card reused in several pages

---

### ✔ Feature Components (Auth)

* `LoginComponent` — Login page with validation
* `RegisterComponent` — Register page with custom password validator

---

### ✔ Feature Components (Events)

* `EventListComponent` — Displays all events with status & register button
* `EventDetailComponent` — Full event details, remaining seats, admin controls
* `EventFormComponent` — Create/edit event (admin-only)
* `MyRegistrationsComponent` — Shows events the user is registered to

---

### ✔ Services

* `AuthService` — Authentication + local storage + user state
* `EventsService` — CRUD + registration logic
* `NotificationService` — Success/error messages auto-closing after 3s
* `ApiService` — HTTP wrapper for GET/POST/PUT/DELETE

---

### ✔ Guards

* `AuthGuard` — Protects `/events/**`
* `RoleGuard` — Protects admin-only routes

---

### ✔ Interceptors

* `authInterceptor` — Automatically attaches `Authorization: Bearer <token>`

---

# 📦 Installation

## 1️⃣ Clone repository

```bash
git clone https://github.com/enstso/Event-Planner
cd event-planner
```

## 2️⃣ Install dependencies

```bash
npm install
```

## 3️⃣ Start JSON Server

```bash
npm run json-server
```

## 4️⃣ Start Angular

```bash
npm start
```

App URL:

```
http://localhost:4200
```

## Or run both servers:

```bash
npm run dev
```

---

# 🎉 Demo Features

### 👤 User

* Login & logout
* Register account
* See email in header

### 📝 Admin

* Create new events
* Edit events
* Delete events

### 🎫 Registration System

* Register with seat tracking
* Prevent multiple registrations
* Cancel registration
* Real-time UI update

---

# 🧹 Available Scripts

| Command               | Description           |
| --------------------- | --------------------- |
| `npm run start`       | Start Angular app     |
| `npm run json-server` | Start JSON server     |
| `npm run dev`         | Run both concurrently |
| `npm run build`       | Production build      |
| `npm test`            | Run tests             |

---

# 🏁 Conclusion

This project demonstrates:

✔ Clean Angular architecture

✔ Smart use of standalone components

✔ Fully reactive services and HTTP interactions

✔ Custom validators, pipes, directives

✔ Realistic event management system

✔ Professional UI with TailwindCSS
