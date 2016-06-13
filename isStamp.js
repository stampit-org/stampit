import isFunction from './src/isFunction';

export default function isStamp(obj) {
  return isFunction(obj) && isFunction(obj.compose);
}
