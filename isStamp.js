import isFunction from 'lodash/isFunction';

export default function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}
