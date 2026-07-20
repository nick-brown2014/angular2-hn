import { TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent]
    });
    TestBed.overrideTemplate(CommentComponent, '');
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = TestBed.createComponent(CommentComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default collapse to false after init', () => {
    const fixture = TestBed.createComponent(CommentComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.collapse).toBe(false);
  });
});
