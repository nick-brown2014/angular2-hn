import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "discuss" for 0 comments', () => {
    expect(pipe.transform(0)).toEqual('discuss');
  });

  it('should return "1 comment" for 1 comment (singular)', () => {
    expect(pipe.transform(1)).toEqual('1 comment');
  });

  it('should return "5 comments" for 5 comments (plural)', () => {
    expect(pipe.transform(5)).toEqual('5 comments');
  });

  it('should return "discuss" for negative numbers', () => {
    expect(pipe.transform(-1)).toEqual('discuss');
    expect(pipe.transform(-100)).toEqual('discuss');
  });
});
