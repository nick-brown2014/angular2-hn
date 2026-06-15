import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 1234567890,
      time_ago: '2 hours ago',
      content: '<p>Test comment</p>',
      deleted: false,
      comments: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize collapse to false on init', () => {
    expect(component.collapse).toBe(false);
  });
});
