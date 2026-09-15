import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { FeedName } from '../../models/feed-type.type';
import type { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Item } from '../../components/Item/Item';
import './feed.scss';

export function Feed({ feedType }: { feedType: FeedName }) {
  const page = Number(useParams().page ?? 1);
  const [items, setItems] = useState<Story[] | undefined>();
  const [errorMessage, setErrorMessage] = useState('');
  const listStart = (page - 1) * 30 + 1;
  useEffect(() => {
    let cancelled = false;
    setItems(undefined); setErrorMessage('');
    fetchFeed(feedType, page).then((result) => { if (!cancelled) { setItems(result); window.scrollTo(0, 0); } }).catch(() => { if (!cancelled) setErrorMessage(`Could not load ${feedType} stories.`); });
    return () => { cancelled = true; };
  }, [feedType, page]);
  return <div className="app-feed"><div className="main-content">{!items && !errorMessage && <Loader />}{!items && errorMessage && <ErrorMessage message={errorMessage} />}{items && <><>{feedType === 'jobs' && <p className="job-header">These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.</p>}</><ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>{items.map((item) => <li className="post" key={item.id}><Item item={item} /></li>)}</ol><div className="nav">{listStart !== 1 && <Link to={`/${feedType}/${page - 1}`} className="prev">‹ Prev</Link>}{items.length === 30 && <Link to={`/${feedType}/${page + 1}`} className="more">More ›</Link>}</div></>}</div></div>;
}
