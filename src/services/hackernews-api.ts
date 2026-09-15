import type { FeedName } from '../models/feed-type.type';
import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchFeed(feedType: FeedName, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`);
  if (story.type === 'poll') {
    const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1)));
    story.poll = results;
    story.poll_votes_count = results.reduce((sum, result) => sum + result.points, 0);
  }
  return story;
}
