import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
    el = fixture.nativeElement;
  });

  it('renders the message input', () => {
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();

    expect(el.querySelector('.error-section .strong').textContent).toBe('Could not load news stories.');
  });

  it('updates when the message input changes', () => {
    fixture.componentInstance.message = 'First';
    fixture.detectChanges();
    fixture.componentInstance.message = 'Second';
    fixture.detectChanges();

    expect(el.querySelector('.strong').textContent).toBe('Second');
  });

  it('always shows the offline-viewing hint and the skull graphic', () => {
    fixture.detectChanges();

    expect(el.textContent).toContain('visit this page with a network connection first');
    expect(el.querySelector('.skull .head .crack')).not.toBeNull();
  });
});
