import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loading section', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.loading-section')).toBeTruthy();
  });

  it('should display Loading... text', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Loading...');
  });
});
