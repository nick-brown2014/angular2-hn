import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { createComment } from '../../../testing/mocks';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    });

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('renders the author, time and HTML content', () => {
    component.comment = createComment({ user: 'tptacek', time_ago: '3 hours ago', content: '<p>Hi <i>there</i></p>' });
    fixture.detectChanges();

    expect(el.querySelector('.meta a').textContent).toBe('tptacek');
    expect(el.querySelector('.meta a').getAttribute('href')).toBe('/user/tptacek');
    expect(el.querySelector('.time').textContent).toBe('3 hours ago');
    expect(el.querySelector('.comment-text').innerHTML).toBe('<p>Hi <i>there</i></p>');
  });

  it('recursively renders nested replies', () => {
    component.comment = createComment({
      comments: [createComment({ id: 11, user: 'child', comments: [createComment({ id: 12, user: 'grandchild' })] })],
    });
    fixture.detectChanges();

    const users = Array.from(el.querySelectorAll('.meta a')).map(a => a.textContent);
    expect(users).toEqual(['sama', 'child', 'grandchild']);
  });

  it('starts expanded and toggles collapse on click', () => {
    component.comment = createComment();
    fixture.detectChanges();

    const toggle: HTMLElement = el.querySelector('.collapse');
    const tree: HTMLElement = el.querySelector('.comment-tree > div');
    expect(component.collapse).toBe(false);
    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();

    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(el.querySelector('.meta').classList).toContain('meta-collapse');
  });

  it('renders a placeholder for deleted comments', () => {
    component.comment = createComment({ deleted: true });
    fixture.detectChanges();

    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(el.querySelector('.comment-text')).toBeNull();
  });
});
