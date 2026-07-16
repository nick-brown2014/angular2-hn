import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useSettings } from '../../hooks/useSettings';
import { useUser } from '../../services/queries';
import styles from './User.module.scss';

function addNewTabAttributes(html: string): string {
    const document = new DOMParser().parseFromString(html, 'text/html');
    document.querySelectorAll('a').forEach((link) => {
        link.target = '_blank';
        link.rel = 'noopener';
    });
    return document.body.innerHTML;
}

export function UserPage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: user, isLoading, error } = useUser(id);

    if (isLoading) return <Loader />;
    if (error) return <ErrorMessage message={`Could not load user ${id}.`} />;
    if (!user) return null;

    const about = settings.openLinkInNewTab ? addNewTabAttributes(user.about) : user.about;

    return (
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
                    <p dangerouslySetInnerHTML={{ __html: about }} />
                </div>
            )}
        </div>
    );
}
