import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventFormComponent } from './event-form/event-form.component';
import { MyRegistrationsComponent } from './my-registrations/my-registrations.component';
import { RoleGuard } from '../../core/guards/role.guard';

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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule {}
