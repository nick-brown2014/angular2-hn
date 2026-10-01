export function formatComment(count: number): string {
    if (count <= 0) {
        return 'discuss';
    }
    if (count === 1) {
        return '1 comment';
    }
    return `${count} comments`;
}
