import { TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderComponent]
    });
    TestBed.overrideTemplate(LoaderComponent, '');
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
