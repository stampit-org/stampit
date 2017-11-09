if (process.env.CI || process.browser) {
  require('./object-create');
  require('./property-access');
}
