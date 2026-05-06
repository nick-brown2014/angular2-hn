import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "discuss" when count is 0', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('should return singular form when count is 1', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should return plural form when count is greater than 1', () => {
    expect(pipe.transform(5)).toBe('5 comments');
    expect(pipe.transform(42)).toBe('42 comments');
  });

  it('should return "discuss" for negative counts', () => {
    expect(pipe.transform(-1)).toBe('discuss');
  });
});
