"use strict";
var forOwn = require('lodash/object/forOwn');
var forIn = require('lodash/object/forIn');
var deepClone = require('lodash/lang/cloneDeep');
var isObject = require('lodash/lang/isObject');
var isFunction = require('lodash/lang/isFunction');

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
   * @param {...object} objects    Objects to be combined (0...n objects).
   * @return {object} Target Object.
   */
  return function mixIn(target) {
    var loop = opts.chain ? forIn : forOwn;
    var i = 0,
      n = arguments.length,
      obj;
    target = opts.getTarget ? opts.getTarget(target) : target;

    var mergeValue = function mergeValue(val, key) {
      if (opts.filter && !opts.filter(val, key)) {
        return;
      }

      this[key] = opts.getValue ? opts.getValue(val, this[key]) : val;
    };

    while (++i < n) {
      obj = arguments[i];
      if (obj) {
        loop(
          obj,
          mergeValue,
          target);
      }
    }
    return target;
  };
};

var merge = mixer({
  getTarget: deepClone,
/* jshint ignore:start */
  getValue: mergeSourceToTarget
/* jshint ignore:end */
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
