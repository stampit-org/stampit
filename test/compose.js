'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Compose

test('stampit().compose()', function (t) {
  var closuresCalled = 0,
    a = stampit({
      methods: {
        method: function () { return false; }
      },
      refs: { ref: false },
      init: function () {
        closuresCalled++;
      },
      props: { prop: false }
    }),
    b = stampit({
      methods: {
        method: function () { return true; }
      },
      refs: { ref: true },
      init: function () {
        closuresCalled++;
      },
      props: { prop: true }
    }),
    d;

  d = a.compose(b).create();

  t.ok(d.method() && d.ref && d.prop, 'Last stamp must win.');
  t.equal(closuresCalled, 2, 'Each stamp closure must be called.');

  t.end();
});

test('stampit.compose()', function (t) {
  var a = stampit({
      methods: {
        methodA: function () {
          return true;
        }
      },
      refs: {refA: true},
      init: function () {
        var secret = 'a';
        this.getA = function () {
          return secret;
        };
      },
      props: {propA: "1"}
    }),
    b = stampit({ methods: {
        methodB: function () { return true; }
      },
      refs: { refB: true },
      init: function () {
        var secret = true;
        this.getB = function () { return secret; };
      },
      props: { propB: "1" }
    }),
    c = stampit({ methods: {
        methodC: function () { return true; }
      },
      refs: { refC: true },
      init: function () {
        var secret = true;
        this.getC = function () { return secret; };
      },
      props: { propC: "1" }
    }), d;

  d = stampit.compose(a, b, c).create();

  t.ok(d.methodA && d.refA && d.getA && d.propA &&
    d.methodB && d.refB && d.getB && d.propB &&
    d.methodC && d.refC && d.getC && d.propC,
    'Should compose all factory prototypes');

  t.end();
});
