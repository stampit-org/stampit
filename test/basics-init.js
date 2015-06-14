'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Basics Enclose

test('stampit({ init })', function (t) {
  var obj = stampit({ init: function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }}).create();

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

test('stampit({ init }).init()', function (t) {
  var obj = stampit({ init: function () {
    var secret = 'foo';
    this.getSecret = function () { return secret; };
  }}).init(function () {
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
