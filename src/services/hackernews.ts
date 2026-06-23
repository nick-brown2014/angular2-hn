import { useQuery } from '@tanstack/react-query';
import type { Story, User, PollResult } from '../models/types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch feed: ${res.statusText}`);
  return res.json();
}

export async function fetchItem(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch item: ${res.statusText}`);
  const story: Story = await res.json();

  if (story.type === 'poll' && story.poll?.length) {
    const numberOfPollOptions = story.poll.length;
    let pollVotesCount = 0;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1)
      )
    );
    for (let i = 0; i < numberOfPollOptions; i++) {
      story.poll[i] = pollResults[i];
      pollVotesCount += pollResults[i].points;
    }
    story.poll_votes_count = pollVotesCount;
  }

  return story;
}

async function fetchPollContent(id: number): Promise<PollResult> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch poll: ${res.statusText}`);
  return res.json();
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.statusText}`);
  return res.json();
}

export function useFeed(feedType: string, page: number) {
  return useQuery({
    queryKey: ['feed', feedType, page],
    queryFn: () => fetchFeed(feedType, page),
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });
}
