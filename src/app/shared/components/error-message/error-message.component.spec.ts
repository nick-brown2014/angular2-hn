import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;
  let component: ErrorMessageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  it('renders the message input', () => {
    component.message = 'Could not load news stories.';

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p.strong').textContent).toContain(
      'Could not load news stories.'
    );
  });
});
