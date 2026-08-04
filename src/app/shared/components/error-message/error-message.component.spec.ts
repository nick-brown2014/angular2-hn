import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let component: ErrorMessageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the message it is given', () => {
    component.message = 'Could not load news stories.';
    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('p.strong');
    expect(message.textContent).toBe('Could not load news stories.');
  });

  it('renders the offline hint', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('offline');
  });
});
