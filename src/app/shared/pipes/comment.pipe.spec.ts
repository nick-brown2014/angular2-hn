import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for missing or negative counts', () => {
    expect(pipe.transform(undefined)).toBe('discuss');
    expect(pipe.transform(null)).toBe('discuss');
    expect(pipe.transform(-1)).toBe('discuss');
  });

  it('uses the singular form for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural form for multiple comments', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(345)).toBe('345 comments');
  });
});
