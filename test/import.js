import test from 'tape';

import stampit1 from '../dist/stampit';

test('import is the same as require', (t) => {
  const stampit2 = require('../dist/stampit');

  t.equal(stampit1, stampit2,
    'Should export same object for both ES and CommonJS');

  t.end();
});
