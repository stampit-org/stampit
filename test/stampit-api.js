'use strict';
var stampit = require('../stampit'),
  test = require('tape');

// Main API

test('stampit()', function (t) {
  t.equal(typeof stampit(), 'function', 'Should produce a function.');

  t.end();
});

test('stampit({})', function (t) {
  t.ok(stampit.isStamp(stampit({})));

  t.end();
});

test('incorrect stampit({ methods }) args', function (t) {
  t.ok(stampit.isStamp(stampit({ methods: 42 })));
  t.ok(stampit.isStamp(stampit({ methods: null })));
  t.ok(stampit.isStamp(stampit({ methods: new RegExp() })));
  t.ok(stampit.isStamp(stampit({ methods: [42] })));
  t.ok(stampit.isStamp(stampit({ methods: "a string" })));

  t.end();
});

test('incorrect stampit({ refs }) args', function (t) {
  t.ok(stampit.isStamp(stampit({ refs: 42 })));
  t.ok(stampit.isStamp(stampit({ refs: null })));
  t.ok(stampit.isStamp(stampit({ refs: new RegExp() })));
  t.ok(stampit.isStamp(stampit({ refs: [42] })));
  t.ok(stampit.isStamp(stampit({ refs: "a string" })));

  t.end();
});

test('incorrect stampit({ init }) args', function (t) {
  t.ok(stampit.isStamp(stampit({ init: 42 })));
  t.ok(stampit.isStamp(stampit({ init: null })));
  t.ok(stampit.isStamp(stampit({ init: new RegExp() })));
  t.ok(stampit.isStamp(stampit({ init: [42] })));
  t.ok(stampit.isStamp(stampit({ init: "a string" })));

  t.end();
});

test('incorrect stampit({ props }) args', function (t) {
  t.ok(stampit.isStamp(stampit({ props: 42 })));
  t.ok(stampit.isStamp(stampit({ props: null })));
  t.ok(stampit.isStamp(stampit({ props: new RegExp() })));
  t.ok(stampit.isStamp(stampit({ props: [42] })));
  t.ok(stampit.isStamp(stampit({ props: "a string" })));

  t.end();
});
