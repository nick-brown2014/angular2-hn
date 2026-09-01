import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  const comment = {
    id: 1,
    level: 0,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    content: '<p>Hello</p>',
    deleted: false,
    comments: [],
  } as Comment;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.comment = { ...comment };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts expanded', () => {
    expect(component.collapse).toBe(false);
    expect(fixture.nativeElement.querySelector('.collapse').textContent).toBe('[-]');
  });

  it('toggles collapse when the toggle is clicked', () => {
    const toggle: HTMLElement = fixture.nativeElement.querySelector('.collapse');
    toggle.click();
    fixture.detectChanges();
    expect(component.collapse).toBe(true);
    expect(toggle.textContent).toBe('[+]');
  });

  it('renders a deleted placeholder for deleted comments', () => {
    component.comment = { ...comment, deleted: true };
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.deleted-meta')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.comment-text')).toBeNull();
  });
});
