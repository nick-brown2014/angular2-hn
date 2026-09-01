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

  it('renders a link to the GitHub project', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#footer a');
    expect(link.href).toBe('https://github.com/hdjirdeh/angular2-hn');
    expect(link.textContent).toBe('GitHub');
  });
});
