// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

const chromeArgs = ['--window-size=1280,1024'];
if (process.env.HEADLESS || process.env.CI) {
  chromeArgs.push('--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage');
}

const chromeOptions = { args: chromeArgs };
if (process.env.CHROME_BIN) {
  chromeOptions.binary = process.env.CHROME_BIN;
}

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    browserName: 'chrome',
    chromeOptions
  },
  // Lets a chromedriver matching the local Chrome be used instead of webdriver-manager's download
  chromeDriver: process.env.CHROMEDRIVER_BIN || undefined,
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
