/* eslint-disable no-console */

import pkg from '../package.json';

import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import MagicString from 'magic-string';

// This code reimplements the "babel-preset-es2015-rollup" module.
// But also does not include "external-helpers" babel plugin.
// That plugin made the code too large and also is hard to configure.
// The main idea is to make sure babel does not transpile ES6 modules to CJS
// because Rollup handles import/export itself.
const es2015Plugins = pkg.babel.plugins;

const moduleName = 'stampit';

function execute() {
  return Promise.all([

    // The main stampit distributable bundle. Meaning no other files needed
    makeBundle(
      {
        format: 'cjs',
        ext: '.full.js',
        babelPlugins: es2015Plugins,
        dest: 'dist',
        moduleName: 'stampit'
      }
    ),

    // The UMD build for browsers
    makeBundle(
      {
        format: 'umd',
        ext: '.umd.js',
        babelPlugins: es2015Plugins,
        dest: 'dist',
        moduleName: 'stampit'
      }
    ),

    // The minified UMD build for browsers
    makeBundle(
      {
        format: 'umd',
        ext: '.umd.min.js',
        minify: true,
        babelPlugins: es2015Plugins,
        dest: 'dist',
        moduleName: 'stampit'
      }
    ),

    // The experimental ES6 bundle
    makeBundle(
      {
        format: 'es',
        ext: '.mjs',
        dest: 'dist',
        moduleName: 'stampit'
      }
    ),


    // The "stampit/compose" file for direct importing
    makeBundle(
      {
        format: 'cjs',
        ext: '.js',
        babelPlugins: es2015Plugins,
        dest: '.',
        moduleName: 'compose'
      }
    ),
    // The "stampit/isStamp" file for direct importing
    makeBundle(
      {
        format: 'cjs',
        ext: '.js',
        babelPlugins: es2015Plugins,
        dest: '.',
        moduleName: 'isStamp'
      }
    ),
    // The "stampit/isComposable" file for direct importing
    makeBundle(
      {
        format: 'cjs',
        ext: '.js',
        babelPlugins: es2015Plugins,
        dest: '.',
        moduleName: 'isComposable'
      }
    )
  ]);
}

/**
 * Adds a `module.exports = exports.default` so Node users can
 * do `require('stampit')()`
 * @param {Object} [opts={}] Options
 * @param {boolean} [opts.sourceMap=true] Generate a source map
 * @returns {Object}
 */
function defaultExport(opts = {}) {
  const sourceMap = opts.sourceMap !== false;
  return {
    transformBundle (code) {
      const magicString = new MagicString(code);
      magicString.append("\nmodule.exports = exports['default'];");
      code = magicString.toString();
      const map = sourceMap ? magicString.generateMap() : null;
      return {code, map};
    }
  }
}

function makeBundle(config) {
  const outputConfig = {
    dest: `${config.dest}/${config.moduleName}${config.ext}`,
    format: config.format,
    sourceMap: !config.minify,
    moduleName: config.moduleName,
    exports: 'named'
  };

  const isUMD = config.format === 'umd';
  const isCJS = config.format === 'cjs';

  const inputConfig = {
    entry: `src/${config.moduleName}.js`,
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
    inputConfig.plugins.push(filesize({
      render: (opt, size, gzip) => `Estimating ${outputConfig.dest}: ${size}, GZIP : ${gzip}`
    }));
  }

  if (isCJS) {
    inputConfig.plugins.push(defaultExport({
      sourceMap: !config.minify
    }));
  }

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
