import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventFormComponent } from './event-form/event-form.component';
import { MyRegistrationsComponent } from './my-registrations/my-registrations.component';
import { RoleGuard } from '../../core/guards/role.guard';

// Defines all routes belonging to the Events feature module.
// These routes are loaded under the "/events" path from the main router.
const routes: Routes = [
  // /events → Shows the list of upcoming events
  { path: '', component: EventListComponent },

  // /events/my-registrations → Shows the user's registered events
  { path: 'my-registrations', component: MyRegistrationsComponent },

  // /events/new → Admin-only route to create a new event
  {
    path: 'new',
    component: EventFormComponent,
    canActivate: [RoleGuard],     // Uses RoleGuard to restrict access
    data: { roles: ['ADMIN'] }    // Only users with ADMIN role can access
  },

  // /events/:id/edit → Admin-only route to edit an existing event
  {
    path: ':id/edit',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // /events/:id → Public route showing details of a single event
  { path: ':id', component: EventDetailComponent }
];

@NgModule({
  // Registers the above child routes inside this feature module
  imports: [RouterModule.forChild(routes)],

  // Exposes RouterModule so children components can use routerLink
  exports: [RouterModule]
})
export class EventsRoutingModule {}
