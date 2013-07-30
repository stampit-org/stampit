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
var mixIn = require('mout/object/mixIn');
var forOwn = require('mout/object/forOwn');
var stringify = require('json-stringify-safe');
var indexOf = require('./indexof'); // shim indexOf for stringify
var mixInChain = require('./mixinchain.js');

var create = function (o) {
  if (arguments.length > 1) {
    throw new Error('Object.create implementation only accepts the first parameter.');
  }
  function F() {}
  F.prototype = o;
  return new F();
};

if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

var extractFunctions = function extractFunctions(arg) {
  var arr = [],
    args = [].slice.call(arguments);

  if (typeof arg === 'function') {
    arr = args.map(function (fn) {
      if (typeof fn === 'function') {
        return fn;
      }
    });
  } else if (typeof arg === 'object') {
    args.forEach(function (obj) {
      forOwn(obj, function (fn) {
        arr.push(fn);
      });
    });
  } else if ( Array.isArray(arg) ) {
    forEach(arg, function (fn) {
      arr.push(fn);
    });
  }
  return arr;
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
      enclose: extractFunctions(enclose)
    },

    factory = function factory(properties) {
      var instance = mixIn(create(fixed.methods || {}),
        fixed.state, properties),
        closures = fixed.enclose;

      forEach(closures, function (fn) {
        if (typeof fn === 'function') {
          instance = fn.call(instance) || instance;
        }
      });

      return instance;
    };

  return mixIn(factory, {
    create: factory,
    fixed: fixed,
    /**
     * Take n objects and add them to the methods prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    methods: function methods() {
      var obj = fixed.methods || {},
        args = [obj].concat([].slice.call(arguments));
      fixed.methods = mixInChain.apply(this, args);
      return this;
    },
    /**
     * Take n objects and add them to the state prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    state: function state() {
      var obj = fixed.state || {},
        args = [obj].concat([].slice.call(arguments));
      fixed.state = mixIn.apply(this, args);
      return this;
    },
    /**
     * Take n functions, an array of functions, or n objects and add
     * the functions to the enclose prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    enclose: function enclose() {
      fixed.enclose = fixed.enclose
        .concat( extractFunctions.apply(null, arguments) );
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
    obj = stampit();

  forEach(args, function (source) {
    if (source) {
      if (source.fixed.methods) {
        obj.fixed.methods = mixInChain({}, obj.fixed.methods,
          source.fixed.methods);
      }

      if (source.fixed.state) {
        obj.fixed.state = mixIn({}, obj.fixed.state,
          source.fixed.state);
      }

      if (source.fixed.enclose) {
        obj.fixed.enclose = obj.fixed.enclose
          .concat(source.fixed.enclose);
      }
    }
  });

  return stampit(obj.fixed.methods, obj.fixed.state,
    obj.fixed.enclose);
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
  mixIn: mixIn,

  convertConstructor: convertConstructor
});
