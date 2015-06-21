import stampit from '../src/stampit';
import test from 'tape';

// stampit.methods, stampit.refs, stampit.init, stampit.props

test('stampit.methods shortcut', (t) => {
  const methods = { method1() {} };
  const stamp1 = stampit({ methods: methods });
  const stamp2 = stampit.methods(methods);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.refs shortcut', (t) => {
  const refs = { method1() {} };
  const stamp1 = stampit({ refs: refs });
  const stamp2 = stampit.refs(refs);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.init shortcut', (t) => {
  const init = { method1() {} };
  const stamp1 = stampit({ init: init });
  const stamp2 = stampit.init(init);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.props shortcut', (t) => {
  const props = { method1() {} };
  const stamp1 = stampit({ props: props });
  const stamp2 = stampit.props(props);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.static shortcut', (t) => {
  const statics = { method1() {} };
  const stamp1 = stampit({ static: statics });
  const stamp2 = stampit.static(statics);

  t.deepEqual(stamp1.fixed, stamp2.fixed);

  t.end();
});

test('stampit.static(arg1, arg2) shortcut', (t) => {
  const stamp1 = stampit.static({ foo: 1 }, { bar: '2' });

  t.ok(stamp1.foo);
  t.ok(stamp1.bar);

  t.end();
});
