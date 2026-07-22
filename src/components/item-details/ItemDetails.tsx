import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Story } from '../../models/story';
import { fetchItemContent } from '../../api/hackerNews';
import { useSettings } from '../../context/SettingsContext';
import { commentLabel } from '../../utils/comment';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<Story | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(undefined);
        setErrorMessage('');

        fetchItemContent(Number(id), controller.signal)
            .then((data) => setItem(data))
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }
                console.error(error);
                setErrorMessage('Could not load item comments.');
            });

        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);

    const goBack = () => navigate(-1);

    if (!item && !errorMessage) {
        return (
            <div className="main-content">
                <Loader />
            </div>
        );
    }

    if (!item && errorMessage !== '') {
        return (
            <div className="main-content">
                <ErrorMessage message={errorMessage} />
            </div>
        );
    }

    if (!item) {
        return <div className="main-content"></div>;
    }

    const hasUrl = !!item.url && item.url.indexOf('http') === 0;
    const targetProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || item.type === 'job') {
        laptopClasses.push('item-header');
    }
    if (item.content) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={goBack}></span>
                        {hasUrl ? (
                            <a className="title" href={item.url} {...targetProps}>
                                {item.title}
                            </a>
                        ) : (
                            <Link className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        )}
                    </p>
                </div>
                <div className={laptopClasses.join(' ')}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} {...targetProps}>
                                {item.title}
                            </a>
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </p>
                    ) : (
                        <p>
                            <Link className="title" to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        </p>
                    )}
                    <div className="subtext">
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
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: (pollResult.points / item.poll_votes_count) * 100 + '%' }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                <ul className="comment-list">
                    {item.comments &&
                        item.comments.map((comment) => (
                            <li key={comment.id}>
                                <Comment comment={comment} />
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
}
