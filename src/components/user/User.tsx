import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserModel } from '../../models/user';
import { fetchUser } from '../../services/hackernews-api';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import '../../styles/components/user.scss';

export default function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let stale = false;
        setUser(null);
        setErrorMessage('');

        if (id) {
            fetchUser(id)
                .then((data) => {
                    if (!stale) {
                        setUser(data);
                    }
                })
                .catch(() => {
                    if (!stale) {
                        setErrorMessage('Could not load user ' + id + '.');
                    }
                });
        }

        return () => { stale = true; };
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} &#9733;</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
