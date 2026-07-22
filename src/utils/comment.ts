export function commentLabel(count: number): string {
    if (count > 0) {
        const noun = count === 1 ? 'comment' : 'comments';
        return `${count} ${noun}`;
    }
    return 'discuss';
}
