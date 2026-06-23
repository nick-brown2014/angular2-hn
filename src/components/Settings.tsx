import { useSettings } from '../contexts/useSettings';
import '../styles/Settings.scss';

export default function Settings() {
  const settings = useSettings();

  return (
    <div className="overlay">
      <div className="popup">
        <h1>Settings</h1>
        <hr />
        <span className="close" onClick={() => settings.toggleSettings()}>
          &times;
        </span>
        <div className="content">
          <div className="control-section">
            <h2>Links</h2>
            <label>
              <input
                type="checkbox"
                checked={settings.openLinkInNewTab}
                onChange={() => settings.toggleOpenLinksInNewTab()}
              />
              {' Open links in a new tab'}
            </label>
          </div>
          <div className="theme-controls">
            <div className="control-section">
              <h2>Select a theme</h2>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="default"
                    checked={settings.theme === 'default'}
                    onChange={() => settings.setTheme('default')}
                  />
                  {' Default'}
                </label>
              </div>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="night"
                    checked={settings.theme === 'night'}
                    onChange={() => settings.setTheme('night')}
                  />
                  {' Night'}
                </label>
              </div>
              <div>
                <label>
                  <input
                    name="theme"
                    type="radio"
                    value="amoledblack"
                    checked={settings.theme === 'amoledblack'}
                    onChange={() => settings.setTheme('amoledblack')}
                  />
                  {' Black (AMOLED)'}
                </label>
              </div>
            </div>
            <div className="control-section">
              <h2>Change Font</h2>
              <div>
                <label>
                  {'Font size: '}
                  <input
                    min="1"
                    value={settings.titleFontSize}
                    type="number"
                    onChange={(e) => settings.setFont(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>
                  {'List spacing: '}
                  <input
                    min="0"
                    value={settings.listSpacing}
                    type="number"
                    onChange={(e) => settings.setSpacing(e.target.value)}
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
