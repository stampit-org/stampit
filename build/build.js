/* eslint-disable no-console */

import pkg from '../package.json';

import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

const moduleName = 'stampit';

function execute() {
  return Promise.all([
    makeBundle(
      { format: 'es6', ext: '.mjs' }
    ),
    makeBundle(
      { format: 'cjs', ext: '.js' },
    ),
    makeBundle(
      { format: 'cjs', ext: '.es5.js',
        babelPresets: ['es2015-rollup'],
        babelPlugins: ['transform-runtime']
      }
    ),
    makeBundle(
      { format: 'umd', ext: '.full.js',
        babelPresets: ['es2015-rollup'],
        babelPlugins: ['transform-runtime', 'lodash']
      }
    ),
    makeBundle(
      { format: 'umd', ext: '.full.min.js', minify: true,
        babelPresets: ['es2015-rollup'],
        babelPlugins: ['transform-runtime', 'lodash']
      }
    )
  ]);
}

async function makeBundle(config) {
  const isUMD = config.format === 'umd';

  const inputConfig = {
    entry: 'src/stampit.js',
    plugins: [
      babel({
        babelrc: false,
        exclude: 'node_modules/**',
        presets: ['stage-1'].concat(config.babelPresets || []),
        plugins: config.babelPlugins || [],
        runtimeHelpers: isUMD,
        externalHelpers: isUMD
      }),
      nodeResolve({ preferBuiltins: true, browser: isUMD }),
      commonJs()
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

  const bundle = await rollup.rollup(inputConfig);
  await bundle.write(outputConfig);
  console.log('created', outputConfig.dest);
}

console.log('building...');

execute()
  .then(() => console.log('finished'))
  .catch((err) => console.log(err.stack || err));
