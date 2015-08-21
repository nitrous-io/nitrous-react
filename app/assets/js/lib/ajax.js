import $ from 'jquery';
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
  return ajax(options);
}

export default {
  ajax,
  authedAjax
};
