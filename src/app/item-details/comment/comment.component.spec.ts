import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';
import { makeComment } from '../../../testing/mocks';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let el: HTMLElement;

  function render(comment: Comment) {
    fixture.componentInstance.comment = comment;
    fixture.detectChanges();
  }

  function toggle(): HTMLElement {
    return el.querySelector('.meta .collapse');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    });
    fixture = TestBed.createComponent(CommentComponent);
    el = fixture.nativeElement;
  });

  it('renders the author link, time and HTML content', () => {
    render(makeComment({ user: 'dang', time_ago: '5 minutes ago', content: '<p>Hello <i>world</i></p>' }));

    const author: HTMLAnchorElement = el.querySelector('.meta a');
    expect(author.textContent).toBe('dang');
    expect(author.getAttribute('href')).toBe('/user/dang');
    expect(el.querySelector('.meta .time').textContent).toBe('5 minutes ago');
    expect(el.querySelector('.comment-text i').textContent).toBe('world');
  });

  it('sanitizes unsafe HTML in the content', () => {
    render(makeComment({ content: '<img src="x.png" onerror="alert(1)"><script>alert(2)</script>' }));

    const text = el.querySelector('.comment-text');
    expect(text.querySelector('img').hasAttribute('onerror')).toBe(false);
    expect(text.querySelector('script')).toBeNull();
  });

  it('renders nested replies recursively', () => {
    render(makeComment({
      id: 1,
      comments: [
        makeComment({ id: 2, user: 'a', comments: [makeComment({ id: 3, user: 'c' })] }),
        makeComment({ id: 4, user: 'b' }),
      ],
    }));

    const users = Array.from(el.querySelectorAll('.meta a')).map(a => a.textContent);
    expect(users).toEqual(['dang', 'a', 'c', 'b']);
    expect(el.querySelectorAll('app-comment').length).toBe(3);
  });

  it('starts expanded and collapses/expands the subtree when the toggle is clicked', () => {
    render(makeComment({ comments: [makeComment({ id: 2 })] }));
    const tree: HTMLElement = el.querySelector('.comment-tree > div');

    expect(fixture.componentInstance.collapse).toBe(false);
    expect(toggle().textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapse).toBe(true);
    expect(toggle().textContent).toBe('[+]');
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');
    expect(tree.hidden).toBe(true);

    toggle().click();
    fixture.detectChanges();
    expect(toggle().textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);
  });

  it('collapses a reply independently of its parent', () => {
    render(makeComment({ comments: [makeComment({ id: 2, comments: [makeComment({ id: 3 })] })] }));
    const toggles = el.querySelectorAll<HTMLElement>('.meta .collapse');

    toggles[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapse).toBe(false);
    expect(el.querySelectorAll('.meta-collapse').length).toBe(1);
  });

  it('shows a placeholder instead of the content for deleted comments', () => {
    render(makeComment({ deleted: true, user: undefined, content: undefined }));

    expect(el.querySelector('.deleted-meta').textContent.replace(/\s+/g, ' ').trim())
      .toBe('[deleted] | Comment Deleted');
    expect(el.querySelector('.meta')).toBeNull();
    expect(el.querySelector('.comment-text')).toBeNull();
  });
});
