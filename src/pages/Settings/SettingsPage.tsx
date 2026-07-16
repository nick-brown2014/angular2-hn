import { SettingsControls } from '../../components/Settings/SettingsControls';
import styles from './SettingsPage.module.scss';

export function SettingsPage() {
    return <main className={styles.page}><h1>Settings</h1><SettingsControls /></main>;
}
