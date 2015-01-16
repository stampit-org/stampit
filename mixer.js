"use strict";
var forOwn = require('mout/object/forOwn');
var forIn = require('mout/object/forIn');

function copy(shouldCopy) {
  return function (val, key) {
    if (shouldCopy && !shouldCopy(val, key)) {
      return;
    }
    this[key] = val;
  };
}

/**
 * Creates mixin functions of all kinds.
 * @param {function(object, string)} filter    Function which filters value and key.
 * @param {boolean} chain    Loop through prototype properties too.
 */
module.exports = function (filter, chain) {
  /**
   * Combine properties from all the objects into first one.
   * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
   * @param {object} target    Target Object
   * @param {object[]} objects    Objects to be combined (0...n objects).
   * @return {object} Target Object.
   */
  return function mixIn(target, objects){
    var loop = chain ? forIn : forOwn;
    var i = 0,
      n = arguments.length,
      obj;
    var copier = copy(filter);
    while(++i < n){
      obj = arguments[i];
      if (obj) {
        loop(obj, copier, target);
      }
    }
    return target;
  }
};

module.exports.chain = true;
module.exports.copyAll = null;
module.exports.copyProp = function (val) {
  return typeof val !== 'function';
};
module.exports.copyFunc = function (val) {
  return typeof val === 'function';
};