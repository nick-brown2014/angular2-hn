import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('uses the singular form for one comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural form for several comments', () => {
    expect(pipe.transform(5)).toBe('5 comments');
  });

  it('returns "discuss" for missing or negative counts', () => {
    expect(pipe.transform(undefined)).toBe('discuss');
    expect(pipe.transform(-1)).toBe('discuss');
  });
});
