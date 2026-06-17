import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommentComponent } from './comment.component';
import { Comment } from '../../shared/models/comment';

describe('CommentComponent', () => {
    const mockComment: Comment = {
        id: 1, level: 0, user: 'testuser', time: 0,
        time_ago: '1 hour ago', content: 'test comment',
        deleted: false, comments: [],
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommentComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(CommentComponent);
        fixture.componentInstance.comment = mockComment;
        fixture.detectChanges();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should have collapse set to false on init', () => {
        const fixture = TestBed.createComponent(CommentComponent);
        fixture.componentInstance.comment = mockComment;
        fixture.detectChanges();
        expect(fixture.componentInstance.collapse).toBe(false);
    });

    it('should accept @Input() comment', () => {
        const fixture = TestBed.createComponent(CommentComponent);
        fixture.componentInstance.comment = mockComment;
        fixture.detectChanges();
        expect(fixture.componentInstance.comment).toEqual(mockComment);
    });
});
