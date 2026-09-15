import { useSettings } from '../../contexts/SettingsContext';
import './settings.scss';

export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
  return (
    <div id="popup1" className="app-settings overlay">
      <div className="popup">
        <h1>Settings</h1>
        <hr />
        <span className="close" onClick={toggleSettings}>
          &times;
        </span>
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <label>
              <input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open
              links in a new tab
            </label>
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              {[
                ['default', 'Default'],
                ['night', 'Night'],
                ['amoledblack', 'Black (AMOLED)'],
              ].map(([value, label]) => (
                <div key={value}>
                  <label>
                    <input
                      name="theme"
                      type="radio"
                      value={value}
                      checked={settings.theme === value}
                      onChange={() => setTheme(value)}
                    />{' '}
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <div className="control-section">
              <h2>Change Font</h2>
              <div>
                <label>
                  Font size:{' '}
                  <input
                    min="1"
                    value={settings.titleFontSize}
                    name="titleFontSize"
                    type="number"
                    onChange={(event) => setFont(event.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  List spacing:{' '}
                  <input
                    min="0"
                    value={settings.listSpacing}
                    name="listSpacing"
                    type="number"
                    onChange={(event) => setSpacing(event.target.value)}
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
