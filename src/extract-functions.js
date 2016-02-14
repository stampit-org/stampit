import isFunction from 'lodash/isFunction';
import forEach from 'lodash/forEach';

export default function(...args) {
  const result = [];
  if (isFunction(args[0])) {
    forEach(args, fn => { // assuming all the arguments are functions
      if (isFunction(fn)) {
        result.push(fn);
      }
    });
  } else if (args.length > 0) {
    forEach(args, obj => {
      forEach(obj, fn => {
        if (isFunction(fn)) {
          result.push(fn);
        }
      });
    });
  } else {
    return undefined;
  }
  return result.length === 0 ? undefined : result;
}
