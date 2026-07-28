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

  it('should return a singular label for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('should return a plural label for several comments', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });
});
