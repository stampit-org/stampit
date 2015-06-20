'use strict';
var stampit = require('../src/stampit'),
  test = require('tape');

// Basics

test('.create()', function (t) {
  var stamp = stampit({ methods: {
    foo: function () { return 'foo'; }
  }});

  t.equal(stamp.create().foo(), 'foo',
    'Should produce an object from specified prototypes.');

  t.end();
});

test('.create(properties)', function (t) {
  var obj = stampit({ refs: { foo: 'bar' } });
  obj = obj.create({ foo: 'foo' });

  t.equal(obj.foo, 'foo',
    'should override defaults.');

  t.end();
});
