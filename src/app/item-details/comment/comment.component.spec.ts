import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let element: HTMLElement;

  function createComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: 1,
      level: 0,
      user: 'carol',
      time: 1600000000,
      time_ago: '1 hour ago',
      content: '<p>Top level <i>comment</i></p>',
      deleted: false,
      comments: [],
      ...overrides
    };
  }

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

  it('should render the author, age and comment html', () => {
    render(createComment());
    const userLink = element.querySelector('.meta a');

    expect(userLink.textContent).toBe('carol');
    expect(userLink.getAttribute('href')).toBe('/user/carol');
    expect(element.querySelector('.meta .time').textContent).toBe('1 hour ago');
    expect(element.querySelector('.comment-text').innerHTML).toBe('<p>Top level <i>comment</i></p>');
  });

  it('should recursively render nested replies', () => {
    render(createComment({
      comments: [
        createComment({ id: 2, user: 'dave', content: 'Reply', comments: [
          createComment({ id: 3, user: 'erin', content: 'Nested reply' })
        ] })
      ]
    }));

    const reply = element.querySelector('.subtree > li > app-comment');
    const nestedReply = reply.querySelector('.subtree > li > app-comment');
    expect(element.querySelectorAll('app-comment').length).toBe(2);
    expect(reply.querySelector('.meta a').textContent).toBe('dave');
    expect(nestedReply.querySelector('.meta a').textContent).toBe('erin');
    expect(nestedReply.querySelector('.comment-text').textContent).toBe('Nested reply');
  });

  it('should collapse and expand the comment tree', () => {
    render(createComment({ comments: [createComment({ id: 2 })] }));
    const toggle = element.querySelector('.collapse') as HTMLElement;
    const tree = element.querySelector('.comment-tree > div') as HTMLElement;

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

  it('should render a placeholder for deleted comments', () => {
    render(createComment({ deleted: true }));

    expect(element.querySelector('.meta')).toBeNull();
    expect(element.querySelector('.deleted-meta').textContent.trim()).toBe('[deleted] | Comment Deleted');
  });
});
