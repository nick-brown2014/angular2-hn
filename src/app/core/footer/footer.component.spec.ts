import { TestBed, ComponentFixture } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent]
    });

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to the GitHub project in a new tab', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#footer a');
    expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
