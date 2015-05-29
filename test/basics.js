'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Basics

test('stampit()', function (t) {
  t.equal(typeof stampit(), 'function',
    'Should produce a function.');

  t.end();
});

test('.create()', function (t) {
  var stamp = stampit({
    foo: function () { return 'foo'; }
  });

  t.equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');

  t.end();
});

test('.create(properties)', function (t) {
  var obj = stampit({}, { foo: 'bar' });
  obj = obj.create({ foo: 'foo' });

  t.equal(obj.foo, 'foo',
    'should override defaults.');

  t.end();
});

// Basics Methods

test('stampit(methods)', function (t) {
  var obj = stampit({
    foo: function () { return 'foo'; }
  }).create();

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
  t.ok(!obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');
  t.ok(!obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');

  t.end();
});

test('stampit(methods).methods()', function (t) {
  var obj = stampit({
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
  t.ok(!obj.prop1 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');
  t.ok(!obj.prop2 && !obj.hasOwnProperty('prop1'),
    'Should not mix properties.');

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

// Basics Props

test('stampit({}, {}, {}, props)', function (t) {
  var obj = stampit({}, {}, {}, { foo: { bar: 'bar' } }).create();

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

test('stampit({}, {}, {}, props).props()', function (t) {
  var obj = stampit(null, null, null, {
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

// Basics refs

test('stampit({}, refs)', function (t) {
  var obj = stampit({}, { foo: { bar: 'bar' } }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');

  t.end();
});

test('stampit().refs()', function (t) {
  var obj = stampit().refs({
    foo: { bar: 'bar' },
    refsOverride: false,
    func1: function(){}
  }).refs({
    bar: 'bar',
    refsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.ok(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit({}, refs).refs()', function (t) {
  var obj = stampit(null, {
    foo: { bar: 'bar' },
    refsOverride: false,
    func1: function(){}
  }).refs({
    bar: 'bar',
    refsOverride: true,
    func2: function(){}
  }).create();

  t.equal(obj.foo.bar, 'bar',
    'Should set default refs.');
  t.equal(obj.bar, 'bar',
    'Should set let you add by chaining .refs().');
  t.ok(obj.refsOverride,
    'Should set let you override by chaining .refs().');
  t.ok(obj.func1,
    'Should mix functions.');
  t.ok(obj.func2,
    'Should mix functions.');

  t.end();
});

test('stampit().refs(a, b)', function (t) {
  var obj = stampit().refs({
    a: 'a'
  }, {
    b: 'b'
  }).create();

  t.ok(obj.a && obj.b,
    'Should mixIn objects when multiple properties are passed.');

  t.end();
});

// Basics Enclose

test('stampit({}, {}, init)', function (t) {
  var obj = stampit({}, {}, function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');

  t.end();
});

test('stampit().init()', function (t) {
  var obj = stampit().init(function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).init(function () {
    this.a = 'a';
  }).init({
    bar: function bar() { this.b = 'b'; }
  }, {
    baz: function baz() { this.c = 'c'; }
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');

  t.end();
});

test('stampit({}, {}, init).init()', function (t) {
  var obj = stampit(null, null, function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }).init(function () {
    this.a = 'a';
  }).init({
    bar: function bar() { this.b = 'b'; }
  }, {
    baz: function baz() { this.c = 'c'; }
  }).create();

  t.equal(obj.getSecret(), 'foo',
    'Should set closure.');
  t.ok(obj.a && obj.b && obj.c,
    'Should allow chaining and take object literals.');

  t.end();
});
