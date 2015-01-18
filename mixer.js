"use strict";
var forOwn = require('mout/object/forOwn');
var forIn = require('mout/object/forIn');
var deepClone = require('mout/lang/deepClone');
var isObject = require('mout/lang/isObject');

/**
 * Creates mixin functions of all kinds.
 * @param {function(object, string)} filter    Function which filters value and key.
 * @param {boolean} chain    Loop through prototype properties too.
 * @param {function(object)} getTarget    Converts an object object to a target.
 * @param {function(object, object)} getValue    Converts src and dst values to a new value.
 */
var mixer = function (filter, chain, getTarget, getValue) {
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
    target = getTarget ? getTarget(target) : target;
    
    while(++i < n){
      obj = arguments[i];
      if (obj) {
        loop(
          obj, 
          function (val, key) {
          if (filter && !filter(val, key)) {
            return;
          }
          
          this[key] = getValue ? getValue(val, this[key]) : val;
        },
        target);
      }
    }
    return target;
  }
};


/**
 * Creates merge functions of all kinds.
 * @param {function(object, string)} filter    Function which filters value and key.
 * @param {boolean} chain    Loop through prototype properties too.
 */
var merger = function (filter, chain) {
  var merge = mixer(
    filter, 
    chain, 
    function (target) {
      return deepClone(target);
    },
    function (srcVal, targetVal) {
      if (isObject(srcVal) && isObject(targetVal)) {
        // inception, deep merge objects
        return merge(targetVal, srcVal);
      } else {
        // make sure arrays, regexp, date, objects are cloned
        return deepClone(srcVal);
      }
    }
  );
  
  return merge;
};

module.exports.getMixin = mixer;
module.exports.getMerger = merger;