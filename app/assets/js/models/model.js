export default class Model {
  setIfDefined(attrs) {
    const a = {};
    Object.keys(attrs).forEach(function(k) {
      const v = attrs[k];
      if (v !== undefined) {
        a[k] = v;
      }
    });
    Object.assign(this, a);
  }
}
