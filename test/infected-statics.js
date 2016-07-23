import stampit from '../src/stampit';
import test from 'tape';
import _ from 'lodash';

// stampit().methods, stampit.refs, stampit.init, stampit.props, etc

test('stampit().methods static method', (t) => {
  const methods = {method1() {}};
  const stamp1 = stampit({methods: methods});
  const stamp2 = stampit().methods(methods);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit().refs static method', (t) => {
  const refs = {method1() {}};
  const stamp1 = stampit({refs: refs});
  const stamp2 = stampit().refs(refs);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit().init static method', (t) => {
  const init = {method1() {}};
  const stamp1 = stampit({init: init});
  const stamp2 = stampit().init(init);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit().props static method', (t) => {
  const props = {method1() {}};
  const stamp1 = stampit({props: props});
  const stamp2 = stampit().props(props);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit().statics static method', (t) => {
  const statics = {method1() {}};
  const stamp1 = stampit({statics: statics});
  const stamp2 = stampit().statics(statics);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit().propertyDescriptors static method', (t) => {
  const propertyDescriptors = {x: {writable: true}};
  const stamp1 = stampit({propertyDescriptors: propertyDescriptors});
  const stamp2 = stampit().propertyDescriptors(propertyDescriptors);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});

test('stampit().staticPropertyDescriptors static method', (t) => {
  const staticPropertyDescriptors = {x: {writable: true}};
  const stamp1 = stampit({staticPropertyDescriptors: staticPropertyDescriptors});
  const stamp2 = stampit().staticPropertyDescriptors(staticPropertyDescriptors);

  t.deepEqual(_.toPlainObject(stamp1.compose), _.toPlainObject(stamp2.compose));

  t.end();
});