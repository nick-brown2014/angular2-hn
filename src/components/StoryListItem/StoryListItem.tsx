import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import type { Story } from '../../models';
import { formatComment } from '../../utils/formatComment';
import styles from './StoryListItem.module.scss';

interface StoryListItemProps {
    story: Story;
}

export function StoryListItem({ story }: StoryListItemProps) {
    const { settings } = useSettings();
    const hasUrl = story.url?.indexOf('http') === 0;

    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            <p className={styles.titleRow}>
                {hasUrl ? (
                    <a
                        className={styles.title}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        href={story.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                    >
                        {story.title}
                    </a>
                ) : (
                    <Link
                        className={styles.title}
                        style={{ fontSize: `${settings.titleFontSize}px` }}
                        to={`/item/${story.id}`}
                    >
                        {story.title}
                    </Link>
                )}
                {hasUrl && story.domain && <span className={styles.domain}> ({story.domain})</span>}
            </p>
            <div className={styles.subtextPalm}>
                {story.type !== 'job' && (
                    <div className={styles.details}>
                        <span className={styles.name}>
                            <Link to={`/user/${story.user}`}>{story.user}</Link>
                        </span>
                        <span className={styles.right}>{story.points} &#9733;</span>
                    </div>
                )}
                <div className={styles.details}>
                    {story.time_ago}
                    {story.type !== 'job' && (
                        <Link to={`/item/${story.id}`} className={styles.commentNumber}>
                            {' '}&bull; {formatComment(story.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className={styles.subtextLaptop}>
                {story.type !== 'job' && (
                    <span>
                        {story.points} points by{' '}
                        <Link to={`/user/${story.user}`}>{story.user}</Link>
                    </span>
                )}
                <span className={story.type !== 'job' ? styles.itemDetails : undefined}>
                    {story.time_ago}
                    {story.type !== 'job' && (
                        <span>
                            {' | '}
                            <Link to={`/item/${story.id}`}>{formatComment(story.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
