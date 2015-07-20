var webpack = require('webpack');

var minify = process.env.MINIFY || false;
var uglify = minify ? [new webpack.optimize.UglifyJsPlugin()] : [];

module.exports = {
  entry: './dist/stampit.js',
  output: {
    path: __dirname + '/dist',
    filename: minify ? 'stampit.web.min.js' : 'stampit.web.js',
    libraryTarget: 'var',
    library: 'stampit'
  },
  plugins: [].concat(uglify)
};
