import isFunction from './isFunction';

export default function extractFunctions() {
  const fns = [];

  for (let i = 0; i < arguments.length; i += 1) {
    const arg = arguments[i];

    if (isFunction(arg)) {
      fns.push(arg);
    } else if (Array.isArray(arg)) {
      fns.push(...(extractFunctions(...arg) || []));
    }
  }

  return fns.length === 0 ? undefined : fns;
}
