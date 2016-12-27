import isFunction from './is-function';

/**
 * Returns true if argument is a stamp.
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}
