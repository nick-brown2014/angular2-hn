import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ErrorMessageComponent] });
    fixture = TestBed.createComponent(ErrorMessageComponent);
  });

  it('renders the provided message', () => {
    fixture.componentInstance.message = 'Could not load news stories.';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.strong').textContent).toBe('Could not load news stories.');
  });

  it('always renders the offline hint and skull illustration', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('If you are offline viewing');
    expect(fixture.nativeElement.querySelector('.skull')).not.toBeNull();
  });
});
