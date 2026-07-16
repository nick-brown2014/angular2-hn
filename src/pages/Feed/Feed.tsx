import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useFeed } from '../../services';
import type { FeedSlug } from '../../models';
import { StoryListItem } from '../../components/StoryListItem/StoryListItem';
import styles from './Feed.module.scss';

export function Feed({ feedType }: { feedType: FeedSlug }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? parseInt(page, 10) : 1;
    const listStart = (pageNum - 1) * 30 + 1;
    const { data: items, isLoading, error } = useFeed(feedType, pageNum);

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
            <ol className={`${styles.ol} ${feedType !== 'jobs' ? styles.listMargin : ''}`} start={listStart}>
                {items?.map((story) => (
                    <li key={story.id} className={styles.post}>
                        <div className={styles.itemBlock}>
                            <StoryListItem story={story} />
                        </div>
                    </li>
                ))}
            </ol>
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
