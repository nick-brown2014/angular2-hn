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
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = {
      id: 1,
      level: 0,
      user: 'pg',
      time: 0,
      time_ago: '1 hour ago',
      content: '<p>Nice</p>',
      deleted: false,
      comments: []
    } as Comment;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('starts expanded', () => {
    expect(component.collapse).toBeUndefined();

    component.ngOnInit();

    expect(component.collapse).toBe(false);
  });

  it('renders the comment author and body', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('pg');
    expect(text).toContain('Nice');
  });

  it('renders a deleted placeholder for deleted comments', () => {
    component.comment.deleted = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Comment Deleted');
  });
});
