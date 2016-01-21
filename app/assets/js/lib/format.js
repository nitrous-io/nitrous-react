const format = {
  currency(val) {
    if (isNaN(val)) {
      return;
    }
    if (val < 0) {
      return '-$' + Math.abs(val).toFixed(2);
    }
    return '$' + val.toFixed(2);
  },

  currencyPreferWholeNum(val) {
    if (isNaN(val)) {
      return;
    }
    let sanitizedVal = val.toFixed(0);
    if (val % 1 !== 0) {
      sanitizedVal = val.toFixed(2);
    }
    return '$' + sanitizedVal;
  }
};

export default format;
