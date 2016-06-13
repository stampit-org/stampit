import isObject from './isObject';

function mergeOne(dst, src, shallow = false) {
  if (src === undefined) return dst;
  const srcIdObject = isObject(src);
  if (!srcIdObject) return src; // not a POJO, array, or function

  const dstIsArray = Array.isArray(dst);
  const srcIsArray = Array.isArray(src);
  if (srcIsArray) return (dstIsArray ? dst : []).concat(src);

  if (dstIsArray) return mergeOne({}, src, shallow);

  const keys = Object.keys(src);
  if (!dst) dst = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const srcValue = src[key];
    if (srcValue === undefined) continue;

    dst[key] = shallow ? src[key] : mergeOne(dst[key], srcValue, shallow);
  }

  return dst;
}

function mergeFew(dst, srcs, shallow) {
  for (const src of srcs) dst = mergeOne(dst, src, shallow);
  return dst;
}

export function assign(dst, ...args) {
  return mergeFew(dst, args, true);
}

export function merge(dst, ...args) {
  return mergeFew(dst, args, false);
}
