import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it.each([[0, 'discuss'], [1, '1 comment'], [5, '5 comments']])('formats %i', (count, result) => {
    expect(formatCommentCount(count)).toBe(result);
  });
});
