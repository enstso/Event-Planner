import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    // Lazy-load the AuthModule only when the user navigates to /auth/*
    // This improves performance by splitting the bundle.
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'events',
    // Lazy-load the EventsModule only when navigating to /events/*
    loadChildren: () =>
      import('./features/events/events.module').then(m => m.EventsModule),
    // Protect all /events routes behind authentication
    // Users must be logged in to access any event page.
    canActivate: [AuthGuard]
  },
  {
    path: '',
    // Redirect the root URL to /events
    redirectTo: 'events',
    pathMatch: 'full'
  },
  {
    path: '**',
    // Wildcard route for unknown URLs → redirect to /events
    redirectTo: 'events'
  }
];
