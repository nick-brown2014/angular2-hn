import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackernews-api';
import { useSettings } from '../../contexts/SettingsContext';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Comment } from '../../components/Comment/Comment';
import { formatCommentCount } from '../../utils/formatCommentCount';
import './item-details.scss';

export function ItemDetails() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story>();
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    setItem(undefined);
    setErrorMessage('');
    window.scrollTo(0, 0);
    fetchItemContent(id)
      .then((value) => {
        if (!cancelled) setItem(value);
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('Could not load item comments.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
  const hasUrl = (item?.url ?? '').indexOf('http') === 0;
  return (
    <div className="app-item-details">
      <div className="main-content">
        {!item && !errorMessage && <Loader />}
        {!item && errorMessage && <ErrorMessage message={errorMessage} />}
        {item && (
          <div className="item">
            <div className="mobile item-header">
              <p className="title-block">
                <span className="back-button" onClick={() => navigate(-1)} />
                {' '}
                {hasUrl ? (
                  <a className="title" href={item.url} {...externalProps}>
                    {item.title}
                  </a>
                ) : (
                  <Link className="title" to={`/item/${item.id}`}>
                    {item.title}
                  </Link>
                )}
              </p>
            </div>
            <div
              className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}
            >
              {hasUrl ? (
                <p>
                  <a className="title" href={item.url} {...externalProps}>
                    {item.title}
                  </a>
                  {item.domain && (
                    <>
                      {' '}
                      <span className="domain">({item.domain})</span>
                    </>
                  )}
                </p>
              ) : (
                <p>
                  <Link className="title" to={`/item/${item.id}`}>
                    {item.title}
                  </Link>
                </p>
              )}
              <div className="subtext">
                <span>
                  {item.type !== 'job' && (
                    <>
                      {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </>
                  )}
                </span>
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                  {item.time_ago}
                  {item.type !== 'job' && (
                    <>
                      {' '}
                      | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                    </>
                  )}
                </span>
              </div>
            </div>
            {item.type === 'poll' && (
              <div className="pollResults">
                {item.poll.map((result, index) => (
                  <div className="pollContent" key={index}>
                    <div dangerouslySetInnerHTML={{ __html: result.content }} />
                    <div className="subtext">{result.points} points</div>
                    <div
                      className="pollBar"
                      style={{ width: `${item.poll_votes_count ? (result.points / item.poll_votes_count) * 100 : 0}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
            <ul className="comment-list">
              {item.comments.map((comment) => (
                <li key={comment.id}>
                  <Comment comment={comment} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
