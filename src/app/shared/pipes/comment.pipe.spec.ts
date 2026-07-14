import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" for zero comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for negative comment counts', () => {
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(-42)).toBe('discuss');
  });

  it('returns "1 comment" (singular) for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('returns "n comments" (plural) for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(150)).toBe('150 comments');
  });
});
