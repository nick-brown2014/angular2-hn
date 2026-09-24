import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let fixture: ComponentFixture<CommentComponent>;
  let component: CommentComponent;

  const comment = (overrides: Partial<Comment> = {}): Comment => ({
    id: 1,
    level: 0,
    user: 'alice',
    time: 0,
    time_ago: '5 minutes ago',
    content: '<p>Nice <b>post</b></p>',
    deleted: false,
    comments: [],
    ...overrides
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.comment = comment();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('starts expanded', () => {
    component.comment = comment();
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
    expect(fixture.nativeElement.querySelector('.collapse').textContent).toBe('[-]');
  });

  it('renders the user, time and HTML content', () => {
    component.comment = comment();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.meta a').textContent).toBe('alice');
    expect(el.querySelector('.time').textContent).toBe('5 minutes ago');
    expect(el.querySelector('.comment-text').innerHTML).toContain('<b>post</b>');
  });

  it('renders a nested app-comment for each child comment', () => {
    component.comment = comment({ comments: [comment({ id: 2 }), comment({ id: 3 })] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-comment').length).toBe(2);
  });

  it('collapses and expands the comment tree when the toggle is clicked', () => {
    component.comment = comment();
    fixture.detectChanges();

    const toggle: HTMLElement = fixture.nativeElement.querySelector('.collapse');
    const tree: HTMLElement = fixture.nativeElement.querySelector('.comment-tree > div');

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
    expect(tree.hidden).toBe(true);
    expect(fixture.nativeElement.querySelector('.meta').classList).toContain('meta-collapse');

    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
    expect(tree.hidden).toBe(false);
  });

  it('renders a deleted placeholder for deleted comments', () => {
    component.comment = comment({ deleted: true });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.deleted-meta').textContent).toContain('Comment Deleted');
    expect(el.querySelector('.comment-text')).toBeNull();
  });
});
