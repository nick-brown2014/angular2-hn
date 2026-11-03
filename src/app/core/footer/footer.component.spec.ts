import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [FooterComponent] });
    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the GitHub link opening safely in a new tab', () => {
    const link: HTMLAnchorElement = el.querySelector('#footer a');
    expect(el.querySelector('#footer').textContent).toContain('Show this project some');
    expect(link.textContent).toBe('GitHub');
    expect(link.href).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
  });
});
