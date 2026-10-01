import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
    element = fixture.nativeElement;
  });

  it('renders the provided message', () => {
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();

    expect(element.querySelector('.strong').textContent).toBe('Could not load news stories.');
  });

  it('updates when the message input changes', () => {
    fixture.componentInstance.message = 'First';
    fixture.detectChanges();
    fixture.componentInstance.message = 'Second';
    fixture.detectChanges();

    expect(element.querySelector('.strong').textContent).toBe('Second');
  });

  it('always shows the offline viewing hint and skull graphic', () => {
    fixture.detectChanges();

    expect(element.querySelector('.error-section .skull')).not.toBeNull();
    expect(element.textContent).toContain('If you are offline viewing');
  });
});
