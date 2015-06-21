import stampit from '../src/stampit';
import test from 'tape';

// Immutability

test('Basic stamp immutability', (t) => {
  const methods = { f() {} };
  const refs = { s: { deep: 1 } };
  const props = { p: { deep: 1 } };
  const stamp1 = stampit({ methods: methods, refs: refs, props: props });

  methods.f = () => {};
  refs.s.deep = 2;
  props.p.deep = 2;
  const stamp2 = stampit({ methods: methods, refs: refs, props: props });

  t.notEqual(stamp1.fixed.methods, stamp2.fixed.methods);
  t.notEqual(stamp1.fixed.methods.f, stamp2.fixed.methods.f);
  t.notEqual(stamp1.fixed.refs, stamp2.fixed.refs);
  t.equal(stamp1.fixed.refs.s, stamp2.fixed.refs.s);
  t.equal(stamp1.fixed.refs.s.deep, stamp2.fixed.refs.s.deep);
  t.notEqual(stamp1.fixed.props, stamp2.fixed.refs);
  t.notEqual(stamp1.fixed.props.p, stamp2.fixed.props.p);
  t.notEqual(stamp1.fixed.props.p.deep, stamp2.fixed.props.p.deep);
  t.notEqual(stamp1.fixed.init, stamp2.fixed.init);

  t.end();
});

test('Stamp immutability made of same source', (t) => {
  const methods = { f() {} };
  const refs = { s: { deep: 1 } };
  const props = { p: { deep: 1 } };
  const stamp1 = stampit({ methods: methods, refs: refs, props: props });
  const stamp2 = stampit({ methods: methods, refs: refs, props: props });

  t.notEqual(stamp1.fixed.methods, stamp2.fixed.methods);
  t.notEqual(stamp1.fixed.refs, stamp2.fixed.refs);
  t.equal(stamp1.fixed.refs.s, stamp2.fixed.refs.s);
  t.notEqual(stamp1.fixed.props, stamp2.fixed.props);
  t.notEqual(stamp1.fixed.props.p, stamp2.fixed.props.p);
  t.notEqual(stamp1.fixed.init, stamp2.fixed.init);

  t.end();
});

test('Basic object immutability', (t) => {
  const methods = { f() {} };
  const refs = { s: { deep: 1 } };
  const props = { p: { deep: 1 } };
  const o1 = stampit({ methods: methods, refs: refs, props: props })();

  methods.f = () => {};
  refs.s.deep = 2;
  props.p.deep = 2;
  const o2 = stampit({ methods: methods, refs: refs, props: props })();

  t.notEqual(o1, o2);
  t.notEqual(o1.f, o2.f);
  t.equal(o1.s, o2.s);
  t.equal(o1.s.deep, o2.s.deep);
  t.notEqual(o1.p, o2.p);
  t.notEqual(o1.p.deep, o2.p.deep);

  t.end();
});

test('Stamp chaining functions immutability', (t) => {
  const stamp1 = stampit();
  const stamp2 = stamp1.methods({ f() {} });
  const stamp3 = stamp2.refs( { s: { deep: 1 } });
  const stamp4 = stamp3.init(() => {});
  const stamp5 = stamp2.props( { p: { deep: 1 } });
  const stamp6 = stamp4.compose(stampit());

  t.notEqual(stamp1, stamp2);
  t.notEqual(stamp2, stamp3);
  t.notEqual(stamp3, stamp4);
  t.notEqual(stamp4, stamp5);
  t.notEqual(stamp5, stamp6);

  t.end();
});
