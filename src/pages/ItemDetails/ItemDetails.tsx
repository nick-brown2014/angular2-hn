import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Comment } from '../../components/Comment/Comment';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useSettings } from '../../hooks/useSettings';
import { formatComment } from '../../utils/formatComment';
import { useItem } from '../../services';
import styles from './ItemDetails.module.scss';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemId = Number(id);
    const { data: item, isLoading, error } = useItem(itemId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    if (isLoading) return <Loader />;
    if (error) return <ErrorMessage message="Could not load item comments." />;
    if (!item) return null;

    const hasUrl = item.url?.indexOf('http') === 0;

    return (
        <div className={styles.mainContent}>
            <div className={styles.item}>
                <div className={`${styles.mobile} ${styles.itemHeader}`}>
                    <p className={styles.titleBlock}>
                        <span className={styles.backButton} onClick={() => navigate(-1)}></span>
                        {hasUrl ? (
                            <a
                                className={styles.title}
                                href={item.url}
                                target={settings.openLinkInNewTab ? '_blank' : undefined}
                                rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                            >
                                {item.title}
                            </a>
                        ) : (
                            <Link className={styles.title} to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        )}
                    </p>
                </div>

                <div
                    className={`${styles.laptop} ${item.comments_count > 0 || item.type === 'job' ? styles.itemHeader : ''} ${item.content ? styles.headMargin : ''}`}
                >
                    {hasUrl ? (
                        <p>
                            <a
                                className={styles.title}
                                href={item.url}
                                target={settings.openLinkInNewTab ? '_blank' : undefined}
                                rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                            >
                                {item.title}
                            </a>
                            {item.domain && <span className={styles.domain}> ({item.domain})</span>}
                        </p>
                    ) : (
                        <p>
                            <Link className={styles.title} to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        </p>
                    )}
                    <div className={styles.subtext}>
                        {item.type !== 'job' && (
                            <span>
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? styles.itemDetailsSpacing : undefined}>
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

                {item.type === 'poll' && item.poll && (
                    <div className={styles.pollResults}>
                        {item.poll.map((pollResult, index) => (
                            <div key={index} className={styles.pollContent}>
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                <div className={styles.subtext}>{pollResult.points} points</div>
                                <div
                                    className={styles.pollBar}
                                    style={{
                                        width: `${item.poll_votes_count > 0 ? (pollResult.points / item.poll_votes_count) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {item.content && <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content }} />}

                <ul className={styles.commentList}>
                    {item.comments?.map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
