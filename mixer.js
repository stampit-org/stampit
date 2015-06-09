"use strict";
var forOwn = require('lodash/object/forOwn');
var forIn = require('lodash/object/forIn');
var deepClone = require('lodash/lang/cloneDeep');
var isObject = require('lodash/lang/isObject');
var isUndefined = require('lodash/lang/isUndefined');
var isFunction = require('lodash/lang/isFunction');

/**
 * Creates mixin functions of all kinds.
 * @param {object} opts    Options.
 * @param {function(object, object)} opts.filter    Function which filters value and key.
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
      obj,
      filter = opts.filter,
      getValue = opts.getValue,
      mergeValue = function mergeValue(val, key) {
        if (filter && !filter(val, target[key])) {
          return;
        }

        target[key] = getValue ? getValue(val, target[key]) : val;
      };

    target = opts.getTarget ? opts.getTarget(target) : target;

    while (++i < n) {
      obj = arguments[i];
      if (obj) {
        loop(obj, mergeValue);
      }
    }
    return target;
  };
};

var merge = mixer({
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
module.exports.mixin = mixer();

/**
 * mixin for functions only.
 */
module.exports.mixinFunctions = mixer({
  filter: isFunction
});

/**
 * mixin for functions including prototype chain.
 */
module.exports.mixinChainFunctions = mixer({
  filter: isFunction,
  chain: true
});

/**
 * Regular object merger function.
 */
module.exports.merge = merge;


var mergeUnique = mixer({
  filter: function (srcVal, targetVal) {
    return isUndefined(targetVal) || (isObject(srcVal) && isObject(targetVal));
  },
/* jshint ignore:start */
  getValue: mergeUniqueSourceToTarget
/* jshint ignore:end */
});

function mergeUniqueSourceToTarget(srcVal, targetVal) {
  if (isObject(srcVal) && isObject(targetVal)) {
    // inception, deep merge objects
    return mergeUnique(targetVal, srcVal);
  } else if (isUndefined(targetVal)) {
    // make sure arrays, regexp, date, objects are cloned
    return deepClone(srcVal);
  } else {
    return targetVal;
  }
}

/**
 * Just like regular object merge, but do not override destination object data.
 */
module.exports.mergeUnique = mergeUnique;


/**
 * merge objects including prototype chain properties.
 */
module.exports.mergeChainNonFunctions = mixer({
  filter: function (val) { return !isFunction(val); },
  getTarget: deepClone,
  getValue: mergeSourceToTarget,
  chain: true
});

/**
 * merge unique properties of objects including prototype chain properties.
 */
module.exports.mergeUniqueChainNonFunctions = mixer({
  filter: function (val) { return !isFunction(val); },
  getTarget: deepClone,
  getValue: mergeUniqueSourceToTarget,
  chain: true
});
