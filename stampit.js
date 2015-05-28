/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/
'use strict';
var forEach = require('lodash/collection/forEach');
var map = require('lodash/collection/map');
var bind = require('lodash/function/bind'); // IE8 shim
var forOwn = require('lodash/object/forOwn');
var deepClone = require('lodash/lang/cloneDeep');
var isFunction = require('lodash/lang/isFunction');
var isArray = require('lodash/lang/isArray');
var isObject = require('lodash/lang/isObject');
var create = require('lodash/object/create');
var slice = require('lodash/array/slice');

var mixer = require('./mixer');

// Avoiding JSHist W003 violations.
var stampit;

function extractFunctions(arg) {
  if (isFunction(arg)) {
    return map(slice(arguments), function (fn) {
      if (isFunction(fn)) {
        return fn;
      }
    });
  } else if (isObject(arg)) {
    var arr = [];
    forEach(slice(arguments), function (obj) {
      forOwn(obj, function (fn) {
        arr.push(fn);
      });
    });
    return arr;
  } else if (isArray(arg)) {
    return slice(arg);
  }
  return [];
}

function addMethods(fixed, methods) {
  var args = [fixed.methods].concat(methods);
  mixer.mixinFunctions.apply(null, args);
  return fixed.methods;
}
function addRefs(fixed, states) {
  var args = [fixed.refs || fixed.state].concat(states);
  fixed.refs = fixed.state = mixer.mixin.apply(null, args);
  return fixed.refs;
}
function addInit(fixed, inits) {
  inits = isArray(inits) ? extractFunctions.apply(null, inits) : extractFunctions(inits);
  fixed.init = fixed.enclose = (fixed.init || fixed.enclose).concat(inits);
  return fixed.init;
}
function addProps(fixed, propses) {
  var args = [fixed.props].concat(propses);
  fixed.props = mixer.merge.apply(null, args);
  return fixed.props;
}

function cloneAndExtend(fixed, extensionFunction, args) {
  args = arguments.length > 3 ? slice(arguments, 2, arguments.length) : args;
  // We might end up having two stampit loaded and used in conjunction.
  // These || operators ensure that old stamps could be combined with the current version stamps.
  var stamp = stampit(fixed.methods, fixed.refs || fixed.state, fixed.init || fixed.enclose, fixed.props);
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
  factories = isArray(factories) ? factories : slice(arguments);
  var result = stampit();
  forEach(factories, function (source) {
    if (source && source.fixed) {
      addMethods(result.fixed, source.fixed.methods);
      addRefs(result.fixed, source.fixed.refs || source.fixed.state); // 'state' is the old name for 'refs'
      addInit(result.fixed, source.fixed.init || source.fixed.enclose); // 'enclose' is the old name for 'init'
      addProps(result.fixed, source.fixed.props);
    }
  });
  return result;
}

/**
 * Return a factory function that will produce new objects using the
 * prototypes that are passed in or composed.
 *
 * @param  {Object} [methods] A map of method names and bodies for delegation.
 * @param  {Object} [refs]   A map of property names and values to be mixed into each new object.
 * @param  {Function} [init] A closure (function) used to create private data and privileged methods.
 * @param  {Object} [props]   An object to be deeply cloned into each newly stamped object.
 * @return {Function} factory A factory to produce objects using the given prototypes.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the fixed prototypes.
 * @return {Function} factory.methods Add methods to the prototype. Chainable.
 * @return {Function} factory.refs Add references to the prototype. Chainable.
 * @return {Function} factory.state Alias to refs().
 * @return {Function} factory.init Add a closure which called on object instantiation. Chainable.
 * @return {Function} factory.enclose Alias to init()t.
 * @return {Function} factory.props Add deeply cloned properties to the produced objects. Chainable.
 */
stampit = function stampit(methods, refs, init, props) {
  var fixed = {methods: {}, refs: {}, init: [], props: {}};
  fixed.state = fixed.refs; // Backward compatibility. 'state' is the old name for 'refs'.
  fixed.enclose = fixed.init; // Backward compatibility. 'enclose' is the old name for 'init'.
  addMethods(fixed, methods);
  addRefs(fixed, refs);
  addInit(fixed, init);
  addProps(fixed, props);

  var factory = function Factory(properties, args) {
    properties = properties ? mixer.merge({}, fixed.props, properties) : deepClone(fixed.props);
    var instance = mixer.mixin(create(fixed.methods), fixed.refs, properties); // props are taking over refs

    if (fixed.init.length > 0) {
      args = slice(arguments, 1, arguments.length);
      forEach(fixed.init, function (fn) {
        if (isFunction(fn)) {
          instance = fn.call(instance, { args: args, instance: instance, stamp: factory }) || instance;
        }
      });
    }

    return instance;
  };

  var refsMethod = bind(cloneAndExtend, factory, fixed, addRefs);
  var initMethod = bind(cloneAndExtend, factory, fixed, addInit);
  return mixer.mixin(factory, {
    create: factory,
    fixed: fixed,

    /**
     * Take n objects and add them to the methods prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    methods: bind(cloneAndExtend, factory, fixed, addMethods),

    /**
     * Take n objects and add them to the newly stamped objects.
     * @return {Object} stamp  The factory in question (`this`).
     */
    refs: refsMethod,

    /**
     * Alias to refs(). Deprecated.
     * @return {Object} stamp  The factory in question (`this`).
     */
    state: refsMethod,

    /**
     * Take n functions, an array of functions, or n objects and add
     * the functions to the enclose prototype.
     * @return {Object} The factory in question (`this`).
     */
    init: initMethod,

    /**
     * Alias to init(). Deprecated.
     * @return {Object} The factory in question (`this`).
     */
    enclose: initMethod,

    /**
     * Take n objects and add deep clone them to the instantiated object.
     * @return {Object} stamp  The factory in question (`this`).
     */
    props: bind(cloneAndExtend, factory, fixed, addProps),

    /**
     * Take one or more factories produced from stampit() and
     * combine them with `this` to produce and return a new factory.
     * Combining overrides properties with last-in priority.
     * @param {[Function]|...Function} factories Stampit factories.
     * @return {Function} A new stampit factory composed from arguments.
     */
    compose: function (factories) {
      var args = isArray(factories) ? factories : slice(arguments);
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
  // isStamp can be called for old stampit factory object. We should check old names (state and enclose) too.
  (isFunction(obj.refs) || isFunction(obj.state)) &&
  (isFunction(obj.init) || isFunction(obj.enclose)) &&
  isFunction(obj.props) &&
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
  mixer.mixinChainFunctions(stamp.fixed.methods, Constructor.prototype);
  stamp.fixed.refs = stamp.fixed.state = mixer.mergeChainNonFunctions(stamp.fixed.refs, Constructor.prototype);
  addInit(stamp.fixed, function (opts) {
    return Constructor.apply(opts.instance, opts.args);
  });
  return stamp;
}

module.exports = mixer.mixin(stampit, {
  compose: compose,
  /**
   * Alias for mixin
   */
  extend: mixer.mixin,
  /**
   * Alias for mixin
   */
  mixIn: mixer.mixin,
  /**
   * Take a destination object followed by one or more source objects,
   * and copy the source object properties to the destination object,
   * with last in priority overrides.
   * @param {Object} destination An object to copy properties to.
   * @param {...Object} source An object to copy properties from.
   * @returns {Object}
   */
  mixin: mixer.mixin,
  /**
   * Check if an object is a stamp.
   * @param {Object} obj An object to check.
   * @returns {Boolean}
   */
  isStamp: isStamp,

  convertConstructor: convertConstructor
});
