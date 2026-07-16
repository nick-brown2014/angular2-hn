import type { FeedSlug } from '../models/feed';
import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * Fetch a paginated feed (news, newest, show, ask, jobs).
 * Mirrors the Angular `HackerNewsAPIService.fetchFeed` endpoint behavior.
 */
export async function fetchFeed(feedType: FeedSlug, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch ${feedType} feed`);
    return res.json();
}

/**
 * Fetch a single item (story/poll/job) with its comments.
 * For polls, aggregates each poll option's score into `poll_votes_count`,
 * matching the original Angular poll-aggregation logic.
 */
export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
    const story: Story = await res.json();

    if (story.type === 'poll' && story.poll?.length) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollResults = await Promise.all(
            Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1))
        );
        pollResults.forEach((result, i) => {
            story.poll[i] = result;
            story.poll_votes_count += result.points;
        });
    }

    return story;
}

/**
 * Fetch a single poll option's content/score.
 */
export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch poll item ${id}`);
    return res.json();
}

/**
 * Fetch a user profile.
 * NOTE: the external `/user/:id` endpoint currently returns 404 (external API
 * issue, not app code); this preserves the original request shape and surfaces
 * the error the same way the feed/item requests do.
 */
export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
    return res.json();
}
