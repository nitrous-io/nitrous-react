function notImplemented(feature, details) {
  /* eslint-disable no-alert, no-console */
  if (details) {
    console.log(`Not Implemented: ${feature} - ${details}`);
  }
  window.alert(`Not Implemented: ${feature}${details ? '\n\nSee console for details.' : ''}`);
  /* eslint-enable no-alert, no-console */
}

function notImplementedFn(feature, details) {
  return function() {
    notImplemented(feature, details);
  };
}

export default {
  notImplemented,
  notImplementedFn
};
