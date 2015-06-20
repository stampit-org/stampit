'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Basics Props

test('stampit({ props })', function (t) {
  var obj = stampit({ props: { foo: { bar: 'bar' } } }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');

  t.end();
});

test('stampit().props()', function (t) {
  var obj = stampit().props({
    foo: { bar: 'bar' },
    propsOverride: false,
    func1: function(){}
  }).props({
    bar: 'bar',
    propsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.ok(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit({ props }).props()', function (t) {
  var obj = stampit({ props: {
    foo: { bar: 'bar' },
    propsOverride: false,
    func1: function(){}
  }}).props({
    bar: 'bar',
    propsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default props.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .props().');
  t.ok(obj.propsOverride,
    'Should set let you override by chaining .props().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit().props(a, b)', function (t) {
  var obj = stampit().props({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.ok(obj.a && obj.b,
    'Should mixIn objects when multiple objects are passed.');

  t.end();
});
