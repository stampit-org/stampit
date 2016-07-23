import slice from './slice';

function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param dst
 * @param src
 * @param shallow
 * @returns {*}
 */
function mergeOne(dst, src, shallow) {
  if (src === undefined) return dst;

  // Deal with arrays the first because arrays are object-like.
  const dstIsArray = Array.isArray(dst);
  const srcIsArray = Array.isArray(src);
  if (srcIsArray) return (dstIsArray ? dst : []).concat(src);
  if (dstIsArray) return mergeOne({}, src, shallow);

  const srcIsObjectLike = isObjectLike(src);
  if (!srcIsObjectLike) return src; // not a POJO or array or regexp overwrites

  const keys = Object.keys(src);
  const returnValue = dst || {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const srcValue = src[key];
    if (srcValue !== undefined) {
      returnValue[key] = shallow ? src[key] : mergeOne(returnValue[key], srcValue, shallow);
    }
  }

  return returnValue;
}

function mergeFew(dst, srcs, shallow) {
  return srcs.reduce((target, src) => mergeOne(target, src, shallow), dst);
}

export function assign(dst) {
  return mergeFew(dst, slice.call(arguments, 1), true);
}

export function merge(dst) {
  return mergeFew(dst, slice.call(arguments, 1), false);
}
