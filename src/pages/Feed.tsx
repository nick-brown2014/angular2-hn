import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useFeed } from '../services/hackernews';
import Item from '../components/Item';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/Feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = Number(page) || 1;
  const { data: items, isLoading, error } = useFeed(feedType, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [feedType, pageNum]);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="main-content">
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator.
          You can also get a job at a YC startup through{' '}
          <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
        </p>
      )}
      <ol
        className={feedType !== 'jobs' ? 'list-margin' : undefined}
        start={listStart}
      >
        {items?.map((item) => (
          <li key={item.id} className="post">
            <Item item={item} />
          </li>
        ))}
      </ol>
      <div className="nav">
        {pageNum > 1 && (
          <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
            ‹ Prev
          </Link>
        )}
        {items && items.length === 30 && (
          <Link to={`/${feedType}/${pageNum + 1}`} className="more">
            More ›
          </Link>
        )}
      </div>
    </div>
  );
}
