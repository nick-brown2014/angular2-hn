import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: 1,
      level: 0,
      user: 'alice',
      time: 0,
      time_ago: '3 hours ago',
      content: '<p>Top level <i>comment</i></p>',
      deleted: false,
      comments: [],
      ...overrides,
    };
  }

  function render(comment: Comment): HTMLElement {
    component.comment = comment;
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    });

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    render(makeComment());
    expect(component).toBeTruthy();
    expect(component.collapse).toBe(false);
  });

  it('renders the author, time and HTML content', () => {
    const el = render(makeComment());

    expect(el.querySelector('.meta a').textContent).toBe('alice');
    expect(el.querySelector('.meta a').getAttribute('href')).toBe('/user/alice');
    expect(el.querySelector('.time').textContent).toBe('3 hours ago');
    expect(el.querySelector('.comment-text i').textContent).toBe('comment');
  });

  it('renders nested replies recursively', () => {
    const el = render(makeComment({
      comments: [makeComment({ id: 2, user: 'bob', content: '<p>Reply</p>', level: 1 })],
    }));

    const replies = el.querySelectorAll('.subtree app-comment');
    expect(replies.length).toBe(1);
    expect(replies[0].querySelector('.meta a').textContent).toBe('bob');
  });

  it('collapses and expands the thread', () => {
    const el = render(makeComment());
    const toggle = el.querySelector('.collapse') as HTMLElement;
    const tree = () => el.querySelector('.comment-tree > div') as HTMLElement;

    expect(toggle.textContent).toBe('[-]');
    expect(tree().hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent).toBe('[+]');
    expect(tree().hidden).toBe(true);
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();
    expect(tree().hidden).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    const el = render(makeComment({ deleted: true }));

    expect(el.querySelector('.meta')).toBeNull();
    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
  });
});
