import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent]
    });

    fixture = TestBed.createComponent(ErrorMessageComponent);
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(element.querySelector('.error-section .skull')).toBeTruthy();
  });

  it('should render the message input', () => {
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();

    expect(element.querySelector('.strong').textContent).toBe('Could not load news stories.');
  });

  it('should explain how offline viewing works', () => {
    fixture.detectChanges();

    expect(element.textContent).toContain('visit this page with a network connection first');
  });
});
