import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { fetchFeed } from '../../api/hackerNews';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import Item from './Item';
import './Feed.scss';

interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;

    const [items, setItems] = useState<Story[] | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItems(undefined);
        setErrorMessage('');

        fetchFeed(feedType, pageNum, controller.signal)
            .then((data) => {
                setItems(data);
                window.scrollTo(0, 0);
            })
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }
                console.error(error);
                setErrorMessage('Could not load ' + feedType + ' stories.');
            });

        return () => controller.abort();
    }, [feedType, pageNum]);

    const listStart = (pageNum - 1) * 30 + 1;

    if (!items && !errorMessage) {
        return (
            <div className="main-content">
                <Loader />
            </div>
        );
    }

    if (!items && errorMessage !== '') {
        return (
            <div className="main-content">
                <ErrorMessage message={errorMessage} />
            </div>
        );
    }

    return (
        <div className="main-content">
            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
