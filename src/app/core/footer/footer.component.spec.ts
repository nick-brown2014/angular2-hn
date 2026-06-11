import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer content', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#footer')).toBeTruthy();
  });

  it('should contain GitHub link', () => {
    const compiled = fixture.nativeElement;
    const link = compiled.querySelector('a[href*="github.com"]');
    expect(link).toBeTruthy();
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
