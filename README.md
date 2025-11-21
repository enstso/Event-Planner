# 📅 Event Planner — Angular, Tailwind, JSON Server

Event Planner is a full Angular application built **from scratch** as a final project.
It allows authenticated users to browse upcoming events, register for them, and manage their own registrations.
Admins can create, edit, and delete events.

The project follows **SOLID principles**, uses **standalone components**, and includes **custom pipes, directives, validators, authentication, routing, reactive forms, services, and HTTP interactions**.

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
* Create and edit an event (Admin only)
* Remaining seats calculation
* Automatic UI update on registration
* Highlight events happening soon (custom directive)

### 🧾 Registrations

* Register to an event
* Prevent double registration
* Cancel registration
* View all your registrations

### 🎨 UI & UX

* Responsive layout with **TailwindCSS**
* Clean event cards
* Header showing user email and role
* Notification system auto-closing after 3 seconds

### 🧰 Angular Requirements (As per assignment)

* ✔ Authentication (login + register)
* ✔ Routing (multiple routes, route params)
* ✔ Components (with Input + Output + reused components)
* ✔ Services (more than 2)
* ✔ HTTP communication (JSON Server)
* ✔ Reactive Forms (with custom validator)
* ✔ Custom pipe (`eventStatus`)
* ✔ Custom directive (`highlightUpcoming`)
* ✔ SOLID-compliant architecture

---

## 🗂 Project Structure

```txt
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
````

---

## 🧭 Routing

The application uses **lazy-loaded feature modules** and guards to protect and structure the routes.

### 🔝 Top-level routes (`app.routes.ts`)

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
    canActivate: [AuthGuard] // user must be authenticated
  },
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'events'
  }
];
```

**Explanation:**

* `/auth/**` → lazy-loads the **AuthModule** (public routes).
* `/events/**` → lazy-loads the **EventsModule**, protected by `AuthGuard` → only authenticated users can access events.
* `/` → redirects to `/events`.
* Any unknown route (`**`) → redirects to `/events`.

---

### 🔐 Auth routes (`AuthRoutingModule`)

```ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
```

**Main routes:**

* `/auth/login`
  → Login page with email/password + reactive form + validation.

* `/auth/register`
  → Registration page (first name, last name, email, password, confirm password)
  → Uses custom validator `passwordMatchValidator`.

---

### 📅 Event routes (`EventsRoutingModule`)

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

**Main routes:**

* `/events`
  → **EventListComponent**
  → Shows all upcoming events in a card layout.
  → Displays remaining seats, status (`Upcoming / Ongoing / Finished`), and a “Register” button.

* `/events/my-registrations`
  → **MyRegistrationsComponent**
  → Shows all events the currently logged-in user is registered to.
  → Allows cancelling a registration.

* `/events/new`
  → **EventFormComponent** in **create mode**.
  → Protected by `RoleGuard` with `data: { roles: ['ADMIN'] }`.
  → Only admins can create new events.

* `/events/:id/edit`
  → **EventFormComponent** in **edit mode**.
  → Also protected by `RoleGuard` (admin only).
  → Loads event data, allows editing and saving changes.

* `/events/:id`
  → **EventDetailComponent**
  → Displays full details of a single event.
  → Shows capacity and remaining seats, status, and admin-only management buttons (`Edit`, `Delete`).

**Guards used:**

* `AuthGuard` (top-level on `/events`)
  → Redirects unauthenticated users to `/auth/login`.

* `RoleGuard` (on `/events/new` and `/events/:id/edit`)
  → Reads `data.roles` and checks the current user role (`ADMIN` / `USER`).
  → If role is not allowed, redirects to `/events`.

---

## 🧪 Technologies Used

| Technology                | Role                        |
| ------------------------- | --------------------------- |
| **Angular 17+**           | SPA framework               |
| **Standalone Components** | Modern Angular architecture |
| **TailwindCSS**           | Styling                     |
| **JSON Server**           | Fake REST API backend       |
| **RxJS**                  | Reactive patterns           |
| **TypeScript**            | Strong typings              |
| **SOLID principles**      | Architecture                |

---

## 📦 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/enstso/Event-Planner
cd event-planner
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start JSON Server

In a separate terminal:

```bash
npm run json-server
```

This starts a mock backend at:

```
http://localhost:3000
```

### 4️⃣ Start Angular

```bash
npm start
```

Or:

```bash
ng serve
```

Application will be available at:

```
http://localhost:4200
```

Or run both:

```bash
npm run dev
```

---

## 🗄 JSON Server Structure

Example `db.json`:

```json
{
  "users": [],
  "events": [],
  "registrations": []
}
```

Each collection is used by Angular’s `ApiService` for CRUD operations.

---

## 🔧 Environment Configuration

`src/environments/environment.ts`:

```ts
export const environment = {
  apiUrl: 'http://localhost:3000'
};
```

---

## 🛠 Key Angular Features Used

### ✔ Custom Validator

`passwordMatchValidator` and `eventDateRangeValidator`

### ✔ Custom Pipe

`eventStatus` — returns `Upcoming`, `Ongoing`, or `Finished`

### ✔ Custom Directive

`highlightUpcoming` — highlights events happening within 7 days

### ✔ Input & Output

`EventCardComponent` uses:

* `@Input() event`
* `@Input() remainingSeats`
* `@Output() register`

### ✔ Standalone Components

Header, EventCard, EventDetail, EventForm, etc.

### ✔ SOLID Architecture

* `AuthService` handles only auth logic
* `EventsService` handles only event + registration API
* `NotificationService` handles all toast messages
* Components stay dumb & UI-focused

---

## 🎉 Demo Features

### 👤 User

* Login & logout
* Register an account
* See their email in the header

### 📝 Event Management

* Admin can create, edit, delete events
* Regular users cannot

### 🪑 Registration Logic

* Accurate remaining seats
* Prevent multiple registrations
* Disable register button when event is full
* Hide register button if event is finished

---

## 🧹 Scripts

| Script                | Description     |
| --------------------- | --------------- |
| `npm run start`       | Run Angular     |
| `npm run json-server` | Run JSON Server |
| `npm run dev`         | Run Both        |
| `npm run build`       | Build project   |
| `npm test`            | Run tests       |

---

## 🏁 Conclusion

This project demonstrates:

* Solid Angular architecture
* Proper use of modules & standalone components
* Clean TypeScript & RxJS patterns
* Reactive forms + validation
* Realistic event/registration system
* UI polish with Tailwind

