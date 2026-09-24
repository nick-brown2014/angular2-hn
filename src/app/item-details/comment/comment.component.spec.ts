import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  const child: Comment = {
    id: 2, level: 1, user: 'bob', time: 0, time_ago: '1 hour ago',
    content: '<p>child</p>', deleted: false, comments: []
  };
  const comment: Comment = {
    id: 1, level: 0, user: 'alice', time: 0, time_ago: '2 hours ago',
    content: '<p>parent</p>', deleted: false, comments: [child]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = { ...comment };
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('starts expanded', () => {
    expect(component.collapse).toBe(false);
  });

  it('renders the author, time and content', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.meta a').textContent).toBe('alice');
    expect(el.querySelector('.time').textContent).toBe('2 hours ago');
    expect(el.querySelector('.comment-text').innerHTML).toBe('<p>parent</p>');
  });

  it('renders nested child comments', () => {
    const nested = fixture.nativeElement.querySelectorAll('app-comment');
    expect(nested.length).toBe(1);
  });

  it('collapses and expands when the toggle is clicked', () => {
    const el: HTMLElement = fixture.nativeElement;
    const toggle: HTMLElement = el.querySelector('.collapse');
    const tree: HTMLElement = el.querySelector('.comment-tree > div');

    expect(toggle.textContent).toBe('[-]');
    expect(tree.hidden).toBe(false);

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
  });

  it('renders a placeholder for deleted comments', () => {
    component.comment = { ...comment, deleted: true };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(el.querySelector('.comment-text')).toBeNull();
  });
});
