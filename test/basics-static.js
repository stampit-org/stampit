'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Basics static

test('stampit().static()', function (t) {
  var stamp1 = stampit()
    .static({
      foo: function () {
        return 42;
      },
      bar: 'space'
    });

  t.ok(stamp1.foo, 'Should add static props to factory.');
  t.equal(stamp1.foo(), 42, 'Should set proper reference.');
  t.equal(stamp1.bar, 'space', 'Should set proper reference.');

  t.end();
});

test('stampit({static})', function (t) {
  var stamp1 = stampit({
    static: {
      foo: 42
    }
  });

  t.equal(stamp1.foo, 42, 'Should accept static in options.');

  t.end();
});

test('stampit().static() last override', function (t) {
  var stamp1 = stampit()
    .static({
      foo: function () {
        return 'override';
      }
    });

  var stamp2 = stampit()
    .static({
      foo: function () {}
    }).compose(stamp1);

  t.equal(stamp2.foo(), 'override', 'Should override props during composition.');

  t.end();
});

test('stampit().static(arg1, arg2)', function (t) {
  var stamp1 = stampit().static(
    {
      foo1: function () {}
    },
    {
      foo2: function () {}
    }
  );

  t.ok(stamp1.foo1, 'Should accept multiple args.');
  t.ok(stamp1.foo2, 'Should accept multiple args.');

  t.end();
});

test('stampit.static(arg1, arg2)', function (t) {
  var stamp1 = stampit.static(
    {
      foo1: function () {}
    },
    {
      foo2: function () {}
    }
  );

  t.ok(stamp1.foo1, 'Should accept multiple args.');
  t.ok(stamp1.foo2, 'Should accept multiple args.');

  t.end();
});

test('stampit({static}).static()', function (t) {
  var stamp1 = stampit({
    static: {
      foo1: 'foo1 value'
    }
  })
    .static({
      foo2: function () {
        return 'foo2 value';
      }
    });

  t.equal(stamp1.foo1, 'foo1 value', 'Should have static from options.');
  t.equal(stamp1.foo2(), 'foo2 value', 'Should have static form chain method.');

  t.end();
});
