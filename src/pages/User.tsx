import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../services/hackernews';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/User.scss';

export default function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id!);

  function goBack() {
    navigate(-1);
  }

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!user) return null;

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={goBack} />
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} ★</span>
        <p className="age">Created {user.created}</p>
      </div>
      {user.about && (
        <div
          className="other-details"
          dangerouslySetInnerHTML={{ __html: user.about }}
        />
      )}
    </div>
  );
}
