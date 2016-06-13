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
  t.same(stampit({methods: 42}).compose.methods, undefined);
  t.same(stampit({methods: null}).compose.methods, undefined);
  t.same(stampit({methods: 'a string'}).compose.methods, undefined);

  t.end();
});

test('incorrect stampit({ refs }) args', (t) => {
  t.same(stampit({refs: 42}).compose.properties, undefined);
  t.same(stampit({refs: null}).compose.properties, undefined);

  t.end();
});

test('incorrect stampit({ init }) args', (t) => {
  t.same(stampit({init: 42}).compose.initializers, undefined);
  t.same(stampit({init: null}).compose.initializers, undefined);
  t.same(stampit({init: [undefined]}).compose.initializers, undefined);
  t.same(stampit({init: new RegExp()}).compose.initializers, undefined);
  t.same(stampit({init: [42]}).compose.initializers, undefined);
  t.same(stampit({init: 'a string'}).compose.initializers, undefined);

  t.end();
});

test('incorrect stampit({ deepProps }) args', (t) => {
  t.same(stampit({deepProps: 42}).compose.deepProperties, undefined);
  t.same(stampit({deepProps: null}).compose.deepProperties, undefined);

  t.end();
});

test('multiple arguments stampit(arg1, arg2, ...)', (t) => {
  t.equal(stampit(null, {init: () => {}}).compose.initializers.length, 1,
    'must recognize init from second argument');
  t.equal(stampit(null, {props: {x: 2}}).compose.properties.x, 2,
    'must recognize props from second argument');
  t.equal(stampit(null, {refs: {x: 2}}).compose.properties.x, 2,
    'must recognize refs from second argument');
  t.equal(stampit(null, {deepProps: {x: 2}}).compose.deepProperties.x, 2,
    'must recognize deepProps from second argument');
  t.equal(stampit(null, {statics: {x: 2}}).compose.staticProperties.x, 2,
    'must recognize statics properties from second argument');
  t.equal(stampit(null, {conf: {x: 2}}).compose.configuration.x, 2,
    'must recognize conf properties from second argument');
  t.equal(stampit(null, {deepConf: {x: 2}}).compose.deepConfiguration.x, 2,
    'must recognize deepConf properties from second argument');

  t.end();
});
