import isObject from './isObject';

export default function merge(dst, src, shallow = false) {
  const bObject = isObject(src);
  if (!bObject) return src; // not a POJO, array, or function

  const aArray = Array.isArray(dst);
  const bArray = Array.isArray(src);
  if (bArray) return (aArray ? dst : []).concat(src);

  if (aArray) return merge({}, src, shallow);

  const keys = Object.keys(src);
  if (!dst) dst = {};

  let key, srcValue;
  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    srcValue = src[key];
    if (srcValue === undefined) continue;

    dst[key] = shallow ? src[key] : merge(dst[key], srcValue, shallow);
  }

  return dst;
};
