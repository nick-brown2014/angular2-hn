import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let component: ErrorMessageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent]
    });

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders the @Input message', () => {
    component.message = 'Could not load news stories.';
    fixture.detectChanges();

    const strong: HTMLElement = fixture.nativeElement.querySelector('p.strong');
    expect(strong.textContent).toBe('Could not load news stories.');
  });

  it('updates when the message input changes', () => {
    component.message = 'first';
    fixture.detectChanges();
    component.message = 'second';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p.strong').textContent).toBe('second');
  });

  it('always renders the offline hint', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('If you are offline viewing');
  });
});
