import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/useSettings';
import { useItem } from '../services/hackernews';
import { formatCommentCount } from '../utils/commentPipe';
import Comment from '../components/Comment';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const settings = useSettings();
  const { data: item, isLoading, error } = useItem(Number(id));
  const hasUrl = !!item?.url;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  function goBack() {
    navigate(-1);
  }

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!item) return null;

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={goBack} />
            {hasUrl ? (
              <a
                className="title"
                href={item.url}
                target={linkTarget}
                rel={linkRel}
              >
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
          className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
        >
          <p>
            {hasUrl ? (
              <>
                <a
                  className="title"
                  href={item.url}
                  target={linkTarget}
                  rel={linkRel}
                >
                  {item.title}
                </a>
                {item.domain && <span className="domain"> ({item.domain})</span>}
              </>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
          <div className="subtext">
            {item.type !== 'job' && (
              <span>
                {item.points} points by{' '}
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' | '}
                  <Link to={`/item/${item.id}`}>
                    {formatCommentCount(item.comments_count)}
                  </Link>
                </span>
              )}
            </span>
          </div>
        </div>

        {item.type === 'poll' && item.poll && (
          <div className="pollResults">
            {item.poll.map((pollResult, i) => (
              <div key={i} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {item.content && (
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {item.comments && item.comments.length > 0 && (
          <ul className="comment-list">
            {item.comments.map((comment) => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
