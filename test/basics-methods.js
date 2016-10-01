import test from 'tape';
import stampit from '../src/stampit';

// Basics Methods

test('stampit({ methods })', (t) => {
  const obj = stampit({
    methods: {
      foo() { return 'foo'; }
    }
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');

  t.end();
});

test('stampit().methods()', (t) => {
  const obj = stampit().methods({
    foo() { return 'foo'; },
    methodOverride() { return false; },
    prop1: 1
  }).methods({
    bar() { return 'bar'; },
    methodOverride() { return true; },
    prop2: 2
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  t.ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  t.ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  t.ok(obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should mix properties.');
  t.ok(obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should mix properties.');

  t.end();
});

test('stampit({ methods }).methods()', (t) => {
  const obj = stampit({
    methods: {
      foo() { return 'foo'; },
      methodOverride() { return false; },
      prop1: 1
    }
  }).methods({
    bar() { return 'bar'; },
    methodOverride() { return true; },
    prop2: 2
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  t.ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  t.ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  t.ok(obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should mix properties.');
  t.ok(obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should mix properties.');

  t.end();
});

test('stampit().methods(a, b)', (t) => {
  const obj = stampit().methods({
    a() { return 'a'; }
  }, {
    b() { return 'b'; }
  }).create();

  t.ok(obj.a() === 'a' && obj.b() === 'b',
    'Should mixIn objects when multiple methods are passed.');

  t.end();
});
