import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

function createComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    level: 0,
    user: 'pg',
    time: 1600000000,
    time_ago: '2 hours ago',
    content: '<p>This is a <i>great</i> post.</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let el: HTMLElement;

  function render(comment: Comment) {
    fixture.componentInstance.comment = comment;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    });
    fixture = TestBed.createComponent(CommentComponent);
    el = fixture.nativeElement;
  });

  it('creates and starts expanded', () => {
    render(createComment());
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.collapse).toBe(false);
  });

  it('renders the author, age and html content', () => {
    render(createComment());

    const author = el.querySelector('.meta a');
    expect(author.textContent).toBe('pg');
    expect(author.getAttribute('href')).toBe('/user/pg');
    expect(el.querySelector('.meta .time').textContent).toBe('2 hours ago');

    const text = el.querySelector('.comment-text');
    expect(text.querySelector('i').textContent).toBe('great');
    expect(text.textContent).toBe('This is a great post.');
  });

  it('sanitizes unsafe html in the comment content', () => {
    render(createComment({ content: '<p>hi</p><script>window.hacked = true</script>' }));

    const text = el.querySelector('.comment-text');
    expect(text.querySelector('script')).toBeNull();
    expect(text.textContent).toContain('hi');
  });

  it('renders nested replies recursively', () => {
    render(
      createComment({
        comments: [
          createComment({
            id: 2,
            level: 1,
            user: 'reply1',
            content: '<p>First reply</p>',
            comments: [createComment({ id: 3, level: 2, user: 'reply2', content: '<p>Nested reply</p>' })],
          }),
          createComment({ id: 4, level: 1, user: 'reply3', content: '<p>Second reply</p>' }),
        ],
      })
    );

    const authors = Array.from(el.querySelectorAll('.meta a')).map(a => a.textContent);
    expect(authors).toEqual(['pg', 'reply1', 'reply2', 'reply3']);

    const topLevelReplies = el.querySelectorAll(':scope > div > .comment-tree > div > .subtree > li');
    expect(topLevelReplies.length).toBe(2);
    expect(topLevelReplies[0].querySelector('app-comment .subtree app-comment .comment-text').textContent).toBe(
      'Nested reply'
    );
  });

  it('collapses and expands the comment thread', () => {
    render(createComment({ comments: [createComment({ id: 2, user: 'child' })] }));
    const toggle: HTMLElement = el.querySelector('.collapse');
    const tree: HTMLElement = el.querySelector('.comment-tree > div');

    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    render(createComment({ deleted: true, user: undefined, content: undefined }));

    expect(el.querySelector('.meta')).toBeNull();
    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
  });
});
