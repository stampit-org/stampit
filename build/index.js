/* eslint-disable no-console */

import pkg from '../package.json';

import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

// This code reimplements the "babel-preset-es2015-rollup" module.
// But also does not include "external-helpers" babel plugin.
// That plugin made the code too large and also is hard to configure.
// The main idea is to make sure babel does not transpile ES6 modules to CJS
// because Rollup handles import/export itself.
const es2015Plugins = pkg.babel.plugins;

const moduleName = 'stampit';

function execute() {
  return Promise.all([
    makeBundle(
      {format: 'es6', ext: '.mjs'}
    ),
    makeBundle(
      {
        format: 'cjs', ext: '.js',
        babelPlugins: es2015Plugins
      }
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

  return rollup(inputConfig)
    .then(bundle => bundle.write(outputConfig))
    .then(() => console.log('created', outputConfig.dest));
}

console.log('building...');

execute()
  .then(() => console.log('finished'))
  .catch((err) => {
    console.error(err.stack || err);
    process.exit(1);
  });
