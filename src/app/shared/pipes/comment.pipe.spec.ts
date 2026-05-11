import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('creates an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" when comment count is 0', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" when comment count is negative', () => {
    expect(pipe.transform(-1)).toBe('discuss');
  });

  it('returns "1 comment" (singular) when comment count is 1', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns "5 comments" (plural) when comment count is 5', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });

  it('returns "100 comments" for larger counts', () => {
    expect(pipe.transform(100)).toBe('100 comments');
  });
});
