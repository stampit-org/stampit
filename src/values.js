export default Object.values ? Object.values : function values(obj) {
  return Object.keys(obj).map(k => obj[k]);
};
