import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('returns "discuss" for zero comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for a negative count', () => {
    expect(pipe.transform(-3)).toBe('discuss');
  });

  it('returns "discuss" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('discuss');
  });

  it('returns singular for exactly one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns plural for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(150)).toBe('150 comments');
  });
});
