import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: 1,
      level: 0,
      user: 'testuser',
      time: 123,
      time_ago: '1 hour ago',
      content: '<p>Test comment</p>',
      deleted: false,
      comments: []
    } as Comment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize collapse to false in ngOnInit', () => {
    expect(component.collapse).toBe(false);
  });

  it('@Input() comment should be bindable', () => {
    const newComment: Comment = {
      id: 2,
      level: 1,
      user: 'anotheruser',
      time: 456,
      time_ago: '2 hours ago',
      content: '<p>Another comment</p>',
      deleted: false,
      comments: []
    };
    component.comment = newComment;
    expect(component.comment).toBe(newComment);
  });
});
