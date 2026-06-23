import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchItemContent } from '../../api/hackernews';
import { useSettings } from '../../hooks/useSettings';
import { formatComment } from '../../utils/formatComment';
import { Comment } from './Comment';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import styles from './ItemDetails.module.scss';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const itemId = Number(id);

    const { data: item, isLoading, error } = useQuery({
        queryKey: ['item', itemId],
        queryFn: () => fetchItemContent(itemId),
        enabled: !isNaN(itemId),
    });

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
                {/* Mobile header */}
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

                {/* Laptop header */}
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
                                {item.points} points by{' '}
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
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

                {/* Poll results */}
                {item.type === 'poll' && item.poll && (
                    <div className={styles.pollResults}>
                        {item.poll.map((pollResult, i) => (
                            <div key={i} className={styles.pollContent}>
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                <div className={styles.subtext}>{pollResult.points} points</div>
                                <div
                                    className={styles.pollBar}
                                    style={{ width: `${item.poll_votes_count > 0 ? (pollResult.points / item.poll_votes_count) * 100 : 0}%` }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                {item.content && (
                    <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content }} />
                )}

                {/* Comments */}
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
