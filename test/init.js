'use strict';
var stampit = require('../stampit'),
  test = require('tape'),
  isArray = require('lodash/lang/isArray');

// Closure arguments

test('stamp.init() arguments are passed', function (t) {
  var stamp = stampit().init(function (opts) {
    t.ok(opts, 'opts should be passed to init()');
    t.ok(opts.instance, 'opts.instance should exist');
    t.equal(typeof opts.instance, 'object', 'opts.instance should be object');
    t.ok(opts.stamp, 'opts.stamp should exist');
    t.equal(typeof opts.stamp, 'function', 'opts.stamp should be function');
    t.ok(opts.args, 'opts.args should exist');
    t.ok(isArray(opts.args), 'opts.args should be array');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign `this` to `opts.instance`', function (t) {
  var stamp = stampit().init(function (opts) {
    t.ok(opts.instance === this, 'opts.instance should equal `this`');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign stamp to `opts.stamp`', function (t) {
  var stamp = stampit().init(function (opts) {
    t.ok(opts.stamp === stamp, 'opts.stamp should equal stamp');
  });

  stamp();

  t.end();
});

test('stamp.init() should assign arguments to `opts.args`', function (t) {
  var stamp = stampit().init(function (opts) {
    t.equal(opts.args[0], 'arg1', 'opts.args should equal arguments');
    t.equal(opts.args[1], undefined, 'opts.args should equal arguments');
    t.equal(opts.args[2], 'arg3', 'opts.args should equal arguments');
  });

  stamp({}, 'arg1', undefined, 'arg3');

  t.end();
});
