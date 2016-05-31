import stampit from '../src/stampit';
import { test } from 'ava';
// Main API

test('stampit()', (t) => {
  t.is(typeof stampit(), 'function', 'Should produce a function.');
});

test('stampit({})', (t) => {
  t.truthy(stampit.isStamp(stampit({})));
});

test('incorrect stampit({ methods }) args', (t) => {
  t.deepEqual(stampit({ methods: 42 }).compose.methods, undefined);
  t.deepEqual(stampit({ methods: null }).compose.methods, undefined);
  t.deepEqual(stampit({ methods: 'a string' }).compose.methods, undefined);
});

test('incorrect stampit({ refs }) args', (t) => {
  t.deepEqual(stampit({ refs: 42 }).compose.properties, undefined);
  t.deepEqual(stampit({ refs: null }).compose.properties, undefined);
});

test('incorrect stampit({ init }) args', (t) => {
  t.deepEqual(stampit({ init: 42 }).compose.initializers, undefined);
  t.deepEqual(stampit({ init: null }).compose.initializers, undefined);
  t.deepEqual(stampit({ init: [undefined] }).compose.initializers, undefined);
  t.deepEqual(stampit({ init: new RegExp() }).compose.initializers, undefined);
  t.deepEqual(stampit({ init: [42] }).compose.initializers, undefined);
  t.deepEqual(stampit({ init: 'a string' }).compose.initializers, undefined);
});

test('incorrect stampit({ deepProps }) args', (t) => {
  t.deepEqual(stampit({ deepProps: 42 }).compose.deepProperties, undefined);
  t.deepEqual(stampit({ deepProps: null }).compose.deepProperties, undefined);
});

test('multiple arguments stampit(arg1, arg2, ...)', (t) => {
  t.is(stampit(null, { init: () => {} }).compose.initializers.length, 1,
    'must recognize init from second argument');
  t.is(stampit(null, { props: { x: 2 }}).compose.properties.x, 2,
    'must recognize props from second argument');
  t.is(stampit(null, { refs: { x: 2 }}).compose.properties.x, 2,
    'must recognize refs from second argument');
  t.is(stampit(null, { deepProps: { x: 2 }}).compose.deepProperties.x, 2,
    'must recognize deepProps from second argument');
  t.is(stampit(null, { statics: { x: 2 }}).compose.staticProperties.x, 2,
    'must recognize statics properties from second argument');
  t.is(stampit(null, { conf: { x: 2 }}).compose.configuration.x, 2,
    'must recognize conf properties from second argument');
  t.is(stampit(null, { deepConf: { x: 2 }}).compose.deepConfiguration.x, 2,
    'must recognize deepConf properties from second argument');
});
