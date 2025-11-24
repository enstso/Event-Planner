import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCardComponent } from './event-card.component';
import { Event } from '../../../core/models/event.model';
import { By } from '@angular/platform-browser';
import { HighlightUpcomingDirective } from '../../directives/highlight-upcoming.directive';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

describe('EventCardComponent', () => {
  let component: EventCardComponent;
  let fixture: ComponentFixture<EventCardComponent>;

  const mockEvent: Event = {
    id: 1,
    title: 'Angular Meetup',
    description: 'A cool Angular event',
    location: 'Paris',
    startDate: '2099-05-01T10:00:00.000Z', // ✅ future date
    endDate: '2099-05-01T12:00:00.000Z',
    capacity: 50,
    organizerId: 1
  };

  beforeAll(() => {
    registerLocaleData(localeFr);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EventCardComponent);
    component = fixture.componentInstance;

    component.event = mockEvent;
    component.remainingSeats = 10;
    component.isRegistered = false;
    component.showRegisterButton = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render event title', () => {
    const titleEl: HTMLElement =
      fixture.debugElement.query(By.css('h3'))!.nativeElement;
    expect(titleEl.textContent).toContain(mockEvent.title);
  });

  it('should render formatted dates in fr-FR', () => {
    const paragraphs = fixture.debugElement.queryAll(By.css('p'));
    const dateEl: HTMLElement = paragraphs[1]!.nativeElement;

    expect(dateEl.textContent).toContain('2099');
  });

  it('should emit register event when clicking the button', () => {
    const emitSpy = spyOn(component.register, 'emit');

    const buttonDe = fixture.debugElement.query(By.css('button'));
    expect(buttonDe).not.toBeNull(); // ✅ now true

    buttonDe!.triggerEventHandler('mouseup', new MouseEvent('mouseup'));

    expect(emitSpy).toHaveBeenCalledWith(mockEvent.id);
  });

  it('should show "You are registered" when isRegistered=true', () => {
    component.isRegistered = true;
    fixture.detectChanges();

    const registeredSpanDe = fixture.debugElement.query(
      By.css('span.text-emerald-600')
    );
    expect(registeredSpanDe).not.toBeNull();
    expect(registeredSpanDe!.nativeElement.textContent)
      .toContain('You are registered');
  });

  it('should apply highlightUpcoming directive', () => {
    const highlightedDe = fixture.debugElement.query(
      By.directive(HighlightUpcomingDirective)
    );
    expect(highlightedDe).not.toBeNull();
  });
});
