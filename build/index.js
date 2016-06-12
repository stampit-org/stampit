/* eslint-disable no-console */

import pkg from '../package.json';

import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

// This code reimplements the "babel-preset-es2015-rollup" module.
// But also does not include "external-helpers" babel plugin.
// That plugin made the code too large and also is hard to configure.
const es2015Plugins = Object.keys(
  require('../node_modules/babel-preset-es2015/package.json')
  .dependencies)
  // This plugin must be excluded for rollup. Otherwise, it doesn't work.
  .filter(dep =>
    dep !== 'babel-plugin-transform-es2015-modules-commonjs' &&
    dep !== 'babel-plugin-transform-es2015-typeof-symbol'
  )
  .map(dep => '../node_modules/babel-preset-es2015/node_modules/' + dep)
  .map(require);

const moduleName = 'stampit';

function execute() {
  return Promise.all([
    makeBundle(
      {format: 'es6', ext: '.mjs'}
    ),
    makeBundle(
      {format: 'cjs', ext: '.js'}
    ),
    makeBundle(
      {
        format: 'cjs', ext: '.es5.js',
        babelPlugins: es2015Plugins
      }
    ),
    makeBundle(
      {
        format: 'umd', ext: '.full.js',
        babelPlugins: es2015Plugins
      }
    ),
    makeBundle(
      {
        format: 'umd', ext: '.full.min.js', minify: true,
        babelPlugins: es2015Plugins
      }
    )
  ]);
}

function makeBundle(config) {
  const isUMD = config.format === 'umd';

  const inputConfig = {
    entry: 'src/stampit.js',
    plugins: [
      babel({
        babelrc: false,
        exclude: 'node_modules/**',
        plugins: config.babelPlugins || [],
        runtimeHelpers: isUMD,
        externalHelpers: isUMD
      })
    ]
  };

  if (!isUMD) {
    inputConfig.external = Object.keys(pkg.dependencies);
  }

  if (config.minify) {
    inputConfig.plugins.push(uglify());
  }

  const outputConfig = {
    dest: `dist/${moduleName}${config.ext}`,
    format: config.format,
    sourceMap: !config.minify,
    moduleName: moduleName,
    exports: 'named'
  };

  return rollup.rollup(inputConfig)
    .then(bundle => bundle.write(outputConfig))
    .then(() => console.log('created', outputConfig.dest));
}

console.log('building...');

execute()
  .then(() => console.log('finished'))
  .catch((err) => console.log(err.stack || err));
