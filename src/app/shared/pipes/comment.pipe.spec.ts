import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  const pipe = new CommentPipe();

  it('pluralizes counts above one', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(150)).toBe('150 comments');
  });

  it('uses the singular for exactly one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('shows "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('shows "discuss" for negative, null and undefined counts', () => {
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(null)).toBe('discuss');
    expect(pipe.transform(undefined)).toBe('discuss');
  });
});
