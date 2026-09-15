import { Link } from 'react-router-dom';
import type { Story } from '../../models/story';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCommentCount } from '../../utils/formatCommentCount';
import './item.scss';

export function Item({ item }: { item: Story }) {
  const { settings } = useSettings();
  const hasUrl = (item.url ?? '').indexOf('http') === 0;
  const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <div className="app-item" style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl ? (
        <p>
          <a className="title" style={{ fontSize: `${settings.titleFontSize}px` }} href={item.url} {...externalProps}>
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
          <Link className="title" style={{ fontSize: `${settings.titleFontSize}px` }} to={`/item/${item.id}`}>
            {item.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        <div className="details">
          {item.type !== 'job' && (
            <>
              <span className="name">
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
              <span className="right">{item.points} ★</span>
            </>
          )}
        </div>
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' '}
              • {formatCommentCount(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
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
  );
}
