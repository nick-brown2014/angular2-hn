import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  function commentFixture(overrides: Partial<Comment> = {}): Comment {
    return Object.assign(
      {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>A reply</p>',
        deleted: false,
        comments: []
      },
      overrides
    ) as Comment;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('is created and starts expanded', () => {
    component.comment = commentFixture();

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.collapse).toBe(false);
  });

  it('renders the comment author and content', () => {
    component.comment = commentFixture();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.meta a').textContent).toContain('pg');
    expect(fixture.nativeElement.querySelector('.comment-text').innerHTML).toContain('A reply');
  });

  it('collapses and expands when the toggle is clicked', () => {
    component.comment = commentFixture();
    fixture.detectChanges();

    const toggle: HTMLElement = fixture.nativeElement.querySelector('.collapse');
    toggle.click();
    fixture.detectChanges();

    expect(component.collapse).toBe(true);
    expect(fixture.nativeElement.querySelector('.collapse').textContent).toBe('[+]');

    fixture.nativeElement.querySelector('.collapse').click();
    fixture.detectChanges();

    expect(component.collapse).toBe(false);
    expect(fixture.nativeElement.querySelector('.collapse').textContent).toBe('[-]');
  });

  it('renders nested replies', () => {
    component.comment = commentFixture({ comments: [commentFixture({ id: 2, user: 'dang' })] });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.subtree li').length).toBe(1);
  });

  it('shows a placeholder for deleted comments', () => {
    component.comment = commentFixture({ deleted: true });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(fixture.nativeElement.querySelector('.comment-text')).toBeNull();
  });
});
