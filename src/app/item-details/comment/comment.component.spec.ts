import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: 1,
      level: 0,
      user: 'pg',
      time: 0,
      time_ago: '2 hours ago',
      content: '<p>A comment</p>',
      deleted: false,
      comments: []
    } as Comment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start expanded', () => {
    expect(component.collapse).toBe(false);
  });

  it('should render the comment content', () => {
    expect(fixture.nativeElement.querySelector('.comment-text').textContent).toContain('A comment');
  });

  it('should render a deleted placeholder for deleted comments', () => {
    component.comment.deleted = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
  });
});
