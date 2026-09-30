import { TestBed, ComponentFixture } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    });

    fixture = TestBed.createComponent(LoaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the loading indicator', () => {
    expect(element.querySelector('.loading-section .loader').textContent.trim()).toBe('Loading...');
  });
});
