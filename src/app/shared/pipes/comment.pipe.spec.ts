import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" for 0 comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "1 comment" for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns "N comments" for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(42)).toBe('42 comments');
  });

  it('returns "discuss" for undefined or negative values', () => {
    expect(pipe.transform(undefined)).toBe('discuss');
    expect(pipe.transform(-1)).toBe('discuss');
  });
});
