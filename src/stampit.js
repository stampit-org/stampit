/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/
import forEach from 'lodash/collection/forEach';
import isFunction from 'lodash/lang/isFunction';
import isObject from 'lodash/lang/isObject';
import isArray from 'lodash/lang/isArray';
import objectValues from 'lodash/object/values';
import sortBy from 'lodash/collection/sortBy';
import {
  merge,
  mergeChainNonFunctions,
  mergeUnique,
  mixin,
  mixinChainFunctions,
  mixinFunctions
} from 'supermixer';

const create = Object.create;
function isThenable(value) {
  return value && isFunction(value.then);
}

function extractFunctions(...args) {
  const result = [];
  if (isFunction(args[0])) {
    forEach(args, fn => { // assuming all the arguments are functions
      if (isFunction(fn)) {
        result.push(fn);
      }
    });
  } else if (isObject(args[0])) {
    forEach(args, obj => {
      forEach(obj, fn => {
        if (isFunction(fn)) {
          result.push(fn);
        }
      });
    });
  }
  return result;
}

function addMethods(fixed, ...methods) {
  return mixinFunctions(fixed.methods, ...methods);
}
function addRefs(fixed, ...refs) {
  fixed.refs = fixed.state = mixin(fixed.refs, ...refs);
  return fixed.refs;
}
function addInit(fixed, ...inits) {
  const extractedInits = extractFunctions(...inits);
  fixed.init = fixed.enclose = fixed.init.concat(extractedInits);
  return fixed.init;
}
function addProps(fixed, ...propses) {
  return merge(fixed.props, ...propses);
}
function addStatic(fixed, ...statics) {
  return mixin(fixed.static, ...statics);
}

function cloneAndExtend(fixed, extensionFunction, ...args) {
  const stamp = stampit(fixed);
  extensionFunction(stamp.fixed, ...args);
  return stamp;
}

function splitComposers(array) {
  let anon = [];
  let named = {};

  forEach(array, comp => {
    if (comp.name) {
      named[comp.name] = comp;
    } else {
      anon.push(comp);
    }
  });

  return {
    anon: anon,
    named: named
  };
}

function addComposers(fixed, newComposers) {
  let composers = newComposers;
  if (!isArray(composers)) {
    if (isObject(composers)) {
      composers = [composers];
    } else {
      return fixed.composers;
    }
  }

  if (!composers) {
    return fixed.composers;
  }

  const current = splitComposers(fixed.composers);
  const added = splitComposers(composers);

  // replace current.named with added.named where names are the same
  const named = Object.assign({}, current.named, added.named);

  let finalComps = objectValues(named);

  finalComps = finalComps.concat(added.anon, current.anon);

  finalComps = sortBy(finalComps, (comp) => {
    return comp.sort;
  });

  fixed.composers = finalComps;

  return fixed.composers;
}

function callComposers(fixed, sourceFixed) {
  if (!fixed.composers) {
    return fixed;
  }

  let fixedResult = fixed;

  forEach(fixed.composers, composer => {
    if (!isFunction(composer.compose)) {
      return; // not a function, do nothing.
    }

    fixedResult = composer.compose.call(null, fixed, sourceFixed) || fixed;
  });

  return fixedResult;
}

function compose(...factories) {
  let result = stampit();
  forEach(factories, source => {
    let sourceFixed;

    if (source && source.fixed) {
      addComposers(result.fixed, source.fixed.composers);
      sourceFixed = source.fixed;
    }

    result.fixed = callComposers(result.fixed, sourceFixed) || result.fixed;
  });

  result = mixin(result, result.fixed.static);

  return result;
}

const baseComposer = {
  name: 'base',
  sort: 0,
  compose(fixed, sourceFixed) {
    if (sourceFixed) {
      addMethods(fixed, sourceFixed.methods);
      // We might end up having two different stampit modules loaded and used in conjunction.
      // These || operators ensure that old stamps could be combined with the current version stamps.
      // 'state' is the old name for 'refs'
      addRefs(fixed, sourceFixed.refs || sourceFixed.state);
      // 'enclose' is the old name for 'init'
      addInit(fixed, sourceFixed.init || sourceFixed.enclose);
      addProps(fixed, sourceFixed.props);
      addStatic(fixed, sourceFixed.static);
    }
    return fixed;
  }
};


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
const stampit = function stampit(options) {
  let fixed = {methods: {}, refs: {}, init: [], props: {}, static: {}, composers: [baseComposer]};
  fixed.state = fixed.refs; // Backward compatibility. 'state' is the old name for 'refs'.
  fixed.enclose = fixed.init; // Backward compatibility. 'enclose' is the old name for 'init'.
  if (options && options.composers) {
    addComposers(fixed, options.composers);
  }
  // allow new instance or mutate existing
  fixed = callComposers(fixed, options) || fixed;

  const factory = function Factory(refs, ...args) {
    let instance = mixin(create(fixed.methods), fixed.refs, refs);
    mergeUnique(instance, fixed.props); // props are safely merged into refs

    let nextPromise = null;
    if (fixed.init.length > 0) {
      forEach(fixed.init, fn => {
        if (!isFunction(fn)) {
          return; // not a function, do nothing.
        }

        // Check if we are in the async mode.
        if (!nextPromise) {
          // Call the init().
          const callResult = fn.call(instance, {args, instance, stamp: factory});
          if (!callResult) {
            return; // The init() returned nothing. Proceed to the next init().
          }

          // Returned value is meaningful.
          // It will replace the stampit-created object.
          if (!isThenable(callResult)) {
            instance = callResult; // stamp is synchronous so far.
            return;
          }

          // This is the sync->async conversion point.
          // Since now our factory will return a promise, not an object.
          nextPromise = callResult;
        } else {
          // As long as one of the init() functions returned a promise,
          // now our factory will 100% return promise too.
          // Linking the init() functions into the promise chain.
          nextPromise = nextPromise.then(newInstance => {
            // The previous promise might want to return a value,
            // which we should take as a new object instance.
            instance = newInstance || instance;

            // Calling the following init().
            // NOTE, than `fn` is wrapped to a closure within the forEach loop.
            const callResult = fn.call(instance, {args, instance, stamp: factory});
            // Check if call result is truthy.
            if (!callResult) {
              // The init() returned nothing. Thus using the previous object instance.
              return instance;
            }

            if (!isThenable(callResult)) {
              // This init() was synchronous and returned a meaningful value.
              instance = callResult;
              // Resolve the instance for the next `then()`.
              return instance;
            }

            // The init() returned another promise. It is becoming our nextPromise.
            return callResult;
          });
        }
      });
    }

    // At the end we should resolve the last promise and
    // return the resolved value (as a promise too).
    return nextPromise ? nextPromise.then(newInstance => newInstance || instance) : instance;
  };

  const refsMethod = cloneAndExtend.bind(null, fixed, addRefs);
  const initMethod = cloneAndExtend.bind(null, fixed, addInit);
  return mixin(factory, {
    /**
     * Creates a new object instance from the stamp.
     */
    create: factory,

    /**
     * The stamp components.
     */
    fixed,

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
     * @deprecated since v2.0. Use refs() instead.
     * Alias to refs().
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
     * @deprecated since v2.0. User init() instead.
     * Alias to init().
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
    static(...statics) {
      const newStamp = cloneAndExtend(factory.fixed, addStatic, ...statics);
      return mixin(newStamp, newStamp.fixed.static);
    },

    /**
     * Take one or more factories produced from stampit() and
     * combine them with `this` to produce and return a new factory.
     * Combining overrides properties with last-in priority.
     * @param {[Function]|...Function} factories Stampit factories.
     * @return {Function} A new stampit factory composed from arguments.
     */
    compose: (...factories) => compose(factory, ...factories)
  }, fixed.static);
};

// Static methods

function isStamp(obj) {
  return (
    isFunction(obj) &&
    isFunction(obj.methods) &&
    // isStamp can be called for old stampit factory object.
    // We should check old names (state and enclose) too.
    (isFunction(obj.refs) || isFunction(obj.state)) &&
    (isFunction(obj.init) || isFunction(obj.enclose)) &&
    isFunction(obj.props) &&
    isFunction(obj.static) &&
    isObject(obj.fixed)
  );
}

function convertConstructor(Constructor) {
  const stamp = stampit();
  stamp.fixed.refs = stamp.fixed.state = mergeChainNonFunctions(stamp.fixed.refs, Constructor.prototype);
  mixin(stamp, mixin(stamp.fixed.static, Constructor));

  mixinChainFunctions(stamp.fixed.methods, Constructor.prototype);
  addInit(stamp.fixed, ({ instance, args }) => Constructor.apply(instance, args));

  return stamp;
}

function shortcutMethod(extensionFunction, ...args) {
  const stamp = stampit();

  extensionFunction(stamp.fixed, ...args);

  return stamp;
}

function mixinWithConsoleWarning() {
  console.log(
    'stampit.mixin(), .mixIn(), .extend(), and .assign() are deprecated.',
    'Use Object.assign or _.assign instead');
  return mixin.apply(this, arguments);
}

export default mixin(stampit, {

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
  static(...statics) {
    const newStamp = shortcutMethod(addStatic, ...statics);
    return mixin(newStamp, newStamp.fixed.static);
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
   * @deprecated Since v2.2. Use Object.assign or _.assign instead.
   * Alias to Object.assign.
   */
  mixin: mixinWithConsoleWarning,
  extend: mixinWithConsoleWarning,
  mixIn: mixinWithConsoleWarning,
  assign: mixinWithConsoleWarning,

  /**
   * Check if an object is a stamp.
   * @param {Object} obj An object to check.
   * @returns {Boolean}
   */
  isStamp,

  /**
   * Take an old-fashioned JS constructor and return a stampit stamp
   * that you can freely compose with other stamps.
   * @param  {Function} Constructor
   * @return {Function} A composable stampit factory (aka stamp).
   */
  convertConstructor,

  /**
   * Base composer object.
   * @type {Object}
   */
  baseComposer: baseComposer,

  /**
   * Expose interal composer utilities
   * @type {Object}
   */
  composerUtil: {
    addMethods: addMethods,
    addRefs: addRefs,
    addInit: addInit,
    addProps: addProps,
    addStatic: addStatic
  }

});
