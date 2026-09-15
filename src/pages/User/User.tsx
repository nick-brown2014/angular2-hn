import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as UserModel } from '../../models/user';
import { fetchUser } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import './user.scss';

export function User() {
  const id = useParams().id!;
  const navigate = useNavigate();
  const [user, setUser] = useState<UserModel>();
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    setUser(undefined);
    setErrorMessage('');
    fetchUser(id)
      .then((value) => {
        if (!cancelled) setUser(value);
      })
      .catch(() => {
        if (!cancelled) setErrorMessage(`Could not load user ${id}.`);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return (
    <div className="app-user">
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage && <ErrorMessage message={errorMessage} />}
      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)} />
              {' '}
              Profile: {user.id}
            </p>
          </div>
          <div className="main-details">
            <span className="name">{user.id}</span>
            <span className="right">{user.karma} ★</span>
            <p className="age">Created {user.created}</p>
          </div>
          {user.about && (
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
