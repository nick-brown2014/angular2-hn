import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useHackerNews';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import styles from './User.module.scss';

export function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: user, isLoading, error } = useUser(id);

    if (isLoading) return <Loader />;
    if (error) return <ErrorMessage message={`Could not load user ${id}.`} />;
    if (!user) return null;

    return (
        <div>
            <div className={styles.profile}>
                <div className={`${styles.mobile} ${styles.itemHeader}`}>
                    <p className={styles.titleBlock}>
                        <span className={styles.backButton} onClick={() => navigate(-1)}></span>
                        Profile: {user.id}
                    </p>
                </div>
                <div className={styles.mainDetails}>
                    <span className={styles.name}>{user.id}</span>
                    <span className={styles.right}>{user.karma} &#9733;</span>
                    <p className={styles.age}>Created {user.created}</p>
                </div>
                {user.about && (
                    <div className={styles.otherDetails}>
                        <p dangerouslySetInnerHTML={{ __html: user.about }} />
                    </div>
                )}
            </div>
        </div>
    );
}
