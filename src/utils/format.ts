/**
 * Format a comment count for display.
 *
 * Replaces the Angular `CommentPipe` from
 * `src/app/shared/pipes/comment.pipe.ts`.
 */
export function formatComment(count: number): string {
    if (count > 0) {
        const suffix = count === 1 ? 'comment' : 'comments';
        return `${count} ${suffix}`;
    }
    return 'discuss';
}
