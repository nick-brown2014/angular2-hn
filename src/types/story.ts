import type { Comment } from './comment';
import type { PollResult } from './poll-result';

export type FeedType = 'poll' | 'story' | 'job';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: string;
    type: FeedType;
    url: string;
    domain: string;
    comments: Comment[];
    comments_count: number;
    content: string;
    poll: PollResult[];
    poll_votes_count: number;
    deleted: boolean;
    dead: boolean;
}
