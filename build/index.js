/* eslint-disable no-console */

import pkg from '../package.json';

import {rollup} from 'rollup';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import removeEsModuleFreeze from 'rollup-plugin-es3';

function execute() {
  return Promise.all([

    // // The main stampit distributable bundle. Meaning no other files needed
    // makeBundle(
    //   {
    //     format: 'cjs',
    //     ext: '.esm.js',
    //     dest: 'dist',
    //     moduleName: 'stampit'
    //   }
    // ),

    // The UMD build for browsers
    makeBundle(
      {
        format: 'umd',
        ext: '.umd.js',
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
        dest: 'dist',
        moduleName: 'stampit'
      }
    ),

    //
    //
    // // The "stampit/compose" file for direct importing
    // makeBundle(
    //   {
    //     format: 'cjs',
    //     ext: '.js',
    //     dest: '.',
    //     moduleName: 'compose'
    //   }
    // ),
    // // The "stampit/isStamp" file for direct importing
    // makeBundle(
    //   {
    //     format: 'cjs',
    //     ext: '.js',
    //     dest: '.',
    //     moduleName: 'isStamp'
    //   }
    // ),
    // // The "stampit/isComposable" file for direct importing
    // makeBundle(
    //   {
    //     format: 'cjs',
    //     ext: '.js',
    //     dest: '.',
    //     moduleName: 'isComposable'
    //   }
    // )
  ]);
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

  const inputConfig = {
    entry: `src/${config.moduleName}.js`,
    plugins: [
      buble(),
    ]
  };

  if (isUMD) {
    inputConfig.plugins.push(removeEsModuleFreeze());
  } else {
    inputConfig.external = Object.keys(pkg.dependencies);
  }

  if (config.minify) {
    inputConfig.plugins.push(uglify());
    inputConfig.plugins.push(filesize({
      format: {exponent: 0},
      render: (opt, size, gzip) => `Estimating ${outputConfig.dest}: ${size}, GZIP : ${gzip}`
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
