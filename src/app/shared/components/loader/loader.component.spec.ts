import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
  });

  it('creates', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });
});
