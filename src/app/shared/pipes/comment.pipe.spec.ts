import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('uses the singular form for exactly one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural form for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(1234)).toBe('1234 comments');
  });

  it('returns "discuss" for negative counts', () => {
    expect(pipe.transform(-3)).toBe('discuss');
  });

  it('returns "discuss" for null or undefined', () => {
    expect(pipe.transform(null)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
  });
});
