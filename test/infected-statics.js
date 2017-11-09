import test from 'tape';
import _ from 'lodash';
import stampit from '../src/stampit';

test('stampit().methods static method', (t) => {
  const methods = {method1() {}};
  const stamp1 = stampit({methods: methods});
  const stamp2 = stampit().methods(methods);

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

test('stampit() can be infected', (t) => {
  let counter = 0;
  const infectedStampit = function (...args) {
    counter += 1;
    args.push({
      staticProperties: {
        compose: infectedStampit
      }
    });

    return stampit.apply(this, args);
  };

  const stamp = infectedStampit({props: {a: 1}}) // 1
    .compose({deepProps: {b: 2}}) // 2
    .methods({c: 3}) // 3
    .compose( // 4
      infectedStampit({conf: {d: 4}}) // 5
    );

  t.equal(counter, 5, 'should call infected compose 5 times');
  t.equal(stamp.compose.properties.a, 1, 'should compose properties');
  t.equal(stamp.compose.deepProperties.b, 2, 'should compose deepProperties');
  t.equal(stamp.compose.methods.c, 3, 'should compose methods');
  t.equal(stamp.compose.configuration.d, 4, 'should compose configuration');

  t.end();
});
