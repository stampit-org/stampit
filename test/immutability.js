import stampit from '../src/stampit';
import { test } from 'ava';
// Immutability

test('Basic stamp immutability', (t) => {
  const methods = { f() {} };
  const refs = { s: { deep: 1 } };
  const props = { p: { deep: 1 } };
  const init = () => {};
  const stamp1 = stampit({ methods: methods, refs: refs, deepProps: props, init });

  methods.f = () => {};
  refs.s.deep = 2;
  props.p.deep = 2;
  const stamp2 = stampit({ methods: methods, refs: refs, deepProps: props, init });

  t.not(stamp1.compose.methods, stamp2.compose.methods);
  t.not(stamp1.compose.methods.f, stamp2.compose.methods.f);
  t.not(stamp1.compose.properties, stamp2.compose.properties);
  t.is(stamp1.compose.properties.s, stamp2.compose.properties.s);
  t.is(stamp1.compose.properties.s.deep, stamp2.compose.properties.s.deep);
  t.not(stamp1.compose.deepProperties, stamp2.compose.properties);
  t.not(stamp1.compose.deepProperties.p, stamp2.compose.deepProperties.p);
  t.not(stamp1.compose.deepProperties.p.deep, stamp2.compose.deepProperties.p.deep);
  t.not(stamp1.compose.initializers, stamp2.compose.initializers);
});

test('Stamp immutability made of same source', (t) => {
  const methods = { f() {} };
  const refs = { s: { deep: 1 } };
  const props = { p: { deep: 1 } };
  const init = () => {};
  const stamp1 = stampit({ methods: methods, refs: refs, deepProps: props, init });
  const stamp2 = stampit({ methods: methods, refs: refs, deepProps: props, init });

  t.not(stamp1.compose.methods, stamp2.compose.methods);
  t.not(stamp1.compose.properties, stamp2.compose.properties);
  t.is(stamp1.compose.properties.s, stamp2.compose.properties.s);
  t.not(stamp1.compose.deepProperties, stamp2.compose.deepProperties);
  t.not(stamp1.compose.deepProperties.p, stamp2.compose.deepProperties.p);
  t.not(stamp1.compose.initializers, stamp2.compose.initializers);
});

test('Basic object immutability', (t) => {
  const methods = { f() {} };
  const refs = { s: { deep: 1 } };
  const props = { p: { deep: 1 } };
  const o1 = stampit({ methods: methods, refs: refs, deepProps: props })();

  methods.f = () => {};
  refs.s.deep = 2;
  props.p.deep = 2;
  const o2 = stampit({ methods: methods, refs: refs, deepProps: props })();

  t.not(o1, o2);
  t.not(o1.f, o2.f);
  t.is(o1.s, o2.s);
  t.is(o1.s.deep, o2.s.deep);
  t.not(o1.p, o2.p);
  t.not(o1.p.deep, o2.p.deep);
});

test('Stamp chaining functions immutability', (t) => {
  const stamp1 = stampit();
  const stamp2 = stamp1.methods({ f() {} });
  const stamp3 = stamp2.properties( { s: { deep: 1 } });
  const stamp4 = stamp3.init(() => {});
  const stamp5 = stamp2.deepProperties( { p: { deep: 1 } });
  const stamp6 = stamp4.compose(stampit());

  t.not(stamp1, stamp2);
  t.not(stamp2, stamp3);
  t.not(stamp3, stamp4);
  t.not(stamp4, stamp5);
  t.not(stamp5, stamp6);
});
