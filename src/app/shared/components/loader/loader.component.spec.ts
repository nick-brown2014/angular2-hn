import { TestBed, ComponentFixture } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;
  let component: LoaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    });

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the loading indicator', () => {
    const loader: HTMLElement = fixture.nativeElement.querySelector('.loading-section .loader');
    expect(loader).toBeTruthy();
    expect(loader.textContent.trim()).toBe('Loading...');
  });
});
