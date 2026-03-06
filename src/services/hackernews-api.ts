import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const story: Story = await res.json();

    if (story.type === 'poll') {
        const numberOfPollOptions = story.poll.length;
        const pollPromises: Promise<PollResult>[] = [];

        for (let i = 1; i <= numberOfPollOptions; i++) {
            pollPromises.push(fetchPollContent(story.id + i));
        }

        const pollResults = await Promise.all(pollPromises);
        story.poll_votes_count = 0;

        pollResults.forEach((pollResult, index) => {
            story.poll[index] = pollResult;
            story.poll_votes_count += pollResult.points;
        });
    }

    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const res = await fetch(`${BASE_URL}/item/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}

export async function fetchUser(id: string): Promise<User> {
    const res = await fetch(`${BASE_URL}/user/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
}
