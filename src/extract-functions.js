import isFunction from './isFunction';

export default function (...args) {
  let result = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (isFunction(arg)) result.push(arg);
    else if (Array.isArray(arg)) result = result.concat(arg.filter(isFunction));
  }
  return result.length === 0 ? undefined : result;
}
