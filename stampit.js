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
var map = require('mout/array/map');
var forOwn = require('mout/object/forOwn');
var deepClone = require('mout/lang/deepClone');
var isFunction = require('mout/lang/isFunction');
var isArray = Array.isArray || require('mout/lang/isArray');
var isObject = require('mout/lang/isObject');
var slice = [].slice;

var mixer = require('./mixer');

// Avoiding JSHist W003 violations.
var stampit;

// We are not using 'mout/lang/createObject' shim because it does too much. We need simpler implementation.
var create = Object.create || function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };

function extractFunctions(arg) {
  if (isFunction(arg)) {
    return map(slice.call(arguments), function (fn) {
      if (isFunction(fn)) {
        return fn;
      }
    });
  } else if (isObject(arg)) {
    var arr = [];
    forEach(slice.call(arguments), function (obj) {
      forOwn(obj, function (fn) {
        arr.push(fn);
      });
    });
    return arr;
  } else if (isArray(arg)) {
    return slice.call(arg);
  }
  return [];
}

function addMethods(fixed, methods) {
  var args = [fixed.methods].concat(methods);
  mixer.mixInFunctions.apply(null, args);
  return fixed.methods;
}
function addState(fixed, states) {
  var args = [fixed.state].concat(states);
  fixed.state = mixer.merge.apply(null, args);
  return fixed.state;
}
function addEnclose(fixed, encloses) {
  encloses = isArray(encloses) ? extractFunctions.apply(null, encloses) : extractFunctions(encloses);
  fixed.enclose = fixed.enclose.concat(encloses);
  return fixed.enclose;
}

function cloneAndExtend(fixed, extensionFunction, args) {
  var stamp = stampit(fixed.methods, fixed.state, fixed.enclose);
  extensionFunction(stamp.fixed, args);
  return stamp;
}

/**
 * Take two or more factories produced from stampit() and
 * combine them to produce a new factory.
 * Combining overrides properties with last-in priority.
 * @param {[Function]|...Function} factories A factory produced by stampit().
 * @return {Function} A new stampit factory composed from arguments.
 */
function compose(factories) {
  factories = isArray(factories) ? factories : slice.call(arguments);
  var result = stampit();
  forEach(factories, function (source) {
    if (source && source.fixed) {
      addMethods(result.fixed, source.fixed.methods);
      addState(result.fixed, source.fixed.state);
      addEnclose(result.fixed, source.fixed.enclose);
    }
  });
  return result;
}

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
stampit = function stampit(methods, state, enclose) {
  var fixed = { methods: {}, state: {}, enclose: [] };
  addMethods(fixed, methods);
  addState(fixed, state);
  addEnclose(fixed, enclose);

  var factory = function factory(properties, args) {
    var state = properties ? mixer.merge({}, fixed.state, properties) : deepClone(fixed.state),
      instance = mixer.mixIn(create(fixed.methods), state);

    if (fixed.enclose.length > 0) {
      args = args === undefined ? undefined : slice.call(arguments, 1);
      forEach(fixed.enclose, function (fn) {
        if (isFunction(fn)) {
          instance = fn.apply(instance, args) || instance;
        }
      });
    }

    return instance;
  };

  return mixer.mixIn(factory, {
    create: factory,
    fixed: fixed,
    /**
     * Take n objects and add them to the methods prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    methods: function stampMethods() {
      return cloneAndExtend(fixed, addMethods, slice.call(arguments));
    },
    /**
     * Take n objects and add them to the state prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    state: function stampState() {
      return cloneAndExtend(fixed, addState, slice.call(arguments));
    },
    /**
     * Take n functions, an array of functions, or n objects and add
     * the functions to the enclose prototype.
     * @return {Object} The factory in question (`this`).
     */
    enclose: function stampEnclose() {
      return cloneAndExtend(fixed, addEnclose, slice.call(arguments));
    },
    /**
     * Take one or more factories produced from stampit() and
     * combine them with `this` to produce and return a new factory.
     * Combining overrides properties with last-in priority.
     * @param {[Function]|...Function} factories Stampit factories.
     * @return {Function} A new stampit factory composed from arguments.
     */
    compose: function (factories) {
      var args = isArray(factories) ? factories : slice.call(arguments);
      args = [this].concat(args);
      return compose(args);
    }
  });
};

// Static methods

/**
 * Check if an object is a stamp.
 * @param {Object} obj An object to check.
 * @returns {Boolean}
 */
function isStamp(obj) {
  return (
  isFunction(obj) &&
  isFunction(obj.methods) &&
  isFunction(obj.state) &&
  isFunction(obj.enclose) &&
  isObject(obj.fixed)
  );
}

/**
 * Take an old-fashioned JS constructor and return a stampit stamp
 * that you can freely compose with other stamps.
 * @param  {Function} Constructor
 * @return {Function}             A composable stampit factory
 *                                (aka stamp).
 */
function convertConstructor(Constructor) {
  var stamp = stampit();
  mixer.mixInChainFunctions(stamp.fixed.methods, Constructor.prototype);
  mixer.mixIn(stamp.fixed.state, Constructor);
  stamp.fixed.state = mixer.mergeChainObjects(stamp.fixed.state, Constructor.prototype);
  addEnclose(stamp.fixed, Constructor);
  return stamp;
}

module.exports = mixer.mixIn(stampit, {
  compose: compose,
  /**
   * Alias for mixIn
   */
  extend: mixer.mixIn,
  /**
   * Take a destination object followed by one or more source objects,
   * and copy the source object properties to the destination object,
   * with last in priority overrides.
   * @param {Object} destination An object to copy properties to.
   * @param {...Object} source An object to copy properties from.
   * @returns {Object}
   */
  mixIn: mixer.mixIn,
  /**
   * Check if an object is a stamp.
   * @param {Object} obj An object to check.
   * @returns {Boolean}
   */
  isStamp: isStamp,

  convertConstructor: convertConstructor
});
