import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../../api/hackernews';
import { FeedItem } from './FeedItem';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import styles from './Feed.module.scss';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const listStart = (pageNum - 1) * 30 + 1;

    const { data: items, isLoading, error } = useQuery({
        queryKey: ['feed', feedType, pageNum],
        queryFn: () => fetchFeed(feedType, pageNum),
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, pageNum]);

    if (isLoading) return <Loader />;
    if (error) return <ErrorMessage message={`Could not load ${feedType} stories.`} />;

    return (
        <div className={styles.mainContent}>
            {feedType === 'jobs' && (
                <p className={styles.jobHeader}>
                    These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
                    through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                </p>
            )}
            {feedType !== 'new' && (
                <ol className={`${styles.ol} ${feedType !== 'jobs' ? styles.listMargin : ''}`} start={listStart}>
                    {items?.map((item) => (
                        <li key={item.id} className={styles.post}>
                            <div className={styles.itemBlock}>
                                <FeedItem item={item} />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
            <div className={styles.nav}>
                {listStart !== 1 && (
                    <Link to={`/${feedType}/${pageNum - 1}`} className={styles.prev}>
                        &#8249; Prev
                    </Link>
                )}
                {items && items.length === 30 && (
                    <Link to={`/${feedType}/${pageNum + 1}`} className={styles.more}>
                        More &#8250;
                    </Link>
                )}
            </div>
        </div>
    );
}
