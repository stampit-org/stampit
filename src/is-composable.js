import isFunction from 'lodash/lang/isFunction';

export default function(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}
