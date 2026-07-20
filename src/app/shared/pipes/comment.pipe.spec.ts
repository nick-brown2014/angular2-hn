import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "1 comment" (singular) for a count of 1', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should return "5 comments" (plural) for a count of 5', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });

  it('should return "discuss" for a count of 0', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('should return "discuss" for negative counts', () => {
    expect(pipe.transform(-1)).toBe('discuss');
    expect(pipe.transform(-42)).toBe('discuss');
  });
});
