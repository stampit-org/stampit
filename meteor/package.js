Package.describe({
  name: 'stampitorg:stampit',
  version: '2.1.0',
  // Brief, one-line summary of the package.
  summary: 'Provides stampit library for meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stampit-org/stampit',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "stampit": "2.1.0"
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use(['cosmos:browserify@0.2.0'], 'client');
  api.addFiles(['client.browserify.js'], 'client');

  api.addFiles(['server.stampit.js'], 'server');

  api.export('stampit');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('stampitorg:stampit');
  api.addFiles('stampit-tests.js');
});
