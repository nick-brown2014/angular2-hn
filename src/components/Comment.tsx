import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../models/types';
import '../styles/Comment.scss';

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="deleted-meta">
        <span className="collapse">[deleted]</span> | Comment Deleted
      </div>
    );
  }

  return (
    <div>
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        {!collapsed && (
          <div>
            <p
              className="comment-text"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {comment.comments && comment.comments.length > 0 && (
              <ul className="subtree">
                {comment.comments.map((sub) => (
                  <li key={sub.id}>
                    <Comment comment={sub} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
