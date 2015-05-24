'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Closure arguments

test('stamp.create({}, args)', function (t) {
  var obj = stampit().enclose(function (a, b) {
    this.getA = function () { return a; };
    this.getB = function () { return b; };
  }).create(null, null, 0);

  t.equal(obj.getA(), null,
    'Should pass variables to closures.');
  t.equal(obj.getB(), 0,
    'Should pass variables to closures.');

  t.end();
});

test('stamp.create({}, undefined, arg2)', function (t) {
  var obj = stampit().enclose(function (absent, present) {
    this.getAbsent = function () { return absent; };
    this.getPresent = function () { return present; };
  }).create(null, undefined, 'I exist');

  t.equal(obj.getAbsent(), undefined,
    'Should pass undefined variables to closures.');
  t.equal(obj.getPresent(), 'I exist',
    'Should pass variables to closures event after an undefined one.');

  t.end();
});
