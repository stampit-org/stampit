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
var forOwn = require('lodash/object/forOwn');
var isFunction = require('lodash/lang/isFunction');
var isArray = Array.isArray;
var isObject = require('lodash/lang/isObject');
var create = Object.create;
var slice = require('lodash/array/slice');
var mixer = require('supermixer');

/* jshint -W024 */

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
function addRefs(fixed, refs) {
  var args = [fixed.refs || fixed.state].concat(refs);
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
function addStatic(fixed, statics) {
  var args = [fixed.static].concat(statics);
  fixed.static = mixer.mixin.apply(null, args);
  return fixed.static;
}

function cloneAndExtend(fixed, extensionFunction, args) {
  args = arguments.length > 3 ? slice(arguments, 2, arguments.length) : args;
  var stamp = stampit(fixed);
  extensionFunction(stamp.fixed, args);
  return stamp;
}

function compose(factories) {
  factories = isArray(factories) ? factories : slice(arguments);
  var result = stampit();
  forEach(factories, function (source) {
    if (source && source.fixed) {
      addMethods(result.fixed, source.fixed.methods);
      // We might end up having two different stampit modules loaded and used in conjunction.
      // These || operators ensure that old stamps could be combined with the current version stamps.
      addRefs(result.fixed, source.fixed.refs || source.fixed.state); // 'state' is the old name for 'refs'
      addInit(result.fixed, source.fixed.init || source.fixed.enclose); // 'enclose' is the old name for 'init'
      addProps(result.fixed, source.fixed.props);
      addStatic(result.fixed, source.fixed.static);
    }
  });
  return mixer.mixin(result, result.fixed.static);
}

/**
 * Return a factory function that will produce new objects using the
 * components that are passed in or composed.
 *
 * @param  {Object} [options] Options to build stamp from: `{ methods, refs, init, props }`
 * @param  {Object} [options.methods] A map of method names and bodies for delegation.
 * @param  {Object} [options.refs] A map of property names and values to be mixed into each new object.
 * @param  {Object} [options.init] A closure (function) used to create private data and privileged methods.
 * @param  {Object} [options.props] An object to be deeply cloned into each newly stamped object.
 * @param  {Object} [options.static] An object to be mixed into each `this` and derived stamps (not objects!).
 * @return {Function(refs)} factory A factory to produce objects.
 * @return {Function(refs)} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the stamp components.
 * @return {Function(methods)} factory.methods Add methods to the stamp. Chainable.
 * @return {Function(refs)} factory.refs Add references to the stamp. Chainable.
 * @return {Function(Function(context))} factory.init Add a closure which called on object instantiation. Chainable.
 * @return {Function(props)} factory.props Add deeply cloned properties to the produced objects. Chainable.
 * @return {Function(stamps)} factory.compose Combine several stamps into single. Chainable.
 * @return {Function(statics)} factory.static Add properties to the stamp (not objects!). Chainable.
 */
stampit = function stampit(options) {
  var fixed = {methods: {}, refs: {}, init: [], props: {}, static: {}};
  fixed.state = fixed.refs; // Backward compatibility. 'state' is the old name for 'refs'.
  fixed.enclose = fixed.init; // Backward compatibility. 'enclose' is the old name for 'init'.
  if (options) {
    addMethods(fixed, options.methods);
    addRefs(fixed, options.refs);
    addInit(fixed, options.init);
    addProps(fixed, options.props);
    addStatic(fixed, options.static);
  }

  var factory = function Factory(refs, args) {
    var instance = mixer.mixin(create(fixed.methods), fixed.refs, refs);
    mixer.mergeUnique(instance, fixed.props); // props are safely merged into refs

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

  var refsMethod = cloneAndExtend.bind(null, fixed, addRefs);
  var initMethod = cloneAndExtend.bind(null, fixed, addInit);
  return mixer.mixin(factory, {
    /**
     * Creates a new object instance form the stamp.
     */
    create: factory,

    /**
     * The stamp components.
     */
    fixed: fixed,

    /**
     * Take n objects and add them to the methods list of a new stamp. Creates new stamp.
     * @return {Function} A new stamp (factory object).
     */
    methods: cloneAndExtend.bind(null, fixed, addMethods),

    /**
     * Take n objects and add them to the references list of a new stamp. Creates new stamp.
     * @return {Function} A new stamp (factory object).
     */
    refs: refsMethod,

    /**
     * Alias to refs(). Deprecated.
     * @return {Function} A new stamp (factory object).
     */
    state: refsMethod,

    /**
     * Take n functions, an array of functions, or n objects and add
     * the functions to the initializers list of a new stamp. Creates new stamp.
     * @return {Function} A new stamp (factory object).
     */
    init: initMethod,

    /**
     * Alias to init(). Deprecated.
     * @return {Function} A new stamp (factory object).
     */
    enclose: initMethod,

    /**
     * Take n objects and deep merge them to the properties. Creates new stamp.
     * @return {Function} A new stamp (factory object).
     */
    props: cloneAndExtend.bind(null, fixed, addProps),

    /**
     * Take n objects and add all props to the factory object. Creates new stamp.
     * @return {Function} A new stamp (factory object).
     */
    static: function () {
      var newStamp = cloneAndExtend(this.fixed, addStatic, slice(arguments));
      return mixer.mixin(newStamp, newStamp.fixed.static);
    },

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
  }, fixed.static);
};

// Static methods

function isStamp(obj) {
  return (
  isFunction(obj) &&
  isFunction(obj.methods) &&
  // isStamp can be called for old stampit factory object. We should check old names (state and enclose) too.
  (isFunction(obj.refs) || isFunction(obj.state)) &&
  (isFunction(obj.init) || isFunction(obj.enclose)) &&
  isFunction(obj.props) &&
  isFunction(obj.static) &&
  isObject(obj.fixed)
  );
}

function convertConstructor(Constructor) {
  var stamp = stampit();
  mixer.mixinChainFunctions(stamp.fixed.methods, Constructor.prototype);
  stamp.fixed.refs = stamp.fixed.state = mixer.mergeChainNonFunctions(stamp.fixed.refs, Constructor.prototype);
  addInit(stamp.fixed, function (opts) {
    return Constructor.apply(opts.instance, opts.args);
  });
  return stamp;
}

function shortcutMethod(extensionFunction, args) {
  args = arguments.length > 2 ? slice(arguments, 1, arguments.length) : args;
  var stamp = stampit();
  extensionFunction(stamp.fixed, args);
  return stamp;
}

module.exports = mixer.mixin(stampit, {

  /**
   * Take n objects and add them to the methods list of a new stamp. Creates new stamp.
   * @return {Function} A new stamp (factory object).
   */
  methods: shortcutMethod.bind(null, addMethods),

  /**
   * Take n objects and add them to the references list of a new stamp. Creates new stamp.
   * @return {Function} A new stamp (factory object).
   */
  refs: shortcutMethod.bind(null, addRefs),

  /**
   * Take n functions, an array of functions, or n objects and add
   * the functions to the initializers list of a new stamp. Creates new stamp.
   * @return {Function} A new stamp (factory object).
   */
  init: shortcutMethod.bind(null, addInit),

  /**
   * Take n objects and deep merge them to the properties. Creates new stamp.
   * @return {Function} A new stamp (factory object).
   */
  props: shortcutMethod.bind(null, addProps),

  /**
   * Take n objects and add all props to the factory object. Creates new stamp.
   * @return {Function} A new stamp (factory object).
   */
  static: function () {
    var newStamp = shortcutMethod(addStatic, slice(arguments));
    return mixer.mixin(newStamp, newStamp.fixed.static);
  },

  /**
   * Take two or more factories produced from stampit() and
   * combine them to produce a new factory.
   * Combining overrides properties with last-in priority.
   * @param {[Function]|...Function} factories Stamps produced by stampit().
   * @return {Function} A new stampit factory composed from arguments.
   */
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
   * Alias for mixin
   */
  assign: mixer.mixin,
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

  /**
   * Take an old-fashioned JS constructor and return a stampit stamp
   * that you can freely compose with other stamps.
   * @param  {Function} Constructor
   * @return {Function} A composable stampit factory (aka stamp).
   */
  convertConstructor: convertConstructor
});
