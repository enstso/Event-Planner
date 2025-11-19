import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { EventsRoutingModule} from './events-routing.module';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventFormComponent } from './event-form/event-form.component';
import { MyRegistrationsComponent } from './my-registrations/my-registrations.component';
import { EventsService } from '../../core/services/events/events.service';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { EventStatusPipe } from '../../shared/pipes/event-status.pipe';
import { HighlightUpcomingDirective } from '../../shared/directives/highlight-upcoming.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EventsRoutingModule,
    EventCardComponent,
    EventStatusPipe,
    HighlightUpcomingDirective,
    EventDetailComponent,
    EventFormComponent,
    MyRegistrationsComponent,
    EventListComponent
  ],
  providers: [EventsService]
})
export class EventsModule {}
