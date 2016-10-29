require('require-all')({
  dirname: __dirname,
  excludeDirs: process.env.CI ? /^\./ : /^\.|benchmark/
});
