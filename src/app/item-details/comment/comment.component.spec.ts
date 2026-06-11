import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const mockComment: Comment = {
    id: 1,
    level: 0,
    user: 'testuser',
    time: 1234567890,
    time_ago: '2 hours ago',
    content: '<p>This is a test comment</p>',
    deleted: false,
    comments: []
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = mockComment;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize collapse to false on ngOnInit', () => {
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
  });

  it('should render comment user', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('testuser');
  });

  it('should render comment time_ago', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('2 hours ago');
  });

  it('should render comment content', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.comment-text').innerHTML).toContain('This is a test comment');
  });

  it('should show deleted message for deleted comments', () => {
    component.comment = { ...mockComment, deleted: true };
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Comment Deleted');
  });

  it('should not show normal content for deleted comments', () => {
    component.comment = { ...mockComment, deleted: true };
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.comment-text')).toBeNull();
  });

  it('should render nested comments recursively via app-comment selector', () => {
    const nestedComment: Comment = {
      id: 2, level: 1, user: 'nested', time: 0, time_ago: '1 hour ago',
      content: '<p>Nested</p>', deleted: false, comments: []
    };
    component.comment = { ...mockComment, comments: [nestedComment] };
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const nestedComponents = compiled.querySelectorAll('app-comment');
    expect(nestedComponents.length).toBeGreaterThan(0);
  });

  it('should toggle collapse when collapse button is clicked', () => {
    fixture.detectChanges();
    expect(component.collapse).toBe(false);

    const collapseBtn = fixture.nativeElement.querySelector('.collapse');
    collapseBtn.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(true);

    collapseBtn.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(false);
  });

  it('should show [-] when not collapsed and [+] when collapsed', () => {
    fixture.detectChanges();
    const collapseBtn = fixture.nativeElement.querySelector('.collapse');
    expect(collapseBtn.textContent).toContain('[-]');

    collapseBtn.click();
    fixture.detectChanges();
    expect(collapseBtn.textContent).toContain('[+]');
  });
});
