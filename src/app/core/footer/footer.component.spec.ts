import { TestBed, ComponentFixture } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  it('links to the project on GitHub', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#footer a');

    expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.getAttribute('rel')).toBe('noopener');
  });
});
