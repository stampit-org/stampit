import stampit from '../src/stampit';
import test from 'tape';

// Main API

test('stampit()', (t) => {
  t.equal(typeof stampit(), 'function', 'Should produce a function.');

  t.end();
});

test('stampit({})', (t) => {
  t.ok(stampit.isStamp(stampit({})));

  t.end();
});

test.skip('incorrect stampit({ methods }) args', (t) => {
  t.same(stampit({ methods: 42 }).compose.methods, undefined);
  t.same(stampit({ methods: null }).compose.methods, undefined);
  t.same(stampit({ methods: 'a string' }).compose.methods, undefined);

  t.end();
});

test.skip('incorrect stampit({ refs }) args', (t) => {
  t.same(stampit({ refs: 42 }).compose.properties, undefined);
  t.same(stampit({ refs: null }).compose.properties, undefined);

  t.end();
});

test('incorrect stampit({ init }) args', (t) => {
  t.same(stampit({ init: 42 }).compose.initializers, undefined);
  t.same(stampit({ init: null }).compose.initializers, undefined);
  t.same(stampit({ init: new RegExp() }).compose.initializers, undefined);
  t.same(stampit({ init: [42] }).compose.initializers, undefined);
  t.same(stampit({ init: 'a string' }).compose.initializers, undefined);

  t.end();
});

test.skip('incorrect stampit({ props }) args', (t) => {
  t.same(stampit({ deepProps: 42 }).compose.deepProperties, undefined);
  t.same(stampit({ deepProps: null }).compose.deepProperties, undefined);

  t.end();
});
