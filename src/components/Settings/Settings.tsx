import { useSettings } from '../../hooks/useSettings';
import { SettingsControls } from './SettingsControls';
import styles from './Settings.module.scss';

export function Settings() {
    const { toggleSettings } = useSettings();
    return <div className={styles.overlay}><div className={styles.popup}><h1>Settings</h1><hr /><span className={styles.close} onClick={toggleSettings}>&times;</span><div className={styles.content}><SettingsControls /></div></div></div>;
}
