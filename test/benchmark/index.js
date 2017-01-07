if (process.env.CI) {
  require('require-all')({dirname: __dirname});
}
