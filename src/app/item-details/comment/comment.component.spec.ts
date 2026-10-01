import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';
import { mockComment } from '../../testing/mock-data';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let element: HTMLElement;

  function render(comment: Comment) {
    fixture = TestBed.createComponent(CommentComponent);
    fixture.componentInstance.comment = comment;
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent]
    });
  });

  it('renders the author, time and HTML content', () => {
    render(mockComment({ user: 'patio11', time_ago: '1 hour ago', content: '<p>Charge <i>more</i>.</p>' }));

    const author = element.querySelector<HTMLAnchorElement>('.meta a');
    expect(author.textContent).toBe('patio11');
    expect(author.getAttribute('href')).toBe('/user/patio11');
    expect(element.querySelector('.meta .time').textContent).toBe('1 hour ago');
    expect(element.querySelector('.comment-text i').textContent).toBe('more');
  });

  it('renders nested replies recursively', () => {
    render(
      mockComment({
        id: 1,
        user: 'root',
        comments: [
          mockComment({ id: 2, user: 'child-a', comments: [mockComment({ id: 3, user: 'grandchild' })] }),
          mockComment({ id: 4, user: 'child-b' })
        ]
      })
    );

    const authors = Array.from(element.querySelectorAll('.meta a')).map(a => a.textContent);
    expect(authors).toEqual(['root', 'child-a', 'grandchild', 'child-b']);
    expect(element.querySelectorAll('app-comment').length).toBe(3);
  });

  it('starts expanded and collapses the subtree on toggle', () => {
    render(mockComment({ comments: [mockComment({ id: 9 })] }));
    const toggle = element.querySelector<HTMLElement>('.collapse');
    const tree = element.querySelector<HTMLElement>('.comment-tree > div');

    expect(fixture.componentInstance.collapse).toBe(false);
    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();

    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(element.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();

    expect(tree.hidden).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    render(mockComment({ deleted: true, user: undefined, content: undefined }));

    expect(element.querySelector('.meta')).toBeNull();
    expect(element.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
  });
});
