import { queryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { FeedSlug } from '../models/feed';
import type { Story } from '../models/story';
import type { User } from '../models/user';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNews';

export const hackerNewsKeys = {
    feed: (feedType: FeedSlug, page: number) => ['feed', feedType, page] as const,
    item: (id: number) => ['item', id] as const,
    user: (id: string) => ['user', id] as const,
};

export function feedQueryOptions(feedType: FeedSlug, page: number) {
    return queryOptions({
        queryKey: hackerNewsKeys.feed(feedType, page),
        queryFn: () => fetchFeed(feedType, page),
    });
}

export function itemQueryOptions(id: number) {
    return queryOptions({
        queryKey: hackerNewsKeys.item(id),
        queryFn: () => fetchItemContent(id),
    });
}

export function userQueryOptions(id: string) {
    return queryOptions({
        queryKey: hackerNewsKeys.user(id),
        queryFn: () => fetchUser(id),
    });
}

export function useFeed(feedType: FeedSlug, page: number): UseQueryResult<Story[]> {
    return useQuery(feedQueryOptions(feedType, page));
}

export function useItem(id: number): UseQueryResult<Story> {
    return useQuery(itemQueryOptions(id));
}

export function useUser(id: string): UseQueryResult<User> {
    return useQuery(userQueryOptions(id));
}
