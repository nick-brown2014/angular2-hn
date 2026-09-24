import { Settings } from '../app/shared/models/settings';

export function createMockSettingsService() {
  const settings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };
  return {
    settings,
    toggleSettings: jasmine.createSpy('toggleSettings'),
    toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
    setTheme: jasmine.createSpy('setTheme'),
    setFont: jasmine.createSpy('setFont'),
    setSpacing: jasmine.createSpy('setSpacing')
  };
}
