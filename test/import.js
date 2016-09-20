/* eslint-disable */
import test from 'tape';

import stampit1 from '../dist/stampit';

test('import is the same as require', (t) => {
  const stampit2 = require('../dist/stampit');

  t.equal(stampit1, stampit2,
    'Should export same object for both ES6 and CommonJS');

  t.end();
});

test('can import the stampit/compose', t => {
  const compose = require('../compose');
  t.equal(typeof compose, 'function', 'Must be a function');

  const stamp = compose();
  t.equal(typeof stamp, 'function', 'Must be a function');
  t.equal(typeof stamp.compose, 'function', 'Must be a function');

  t.end();
});

test('can import the stampit/isStamp', t => {
  const compose = require('../compose');
  const isStamp = require('../isStamp');
  t.equal(typeof isStamp, 'function', 'Must be a function');

  const stamp = compose();
  t.equal(isStamp(stamp), true, 'Must recognize stamps');
  t.equal(isStamp(stamp.compose), false, 'Must return false for non stamps');

  t.end();
});

test('can import the stampit/isComposable', t => {
  const compose = require('../compose');
  const isComposable = require('../isComposable');
  t.equal(typeof isComposable, 'function', 'Must be a function');

  const stamp = compose();
  t.equal(isComposable(stamp), true, 'Must recognize stamps');
  t.equal(isComposable(stamp.compose), true, 'Must recognize stamp descriptor');
  t.equal(isComposable('a string'), false, 'Must return false for rubbish');

  t.end();
});
