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
  },

  usageRemaining(seconds) {
    switch (true) {
      case seconds === 1:
        return "1 second";
      case seconds < 60:
        return seconds + " seconds";
      case seconds < 60*2:
        return "1 minute";
      case seconds < 60*60:
        return Math.floor(seconds/60) + " minutes";
      case seconds < 60*60*2:
        return "1 hour";
      default:
        return Math.floor(seconds/60/60) + " hours";
    }
  }
};

export default format;
