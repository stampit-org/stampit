export default Object.values ? Object.values : function (obj) {
  return Object.keys(obj).map(k => obj[k]);
};
