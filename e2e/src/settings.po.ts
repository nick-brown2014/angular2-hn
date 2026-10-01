import { browser, by, element, ElementFinder, ExpectedConditions as EC } from 'protractor';

import { AppPage } from './app.po';

export class SettingsPanel extends AppPage {
  getCog(): ElementFinder {
    return element(by.css('app-header img.settings'));
  }

  getPanel(): ElementFinder {
    return element(by.css('app-settings .popup'));
  }

  getCloseButton(): ElementFinder {
    return element(by.css('app-settings .close'));
  }

  getThemeRadio(theme: 'default' | 'night' | 'amoledblack'): ElementFinder {
    return element(by.css(`app-settings input[name="theme"][value="${theme}"]`));
  }

  getOpenInNewTabCheckbox(): ElementFinder {
    return element(by.css('app-settings input[type="checkbox"]'));
  }

  async open() {
    await this.getCog().click();
    await browser.wait(EC.visibilityOf(this.getPanel()), 5000, 'settings panel did not open');
  }

  async close() {
    await this.getCloseButton().click();
    await browser.wait(EC.stalenessOf(this.getPanel()), 5000, 'settings panel did not close');
  }
}
