import $ from 'jquery';
import dispatcher from 'app-dispatcher';
import tokenStore from 'stores/token-store';

function ajax(options={}) {
  return new Promise(function(resolve, reject) {
    $.ajax(options).then(function(data) {
      resolve(data);
    }, function(jqxhr) {
      let m;
      const j = jqxhr.responseJSON;
      if (j) {
        m = j.error_description || j.error;
      }
      m = m || `${jqxhr.status} ${jqxhr.statusText || 'unknown error'}`;
      jqxhr.errorMessage = m;
      reject(jqxhr);
    });
  });
}

function authedAjax(options={}) {
  options = Object.assign({}, options);
  options.headers = options.headers || {};
  options.headers.Authorization = `Bearer ${tokenStore.token}`;
  const promise = ajax(options);
  promise.catch((jqxhr) => {
    const { responseJSON } = jqxhr;
    if (responseJSON && responseJSON.error === 'confirmation_lapsed') {
      dispatcher.dispatch({
        type: 'token.invalidate',
        data: { type: 'confirmation_lapsed' }
      });
      return;
    }

    if (jqxhr.status === 401) {
      dispatcher.dispatch({
        type: 'token.invalidate'
      });
    }
  });
  return promise;
}

export default {
  ajax,
  authedAjax
};
