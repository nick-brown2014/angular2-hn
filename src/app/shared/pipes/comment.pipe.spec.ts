import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should return "discuss" for zero comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('should return "discuss" for a missing comment count', () => {
    expect(pipe.transform(undefined)).toBe('discuss');
  });

  it('should use the singular form for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should use the plural form for multiple comments', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(135)).toBe('135 comments');
  });
});
