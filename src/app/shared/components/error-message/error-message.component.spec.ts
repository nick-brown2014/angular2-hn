import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let component: ErrorMessageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the error message input', () => {
    component.message = 'Could not load news stories.';
    fixture.detectChanges();

    const message: HTMLElement = fixture.nativeElement.querySelector('.error-section p.strong');
    expect(message.textContent).toBe('Could not load news stories.');
  });

  it('renders the skull illustration and offline hint', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.skull')).toBeTruthy();
    expect(el.textContent).toContain('visit this page with a network connection first');
  });
});
