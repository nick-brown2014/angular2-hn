import { useSettings } from '../../hooks/useSettings';
import styles from './Settings.module.scss';

export function Settings() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h1>Settings</h1>
                <hr />
                <span className={styles.close} onClick={toggleSettings}>&times;</span>
                <div className={styles.content}>
                    <div className={styles.controlSection}>
                        <h2>Links</h2>
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.openLinkInNewTab}
                                onChange={toggleOpenLinksInNewTab}
                            />
                            {' '}Open links in a new tab
                        </label>
                    </div>
                    <div className={styles.themeControls}>
                        <div className={styles.controlSection}>
                            <h2>Select a theme</h2>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="default"
                                        checked={settings.theme === 'default'}
                                        onChange={() => setTheme('default')}
                                    />
                                    {' '}Default
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="night"
                                        checked={settings.theme === 'night'}
                                        onChange={() => setTheme('night')}
                                    />
                                    {' '}Night
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        name="theme"
                                        type="radio"
                                        value="amoledblack"
                                        checked={settings.theme === 'amoledblack'}
                                        onChange={() => setTheme('amoledblack')}
                                    />
                                    {' '}Black (AMOLED)
                                </label>
                            </div>
                        </div>
                        <div className={styles.controlSection}>
                            <h2>Change Font</h2>
                            <div>
                                <label>
                                    Font size:
                                    <input
                                        min="1"
                                        value={settings.titleFontSize}
                                        type="number"
                                        onChange={(e) => setFont(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    List spacing:
                                    <input
                                        min="0"
                                        value={settings.listSpacing}
                                        type="number"
                                        onChange={(e) => setSpacing(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
