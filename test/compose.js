'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Compose

test('stampit().compose()', function (t) {
  var closuresCalled = 0,
    a = stampit({
        method: function () { return false; }
      },
      { ref: false },
      function () {
        closuresCalled++;
      },
      { prop: false }
    ),
    b = stampit({
        method: function () { return true; }
      },
      { ref: true },
      function () {
        closuresCalled++;
      },
      { prop: true }),
    d;

  d = a.compose(b).create();

  t.ok(d.method() && d.ref && d.prop, 'Last stamp must win.');
  t.equal(closuresCalled, 2, 'Each stamp closure must be called.');

  t.end();
});

test('stampit.compose()', function (t) {
  var a = stampit({
        methodA: function () { return true; }
      },
      { refA: true },
      function () {
        var secret = 'a';
        this.getA = function () { return secret; };
      },
      { propA: "1" }),
    b = stampit({
        methodB: function () { return true; }
      },
      { refB: true },
      function () {
        var secret = true;
        this.getB = function () { return secret; };
      },
      { propB: "1" }),
    c = stampit({
        methodC: function () { return true; }
      },
      { refC: true },
      function () {
        var secret = true;
        this.getC = function () { return secret; };
      },
      { propC: "1" }), d;

  d = stampit.compose(a, b, c).create();

  t.ok(d.methodA && d.refA && d.getA && d.propA &&
    d.methodB && d.refB && d.getB && d.propB &&
    d.methodC && d.refC && d.getC && d.propC,
    'Should compose all factory prototypes');

  t.end();
});
