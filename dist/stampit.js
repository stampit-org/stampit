!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.stampit=e():"undefined"!=typeof global?global.stampit=e():"undefined"!=typeof self&&(self.stampit=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var forOwn = require('mout/object/forOwn');
var forIn = require('mout/object/forIn');
var deepClone = require('mout/lang/deepClone');
var isObject = require('mout/lang/isObject');
var isFunction = require('mout/lang/isFunction');

/**
 * Creates mixin functions of all kinds.
 * @param {object} opts    Options.
 * @param {function(object, string)} opts.filter    Function which filters value and key.
 * @param {boolean} opts.chain    Loop through prototype properties too.
 * @param {function(object)} opts.getTarget    Converts an object object to a target.
 * @param {function(object, object)} opts.getValue    Converts src and dst values to a new value.
 */
var mixer = function (opts) {
  opts = opts || {};
  /**
   * Combine properties from all the objects into first one.
   * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
   * @param {object} target    Target Object
   * @param {object[]} objects    Objects to be combined (0...n objects).
   * @return {object} Target Object.
   */
  return function mixIn(target, objects) {
    var loop = opts.chain ? forIn : forOwn;
    var i = 0,
      n = arguments.length,
      obj;
    target = opts.getTarget ? opts.getTarget(target) : target;

    while (++i < n) {
      obj = arguments[i];
      if (obj) {
        loop(
          obj,
          function (val, key) {
            if (opts.filter && !opts.filter(val, key)) {
              return;
            }

            this[key] = opts.getValue ? opts.getValue(val, this[key]) : val;
          },
          target);
      }
    }
    return target;
  }
};

var merge = mixer({
  getTarget: deepClone,
  getValue: mergeSourceToTarget
});

function mergeSourceToTarget(srcVal, targetVal) {
  if (isObject(srcVal) && isObject(targetVal)) {
    // inception, deep merge objects
    return merge(targetVal, srcVal);
  } else {
    // make sure arrays, regexp, date, objects are cloned
    return deepClone(srcVal);
  }
}

module.exports = mixer;

/**
 * Regular mixin function.
 */
module.exports.mixIn = mixer();

/**
 * mixin for functions only.
 */
module.exports.mixInFunctions = mixer({
  filter: isFunction
});

/**
 * mixin for functions including prototype chain.
 */
module.exports.mixInChainFunctions = mixer({
  filter: isFunction,
  chain: true
});

/**
 * Regular object merger function.
 */
module.exports.merge = merge;

/**
 * merge objects including prototype chain properties.
 */
module.exports.mergeChainNonFunctions = mixer({
  filter: function (val) { return !isFunction(val); },
  getTarget: deepClone,
  getValue: mergeSourceToTarget,
  chain: true
});

},{"mout/lang/deepClone":7,"mout/lang/isFunction":9,"mout/lang/isObject":11,"mout/object/forIn":15,"mout/object/forOwn":16}],2:[function(require,module,exports){


    /**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    module.exports = forEach;



},{}],3:[function(require,module,exports){
var forEach = require('./forEach');
var makeIterator = require('../function/makeIterator_');

    /**
     * Array map
     */
    function map(arr, callback, thisObj) {
        callback = makeIterator(callback, thisObj);
        var results = [];
        if (arr == null){
            return results;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            results[i] = callback(arr[i], i, arr);
        }

        return results;
    }

     module.exports = map;


},{"../function/makeIterator_":4,"./forEach":2}],4:[function(require,module,exports){
var prop = require('./prop');
var deepMatches = require('../object/deepMatches');

    /**
     * Converts argument into a valid iterator.
     * Used internally on most array/object/collection methods that receives a
     * callback/iterator providing a shortcut syntax.
     */
    function makeIterator(src, thisObj){
        switch(typeof src) {
            case 'object':
                // typeof null == "object"
                return (src != null)? function(val, key, target){
                    return deepMatches(val, src);
                } : src;
            case 'string':
            case 'number':
                return prop(src);
            case 'function':
                if (typeof thisObj === 'undefined') {
                    return src;
                } else {
                    return function(val, i, arr){
                        return src.call(thisObj, val, i, arr);
                    };
                }
            default:
                return src;
        }
    }

    module.exports = makeIterator;



},{"../object/deepMatches":14,"./prop":5}],5:[function(require,module,exports){


    /**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    module.exports = prop;



},{}],6:[function(require,module,exports){
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');
var mixIn = require('../object/mixIn');

    /**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf(val)) {
            case 'Object':
                return cloneObject(val);
            case 'Array':
                return cloneArray(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject(source) {
        if (isPlainObject(source)) {
            return mixIn({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignorecase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray(arr) {
        return arr.slice();
    }

    module.exports = clone;



},{"../object/mixIn":18,"./isPlainObject":12,"./kindOf":13}],7:[function(require,module,exports){
var clone = require('./clone');
var forOwn = require('../object/forOwn');
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');

    /**
     * Recursively clone native types.
     */
    function deepClone(val, instanceClone) {
        switch ( kindOf(val) ) {
            case 'Object':
                return cloneObject(val, instanceClone);
            case 'Array':
                return cloneArray(val, instanceClone);
            default:
                return clone(val);
        }
    }

    function cloneObject(source, instanceClone) {
        if (isPlainObject(source)) {
            var out = {};
            forOwn(source, function(val, key) {
                this[key] = deepClone(val, instanceClone);
            }, out);
            return out;
        } else if (instanceClone) {
            return instanceClone(source);
        } else {
            return source;
        }
    }

    function cloneArray(arr, instanceClone) {
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = deepClone(arr[i], instanceClone);
        }
        return out;
    }

    module.exports = deepClone;




},{"../object/forOwn":16,"./clone":6,"./isPlainObject":12,"./kindOf":13}],8:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    module.exports = isArray;


},{"./isKind":10}],9:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    module.exports = isFunction;


},{"./isKind":10}],10:[function(require,module,exports){
var kindOf = require('./kindOf');
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    module.exports = isKind;


},{"./kindOf":13}],11:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    module.exports = isObject;


},{"./isKind":10}],12:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value
            && typeof value === 'object'
            && value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],13:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],14:[function(require,module,exports){
var forOwn = require('./forOwn');
var isArray = require('../lang/isArray');

    function containsMatch(array, pattern) {
        var i = -1, length = array.length;
        while (++i < length) {
            if (deepMatches(array[i], pattern)) {
                return true;
            }
        }

        return false;
    }

    function matchArray(target, pattern) {
        var i = -1, patternLength = pattern.length;
        while (++i < patternLength) {
            if (!containsMatch(target, pattern[i])) {
                return false;
            }
        }

        return true;
    }

    function matchObject(target, pattern) {
        var result = true;
        forOwn(pattern, function(val, key) {
            if (!deepMatches(target[key], val)) {
                // Return false to break out of forOwn early
                return (result = false);
            }
        });

        return result;
    }

    /**
     * Recursively check if the objects match.
     */
    function deepMatches(target, pattern){
        if (target && typeof target === 'object') {
            if (isArray(target) && isArray(pattern)) {
                return matchArray(target, pattern);
            } else {
                return matchObject(target, pattern);
            }
        } else {
            return target === pattern;
        }
    }

    module.exports = deepMatches;



},{"../lang/isArray":8,"./forOwn":16}],15:[function(require,module,exports){


    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                // since we aren't using hasOwn check we need to make sure the
                // property was overwritten
                if (obj[key] !== Object.prototype[key]) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{}],16:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":15,"./hasOwn":17}],17:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],18:[function(require,module,exports){
var forOwn = require('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":16}],19:[function(require,module,exports){
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
    var state = properties ? mixer.merge(fixed.state, properties) : deepClone(fixed.state),
      instance = mixer.mixIn(create(fixed.methods), state);

    if (fixed.enclose.length > 0) {
      args = slice.call(arguments, 1, arguments.length);
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
  stamp.fixed.state = mixer.mergeChainNonFunctions(stamp.fixed.state, Constructor.prototype);
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

},{"./mixer":1,"mout/array/forEach":2,"mout/array/map":3,"mout/lang/deepClone":7,"mout/lang/isArray":8,"mout/lang/isFunction":9,"mout/lang/isObject":11,"mout/object/forOwn":16}]},{},[19])
(19)
});
;