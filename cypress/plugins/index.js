// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const webpack = require('@cypress/webpack-preprocessor');

const fakeApiDb = require('../../test/fake-api/db');
const fakeApiToken = require('../../test/fake-api/token');

module.exports = (on) => {
  const options = {
    // send in the options from your webpack.config.js, so it works the same
    // as your app's code
    webpackOptions: require('../../webpack.common'),
    watchOptions: {},
  };

  // Run specialized file preprocessor to transpile ES6+ -> ES5
  // This fixes compatibility issues with Electron
  on('file:preprocessor', webpack(options));

  on('task', {
    resetState: function () {
      return fakeApiDb.resetState();
    },
    generateJWT: function (options) {
      return fakeApiToken.generateJWT(options);
    },
    log (message) {
      console.log(message);
      return null;
    },
    failed: require('cypress-failed-log/src/failed')()
  });
};
