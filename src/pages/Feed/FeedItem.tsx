import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { formatComment } from '../../utils/formatComment';
import type { Story } from '../../models/story';
import styles from './FeedItem.module.scss';

interface FeedItemProps {
    item: Story;
}

export function FeedItem({ item }: FeedItemProps) {
    const { settings } = useSettings();
    const hasUrl = item.url?.indexOf('http') === 0;

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            <p className={styles.titleRow}>
                {hasUrl ? (
                    <a
                        className={styles.title}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {item.title}
                    </a>
                ) : (
                    <Link
                        className={styles.title}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        to={`/item/${item.id}`}
                    >
                        {item.title}
                    </Link>
                )}
                {item.domain && <span className={styles.domain}> ({item.domain})</span>}
            </p>
            <div className={styles.subtextPalm}>
                {item.type !== 'job' && (
                    <div className={styles.details}>
                        <span className={styles.name}>
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className={styles.right}>{item.points} &#9733;</span>
                    </div>
                )}
                <div className={styles.details}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <Link to={`/item/${item.id}`} className={styles.commentNumber}>
                            {' '}&bull; {formatComment(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className={styles.subtextLaptop}>
                {item.type !== 'job' && (
                    <span>
                        {item.points} points by{' '}
                        <Link to={`/user/${item.user}`}>{item.user}</Link>
                    </span>
                )}
                <span className={item.type !== 'job' ? styles.itemDetails : undefined}>
                    {item.time_ago}
                    {item.type !== 'job' && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
