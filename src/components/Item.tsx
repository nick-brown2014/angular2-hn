import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/useSettings';
import { formatCommentCount } from '../utils/commentPipe';
import type { Story } from '../models/types';
import '../styles/Item.scss';

interface ItemProps {
  item: Story;
}

export default function Item({ item }: ItemProps) {
  const settings = useSettings();
  const hasUrl = !!item.url;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div style={{ marginBottom: `${settings.listSpacing}px` }}>
      <p>
        {hasUrl ? (
          <>
            <a
              className="title"
              style={{ fontSize: `${settings.titleFontSize}px` }}
              href={item.url}
              target={linkTarget}
              rel={linkRel}
            >
              {item.title}
            </a>
            {item.domain && <span className="domain"> ({item.domain})</span>}
          </>
        ) : (
          <Link
            className="title"
            style={{ fontSize: `${settings.titleFontSize}px` }}
            to={`/item/${item.id}`}
          >
            {item.title}
          </Link>
        )}
      </p>
      <div className="subtext-palm">
        {item.type !== 'job' && (
          <div className="details">
            <span className="name">
              <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' • '}
              {formatCommentCount(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
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
  );
}
