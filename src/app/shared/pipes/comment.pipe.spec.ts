import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('should return "discuss" for negative counts', () => {
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(-42)).toBe('discuss');
  });

  it('should use the singular form for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should use the plural form for more than one comment', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(137)).toBe('137 comments');
  });
});
