import merge from './merge';
import isFunction from './is-function';
import isObject from './is-object';

export {isFunction};
export {isObject};

export const assign = Object.assign || function assign(to) {
  const args = arguments;
  for (let s = 1; s < args.length; s += 1) {
    const from = args[s];

    for (const key in Object.keys(from)) { // eslint-disable-line
      to[key] = from[key];
    }
  }

  return to;
};

export const isArray = Array.isArray;

export function isPlainObject(value) {
  return !!value && typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype;
}


const concat = Array.prototype.concat;
export function extractFunctions() {
  const fns = concat.apply([], arguments).filter(isFunction);
  return fns.length === 0 ? undefined : fns;
}

export function concatAssignFunctions(dstObject, srcArray, propName) {
  if (!isArray(srcArray)) return;

  const length = srcArray.length;
  const dstArray = dstObject[propName] || [];
  dstObject[propName] = dstArray;
  for (let i = 0; i < length; i += 1) {
    const fn = srcArray[i];
    if (isFunction(fn) && dstArray.indexOf(fn) < 0) {
      dstArray.push(fn);
    }
  }
}


function combineProperties(dstObject, srcObject, propName, action) {
  if (!isObject(srcObject[propName])) return;
  if (!isObject(dstObject[propName])) dstObject[propName] = {};
  action(dstObject[propName], srcObject[propName]);
}

export function deepMergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, merge);
}
export function mergeAssign(dstObject, srcObject, propName) {
  combineProperties(dstObject, srcObject, propName, assign);
}
