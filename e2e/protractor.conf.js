// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

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
      args: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1280,1024'],
      ...(process.env.CHROME_BIN ? { binary: process.env.CHROME_BIN } : {}),
      w3c: false
    }
  },
  directConnect: true,
  // Point at a chromedriver matching your local Chrome when webdriver-manager's default doesn't.
  ...(process.env.CHROMEDRIVER_PATH ? { chromeDriver: process.env.CHROMEDRIVER_PATH } : {}),
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