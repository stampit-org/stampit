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

test('incorrect stampit({ methods }) args', (t) => {
  t.same(stampit({ methods: 42 }).fixed.methods, {});
  t.same(stampit({ methods: null }).fixed.methods, {});
  t.same(stampit({ methods: new RegExp() }).fixed.methods, {});
  t.same(stampit({ methods: [42] }).fixed.methods, {});
  t.same(stampit({ methods: 'a string' }).fixed.methods, {});

  t.end();
});

test('incorrect stampit({ refs }) args', (t) => {
  t.same(stampit({ refs: 42 }).fixed.refs, {});
  t.same(stampit({ refs: null }).fixed.refs, {});
  t.same(stampit({ refs: new RegExp() }).fixed.refs, {});
  t.same(stampit({ refs: [42] }).fixed.refs, { 0: 42 });

  t.end();
});

test('incorrect stampit({ init }) args', (t) => {
  t.same(stampit({ init: 42 }).fixed.init, []);
  t.same(stampit({ init: null }).fixed.init, []);
  t.same(stampit({ init: new RegExp() }).fixed.init, []);
  t.same(stampit({ init: [42] }).fixed.init, []);
  t.same(stampit({ init: 'a string' }).fixed.init, []);

  t.end();
});

test('incorrect stampit({ props }) args', (t) => {
  t.same(stampit({ props: 42 }).fixed.props, {});
  t.same(stampit({ props: null }).fixed.props, {});
  t.same(stampit({ props: new RegExp() }).fixed.props, {});
  t.same(stampit({ props: [42] }).fixed.props, { 0: 42 });

  t.end();
});
