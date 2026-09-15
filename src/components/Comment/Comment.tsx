import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentModel } from '../../models/comment';
import './comment.scss';

export function Comment({ comment }: { comment: CommentModel }) {
  const [collapse, setCollapse] = useState(false);
  if (comment.deleted) return <div className="app-comment"><div className="deleted-meta"><span className="collapse">[deleted]</span> | Comment Deleted</div></div>;
  return <div className="app-comment"><div className={`meta${collapse ? ' meta-collapse' : ''}`}><span className="collapse" onClick={() => setCollapse(!collapse)}>[{collapse ? '+' : '-'}]</span>{' '}<Link to={`/user/${comment.user}`}>{comment.user}</Link><span className="time">{comment.time_ago}</span></div><div className="comment-tree"><div hidden={collapse}><p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} /><ul className="subtree">{comment.comments.map((sub) => <li key={sub.id}><Comment comment={sub} /></li>)}</ul></div></div></div>;
}
