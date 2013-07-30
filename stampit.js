/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/

'use strict';
var forEach = require('mout/array/forEach');
var bind = require('mout/function/bind');
var mixIn = require('mout/object/mixIn');
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

/**
 * Return a factory function that will produce new objects using the
 * prototypes that are passed in or composed.
 *
 * @param  {Object} [methods] A map of method names and bodies for delegation.
 * @param  {Object} [state]   A map of property names and values to clone for each new object.
 * @param  {Function} [enclose] A closure (function) used to create private data and privileged methods.
 * @return {Function} factory A factory to produce objects using the given prototypes.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the fixed prototypes.
 * @return {Function} factory.methods Add methods to the methods prototype. Chainable.
 * @return {Function} factory.state Add properties to the state prototype. Chainable.
 * @return {Function} factory.enclose Add or replace the closure prototype. Not chainable.
 */
var stampit = function stampit(methods, state, enclose) {
  var fixed = {
      methods: methods || {},
      state: state ?
          JSON.parse(stringify(state)) :
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
    methods: function () {
      var obj = fixed.methods || {},
        args = [obj].concat([].slice.call(arguments));
      fixed.methods = mixIn.apply(this, args);
      return this;
    },
    state: function (state) {
      var obj = fixed.state || {},
        args = [obj].concat([].slice.call(arguments));
      fixed.state = mixIn.apply(this, args);
      return this;
    },
    enclose: function (enclose) {
      fixed.enclose = enclose;
      return this;
    }
  });
};

/**
 * Take two or more factories produced from stampit() and
 * combine them to produce a new factory. Combining overrides
 * properties with last-in priority.
 *
 * @param {...Function} factory A factory produced by stampit().
 * @return {Function} A new stampit factory composed from arguments.
 */
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

/**
 * Take an old-fashioned JS constructor and return a stampit stamp
 * that you can freely compose with other stamps.
 * @param  {Function} Constructor 
 * @return {Function}             A composable stampit factory
 *                                (aka stamp).
 */
var convertConstructor = function convertConstructor(Constructor) {
  return stampit().methods(Constructor.prototype).enclose(Constructor);
};

indexOf();

module.exports = mixIn(stampit, {
  compose: compose,
  /**
   * Alias for mixIn
   */
  extend: mixIn,
  /**
   * Take a destination object followed by one or more source objects,
   * and copy the source object properties to the destination object,
   * with last in priority overrides.
   * @param {Object} destination An object to copy properties to.
   * @param {...Object} source An object to copy properties from.
   * @returns {Object}
   */
  mixIn: mixIn
});
