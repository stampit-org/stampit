import test from 'tape';
import stampit from '../src/stampit';

// Immutability

test('Basic stamp immutability', (t) => {
  const methods = {f() {}};
  const props = {s: {deep: 1}};
  const deepProps = {p: {deep: 1}};
  const init = () => {};
  const stamp1 = stampit({methods, props, deepProps, init});

  methods.f = () => {};
  props.s.deep = 2;
  deepProps.p.deep = 2;
  const stamp2 = stampit({methods, props, deepProps, init});

  t.notEqual(stamp1.compose.methods, stamp2.compose.methods);
  t.notEqual(stamp1.compose.methods.f, stamp2.compose.methods.f);
  t.notEqual(stamp1.compose.properties, stamp2.compose.properties);
  t.equal(stamp1.compose.properties.s, stamp2.compose.properties.s);
  t.equal(stamp1.compose.properties.s.deep, stamp2.compose.properties.s.deep);
  t.notEqual(stamp1.compose.deepProperties, stamp2.compose.properties);
  t.notEqual(stamp1.compose.deepProperties.p, stamp2.compose.deepProperties.p);
  t.notEqual(stamp1.compose.deepProperties.p.deep, stamp2.compose.deepProperties.p.deep);
  t.notEqual(stamp1.compose.initializers, stamp2.compose.initializers);

  t.end();
});

test('Stamp immutability made of same source', (t) => {
  const methods = {f() {}};
  const props = {s: {deep: 1}};
  const deepProps = {p: {deep: 1}};
  const init = () => {};
  const stamp1 = stampit({methods, props, deepProps, init});
  const stamp2 = stampit({methods, props, deepProps, init});

  t.notEqual(stamp1.compose.methods, stamp2.compose.methods);
  t.notEqual(stamp1.compose.properties, stamp2.compose.properties);
  t.equal(stamp1.compose.properties.s, stamp2.compose.properties.s);
  t.notEqual(stamp1.compose.deepProperties, stamp2.compose.deepProperties);
  t.notEqual(stamp1.compose.deepProperties.p, stamp2.compose.deepProperties.p);
  t.notEqual(stamp1.compose.initializers, stamp2.compose.initializers);

  t.end();
});

test('Basic object immutability', (t) => {
  const methods = {f() {}};
  const props = {s: {deep: 1}};
  const deepProps = {p: {deep: 1}};
  const o1 = stampit({methods, props, deepProps})();

  methods.f = () => {};
  props.s.deep = 2;
  deepProps.p.deep = 2;
  const o2 = stampit({methods, props, deepProps})();

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
  const stamp2 = stamp1.methods({f() {}});
  const stamp3 = stamp2.properties({s: {deep: 1}});
  const stamp4 = stamp3.init(() => {});
  const stamp5 = stamp2.deepProperties({p: {deep: 1}});
  const stamp6 = stamp4.compose(stampit());

  t.notEqual(stamp1, stamp2);
  t.notEqual(stamp2, stamp3);
  t.notEqual(stamp3, stamp4);
  t.notEqual(stamp4, stamp5);
  t.notEqual(stamp5, stamp6);

  t.end();
});
