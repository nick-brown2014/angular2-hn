import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('creates an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns "discuss" when there are no comments', () => {
    expect(pipe.transform(0)).toBe('discuss');
  });

  it('returns "discuss" for negative counts', () => {
    expect(pipe.transform(-3)).toBe('discuss');
  });

  it('uses the singular form for a single comment', () => {
    expect(pipe.transform(1)).toBe('1 comment');
  });

  it('uses the plural form for several comments', () => {
    expect(pipe.transform(2)).toBe('2 comments');
    expect(pipe.transform(147)).toBe('147 comments');
  });
});
