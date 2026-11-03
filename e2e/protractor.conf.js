// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

// Protractor 5's webdriver-manager can't download drivers for current Chrome releases.
// Set CHROME_BIN / CHROMEDRIVER_BIN to use a local Chrome and a matching chromedriver
// (and pass --webdriver-update=false to `ng e2e`).
const chromeBinary = process.env.CHROME_BIN;
const chromeDriver = process.env.CHROMEDRIVER_BIN;

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
    'goog:chromeOptions': {
      ...(chromeBinary ? { binary: chromeBinary } : {}),
      args: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1280,1024']
    }
  },
  ...(chromeDriver ? { chromeDriver } : {}),
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
