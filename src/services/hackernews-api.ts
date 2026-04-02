import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${baseUrl}/${feedType}?page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch ${feedType} feed`);
    return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${baseUrl}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
    const story: Story = await res.json();

    if (story.type === 'poll' && story.poll) {
        const numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        const pollPromises = [];
        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(fetchPollContent(story.id + i));
        }
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((result, index) => {
            story.poll[index] = result;
            story.poll_votes_count += result.points;
        });
    }

    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${baseUrl}/item/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch poll ${id}`);
    return res.json();
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`${baseUrl}/user/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
    return res.json();
}
