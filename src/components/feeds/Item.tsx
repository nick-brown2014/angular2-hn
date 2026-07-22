import { Link } from 'react-router-dom';
import { Story } from '../../models/story';
import { useSettings } from '../../context/SettingsContext';
import { commentLabel } from '../../utils/comment';
import './Item.scss';

interface ItemProps {
    item: Story;
}

export default function Item({ item }: ItemProps) {
    const { settings } = useSettings();
    const hasUrl = !!item.url && item.url.indexOf('http') === 0;
    const targetProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};

    return (
        <div style={{ marginBottom: settings.listSpacing + 'px' }}>
            {hasUrl ? (
                <p>
                    <a
                        className="title"
                        style={{ fontSize: settings.titleFontSize + 'px' }}
                        href={item.url}
                        {...targetProps}
                    >
                        {item.title}
                    </a>
                    {item.domain && <span className="domain">({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link className="title" style={{ fontSize: settings.titleFontSize + 'px' }} to={`/item/${item.id}`}>
                        {item.title}
                    </Link>
                </p>
            )}
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
                            {' '}
                            • {commentLabel(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
