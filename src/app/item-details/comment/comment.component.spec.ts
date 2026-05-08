import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: 1,
      level: 0,
      user: 'alice',
      time: 0,
      time_ago: '1 hour ago',
      content: 'Hello world',
      deleted: false,
      comments: [],
      ...overrides
    } as Comment;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = makeComment();
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize collapse to false in ngOnInit', () => {
    component.ngOnInit();
    expect(component.collapse).toBe(false);
  });

  it('should accept a comment Input', () => {
    const comment = makeComment({ content: 'Bound comment' });
    component.comment = comment;
    fixture.detectChanges();
    expect(component.comment).toBe(comment);
    expect(component.comment.content).toBe('Bound comment');
  });
});
