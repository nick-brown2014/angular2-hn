import { useParams } from 'react-router-dom';
import type { FeedSlug } from '../../models';

export function Feed({ feedType }: { feedType: FeedSlug }) {
    const { page } = useParams();
    return <section data-testid="feed-placeholder"><h2>{feedType} feed — page {page}</h2><p>Feed content coming in Step 4.</p></section>;
}
