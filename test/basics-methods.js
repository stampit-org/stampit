'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Basics Methods

test('stampit({ methods })', function (t) {
  var obj = stampit({ methods: {
    foo: function () { return 'foo'; }
  }}).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');

  t.end();
});

test('stampit().methods()', function (t) {
  var obj = stampit().methods({
    foo: function () { return 'foo'; },
    methodOverride: function () { return false; },
    prop1: 1
  }).methods({
    bar: function () { return 'bar'; },
    methodOverride: function () { return true; },
    prop2: 2
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  t.ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  t.ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  t.ok(obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should mix properties too.');
  t.ok(obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should mix properties too.');

  t.end();
});

test('stampit({ methods }).methods()', function (t) {
  var obj = stampit({ methods: {
    foo: function () { return 'foo'; },
    methodOverride: function () { return false; },
    prop1: 1
  }}).methods({
    bar: function () { return 'bar'; },
    methodOverride: function () { return true; },
    prop2: 2
  }).create();

  t.ok(obj.foo() && !obj.hasOwnProperty('foo'),
    'Should set the new object\'s prototype.');
  t.ok(obj.bar() && !obj.hasOwnProperty('bar'),
    'Should let you chain .methods() to add more.');
  t.ok(obj.methodOverride() && !obj.hasOwnProperty('methodOverride'),
    'Should let you override by chaining .methods().');
  t.ok(obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should mix properties too.');
  t.ok(obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should mix properties too.');

  t.end();
});

test('stampit().methods(a, b)', function (t) {
  var obj = stampit().methods({
    a: function () { return 'a'; }
  }, {
    b: function () { return 'b'; }
  }).create();

  t.ok(obj.a() === 'a' && obj.b() === 'b',
    'Should mixIn objects when multiple methods are passed.');

  t.end();
});
