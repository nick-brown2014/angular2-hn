import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  function createComment(): Comment {
    return {
      id: 1,
      level: 0,
      user: 'pg',
      time: 0,
      time_ago: '1 hour ago',
      content: '<p>Hello</p>',
      deleted: false,
      comments: []
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      imports: [CommonModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = createComment();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit starts expanded', () => {
    component.collapse = true;

    component.ngOnInit();

    expect(component.collapse).toBe(false);
  });

  it('renders the comment author and content', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('pg');
    expect(fixture.nativeElement.querySelector('.comment-text').textContent).toContain('Hello');
  });

  it('renders a deleted placeholder for deleted comments', () => {
    component.comment = { ...createComment(), deleted: true };
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Comment Deleted');
  });
});
