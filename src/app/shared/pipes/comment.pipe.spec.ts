import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('creates', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" for zero comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for negative counts', () => {
    expect(pipe.transform(-5)).toBe('discuss');
  });

  it('uses the singular form for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural form for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(42)).toBe('42 comments');
  });
});
