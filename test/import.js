/* eslint-disable */
import test from 'tape';

import stampit1 from '../';

test('import is the same as require', (t) => {
  const stampit2 = require('../');

  t.equal(stampit1, stampit2,
    'Should export same object for both ES6 and CommonJS');

  t.end();
});

test('infection works using the require("src/stampit")', t => {
  const obj = require('../src/stampit')
    .init(function () {
      const secret = 'foo';
      this.getSecret = () => { return secret; };
    })
    .methods({
      foo() { return 'foo'; }
    })
    .create();

  t.equal(obj.getSecret(), 'foo', 'Should create infected stamps with shortcuts');
  t.ok(obj.foo() === 'foo',
    'Should create infected stamps from infected stamps with shortcuts');

  t.end();
});
