/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/

'use strict'
var forEach = require('mout/array/foreach');
var bind = require('mout/function/bind');
var mixIn = require('mout/object/mixin');
var stringify = require('json-stringify-safe');
var indexOf = require('./indexof'); // shim indexOf for stringify

var create = function (o) {
  if (arguments.length > 1) {
    throw new Error('Object.create implementation only accepts the first parameter.');
  }
  function F() {}
  F.prototype = o;
  return new F();
};

var stampit = function stampit(methods, state, enclose) {
  var fixed = {
      methods: methods || {},
      state: state ?
          JSON.parse(JSON.stringify(state)) :
          {},
      enclose: enclose
    },

    factory = function factory(properties, enclose) {
      var instance = mixIn(create(fixed.methods || {}),
        fixed.state, properties),
        alt;

      if (typeof fixed.enclose === 'function') {
        alt = fixed.enclose.call(instance);
      }

      if (typeof enclose === 'function') {
        alt = enclose.call(alt || instance);
      }

      return alt || instance;
    };

  return mixIn(factory, {
    create: factory,
    fixed: fixed,
    methods: function (methods) {
      fixed.methods = fixed.methods ? mixIn(fixed.methods, methods) :
        methods;
      return this;
    },
    state: function (state) {
      fixed.state = fixed.state ? mixIn(fixed.state, state) :
        state;
      return this;
    },
    enclose: function (enclose) {
      fixed.enclose = enclose;
      return this;
    }
  });
};

var compose = function compose() {
  var args = [].slice.call(arguments),
    initFunctions = [],
    obj = stampit(),
    props = ['methods', 'state'];

  forEach(args, function (source) {
    if (source) {
      forEach(props, function (prop) {
        if (source.fixed[prop]) {
          obj.fixed[prop] = mixIn(obj.fixed[prop],
            source.fixed[prop]);
        }
      });

      if (typeof source.fixed.enclose === 'function') {
        initFunctions.push(source.fixed.enclose);
      }
    }
  });

  return stampit(obj.fixed.methods, obj.fixed.state, function () {
    forEach(initFunctions, bind(function (fn) {
      fn.call(this);
    }, this));
  });
};

module.exports = mixIn(stampit, {
  compose: compose,
  extend: mixIn,
  mixIn: mixIn
});
