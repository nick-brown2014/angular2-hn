import { CommentPipe } from './comment.pipe';

describe('CommentPipe', () => {
  let pipe: CommentPipe;

  beforeEach(() => {
    pipe = new CommentPipe();
  });

  it('should return "1 comment" when input is 1', () => {
    expect(pipe.transform(1)).toEqual('1 comment');
  });

  it('should return "5 comments" when input is greater than 1', () => {
    expect(pipe.transform(5)).toEqual('5 comments');
  });

  it('should return "discuss" when input is 0', () => {
    expect(pipe.transform(0)).toEqual('discuss');
  });
});
