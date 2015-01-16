"use strict";
var deepClone = require('mout/lang/deepClone');
var isObject = require('mout/lang/isObject');
var forOwn = require('mout/object/forOwn');
var forIn = require('mout/object/forIn');

/**
 * Creates merge functions of all kinds.
 * @param {function(object, string)} filter    Function which filters value and key.
 * @param {boolean} chain    Loop through prototype properties too.
 */
module.exports = function (filter, chain) {
  /**
   * Deep merge objects.
   */
  return function merge() {
    var i = 0,
      n = arguments.length,
      obj,
      // make sure we don't modify source element and it's properties
      // objects are passed by reference
      target = deepClone(arguments[0]);

    var loop = chain ? forIn : forOwn;
    while (++i < n) {
      obj = arguments[i];
      if (obj) {
        loop(
          obj,
          function (val, key) {
            if (filter && !filter(val, key)) {
              return;
            }

            if (isObject(val) && isObject(this[key])) {
              // inception, deep merge objects
              this[key] = merge(this[key], val);
            } else {
              // make sure arrays, regexp, date, objects are cloned
              this[key] = deepClone(val);
            }
          },
          target);
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
module.exports.copyFunc = function leaveFunc(val) {
  return typeof val === 'function';
};