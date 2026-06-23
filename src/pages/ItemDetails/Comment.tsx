import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../../types/comment';
import styles from './Comment.module.scss';

interface CommentProps {
    comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
    const [collapsed, setCollapsed] = useState(false);

    if (comment.deleted) {
        return (
            <div className={styles.deletedMeta}>
                <span className={styles.collapse}>[deleted]</span> | Comment Deleted
            </div>
        );
    }

    return (
        <div>
            <div className={`${styles.meta} ${collapsed ? styles.metaCollapse : ''}`}>
                <span className={styles.collapse} onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles.commentTree}>
                {!collapsed && (
                    <div>
                        <p
                            className={styles.commentText}
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        <ul className={styles.subtree}>
                            {comment.comments?.map((sub) => (
                                <li key={sub.id}>
                                    <Comment comment={sub} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
