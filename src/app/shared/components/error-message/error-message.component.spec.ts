import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
  });

  it('renders the message input and the offline hint', () => {
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.strong').textContent).toBe('Could not load news stories.');
    expect(el.textContent).toContain('visit this page with a network connection first');
  });
});
