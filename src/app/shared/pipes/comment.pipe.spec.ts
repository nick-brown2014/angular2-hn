import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
    const pipe = new CommentPipe();

    it('should return "discuss" for 0 comments', () => {
        expect(pipe.transform(0)).toBe('discuss');
    });

    it('should return "1 comment" for 1 comment', () => {
        expect(pipe.transform(1)).toBe('1 comment');
    });

    it('should return "5 comments" for 5 comments', () => {
        expect(pipe.transform(5)).toBe('5 comments');
    });
});
