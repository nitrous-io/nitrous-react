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
  },

  nextUsageQuota(nextUsageQuotaAt) {
    if (!(nextUsageQuotaAt instanceof Date)) {
      return null;
    }
    const unixNow = (new Date()).valueOf(),
          unixNext = nextUsageQuotaAt.valueOf();
    if (unixNow > unixNext) {
      // swallow unexpected result (next restore is in the past)
      return null;
    }
    const diff = (unixNext - unixNow) / 1000; // seconds
    switch (true) {
      // we want to *overstate* the amount of time the user has to wait, so use
      // Math.ceil when rounding below
      case diff < 60*60:
        return "1 hour";
      case diff < 23*60*60: // so we never return '24 hours'
        return Math.ceil(diff/60/60) + " hours";
      case diff <= 24*60*60:
        return "1 day";
      default:
        return Math.ceil(diff/24/60/60) + " days";
    }
  },

  convertSecondsToHours(seconds) {
    return (seconds / 60 / 60).toFixed(0);
  }
};

export default format;
