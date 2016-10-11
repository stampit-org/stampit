import isFunction from './isFunction';

const concat = Array.prototype.concat;
export default function () {
  const fns = concat.apply([], arguments).filter(isFunction);
  return fns.length === 0 ? undefined : fns;
}
