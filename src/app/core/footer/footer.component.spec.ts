import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent],
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

  it('renders the GitHub footer link', () => {
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('#footer a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('github.com');
  });
});
