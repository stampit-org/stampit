function isFunction(obj) {
  return typeof obj === 'function';
}

/**
 * Returns true if argument is a stamp.
 * @param {*} obj
 * @returns {Boolean}
 */
module.exports = function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
};
