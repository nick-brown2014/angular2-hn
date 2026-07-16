import { useSettings } from '../../hooks/useSettings';

export function SettingsControls() {
    const { settings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    return (
        <>
            <div className="controlSection">
                <h2>Links</h2>
                <label><input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open links in a new tab</label>
            </div>
            <div className="themeControls">
                <div className="controlSection">
                    <h2>Select a theme</h2>
                    {(['default', 'night', 'amoledblack'] as const).map((theme) => (
                        <div key={theme}><label><input name="theme" type="radio" value={theme} checked={settings.theme === theme} onChange={() => setTheme(theme)} /> {theme === 'default' ? 'Default' : theme === 'night' ? 'Night' : 'Black (AMOLED)'}</label></div>
                    ))}
                </div>
                <div className="controlSection">
                    <h2>Change Font</h2>
                    <label>Font size:<input min="1" value={settings.titleFontSize} type="number" onChange={(event) => setFont(event.target.value)} /></label>
                    <label>List spacing:<input min="0" value={settings.listSpacing} type="number" onChange={(event) => setSpacing(event.target.value)} /></label>
                </div>
            </div>
        </>
    );
}
