import isFunction from 'lodash/isFunction';

export default function(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}
