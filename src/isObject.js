export default function isObject(obj) {
  const type = typeof obj;
  return !!obj && (type === 'object' || type === 'function');
}
