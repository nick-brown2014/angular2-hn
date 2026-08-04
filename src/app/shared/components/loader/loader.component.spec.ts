import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;
  let component: LoaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the loading indicator', () => {
    const loader: HTMLElement = fixture.nativeElement.querySelector('.loading-section .loader');

    expect(loader).toBeTruthy();
    expect(loader.textContent.trim()).toBe('Loading...');
  });
});
