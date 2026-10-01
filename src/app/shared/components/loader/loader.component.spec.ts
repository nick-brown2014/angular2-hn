import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [LoaderComponent] });
    fixture = TestBed.createComponent(LoaderComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the loading indicator', () => {
    const loader: HTMLElement = fixture.nativeElement.querySelector('.loading-section .loader');
    expect(loader).not.toBeNull();
    expect(loader.textContent.trim()).toBe('Loading...');
  });
});
