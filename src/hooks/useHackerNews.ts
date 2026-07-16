import { useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchItemContent, fetchUser } from '../api/hackernews';

export function useFeed(feedType: string, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: () => fetchFeed(feedType, page),
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: () => fetchItemContent(id),
        enabled: Number.isFinite(id),
    });
}

export function useUser(id: string | undefined) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id!),
        enabled: Boolean(id),
    });
}
