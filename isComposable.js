module.exports = function isComposable(obj) {
  var type = typeof obj;
  return !!obj && (type === 'object' || type === 'function');
};
