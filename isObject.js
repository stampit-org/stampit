export default function isObject(obj) {
  var type = typeof obj;
  return !!obj && (type === 'object' || type === 'function');
}
