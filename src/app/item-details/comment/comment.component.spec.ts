import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { makeComment } from '../../../testing/mocks';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let el: HTMLElement;

  const tree = makeComment({
    id: 1,
    user: 'root',
    content: '<p>Root comment</p>',
    comments: [
      makeComment({
        id: 2,
        level: 1,
        user: 'child',
        content: '<p>Child comment</p>',
        comments: [makeComment({ id: 3, level: 2, user: 'grandchild', content: '<p>Grandchild comment</p>' })],
      }),
      makeComment({ id: 4, level: 1, user: 'sibling', content: '<p>Sibling comment</p>' }),
    ],
  });

  function render(comment = tree) {
    fixture.componentInstance.comment = comment;
    fixture.detectChanges();
  }

  function toggle(container: Element = el) {
    (container.querySelector('.meta .collapse') as HTMLElement).click();
    fixture.detectChanges();
  }

  function rootTree(): HTMLElement {
    return el.querySelector(':scope > div > .comment-tree > div');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    });
    fixture = TestBed.createComponent(CommentComponent);
    el = fixture.nativeElement;
  });

  it('renders the author linked to their profile, the time and the HTML content', () => {
    render(makeComment({ user: 'tptacek', time_ago: '4 hours ago', content: '<p>Hello <i>world</i></p>' }));

    const userLink: HTMLAnchorElement = el.querySelector('.meta a');
    expect(userLink.textContent).toBe('tptacek');
    expect(userLink.getAttribute('href')).toBe('/user/tptacek');
    expect(el.querySelector('.meta .time').textContent).toBe('4 hours ago');
    expect(el.querySelector('.comment-text i').textContent).toBe('world');
  });

  it('renders the reply tree recursively', () => {
    render();

    const nested = el.querySelectorAll('app-comment');
    expect(nested.length).toBe(3);

    const topLevelReplies = el.querySelectorAll(':scope > div > .comment-tree > div > .subtree > li > app-comment');
    expect(Array.from(topLevelReplies).map(c => c.querySelector('.meta a').textContent)).toEqual(['child', 'sibling']);

    const grandchild = topLevelReplies[0].querySelector('.subtree app-comment');
    expect(grandchild.querySelector('.meta a').textContent).toBe('grandchild');
    expect(grandchild.querySelector('.comment-text').textContent).toBe('Grandchild comment');
  });

  it('starts expanded', () => {
    render();
    expect(fixture.componentInstance.collapse).toBe(false);
    expect(el.querySelector('.meta .collapse').textContent).toBe('[-]');
    expect(rootTree().hidden).toBe(false);
  });

  it('collapses and expands the comment and its replies', () => {
    render();

    toggle();
    expect(fixture.componentInstance.collapse).toBe(true);
    expect(el.querySelector('.meta .collapse').textContent).toBe('[+]');
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');
    expect(rootTree().hidden).toBe(true);

    toggle();
    expect(el.querySelector('.meta .collapse').textContent).toBe('[-]');
    expect(rootTree().hidden).toBe(false);
  });

  it('collapses a nested reply independently of its parent', () => {
    render();
    const child = el.querySelector('.subtree app-comment');

    toggle(child);

    expect(child.querySelector('.meta .collapse').textContent).toBe('[+]');
    expect((child.querySelector('.comment-tree > div') as HTMLElement).hidden).toBe(true);
    expect(el.querySelector('.meta .collapse').textContent).toBe('[-]');
    expect(rootTree().hidden).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    render(makeComment({ deleted: true, user: undefined, content: undefined }));

    expect(el.querySelector('.deleted-meta').textContent.replace(/\s+/g, ' ').trim()).toBe(
      '[deleted] | Comment Deleted'
    );
    expect(el.querySelector('.meta')).toBeNull();
  });
});
