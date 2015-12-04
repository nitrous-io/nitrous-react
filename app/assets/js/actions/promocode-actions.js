import { ajax, authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class PromocodeActions {
  fetchBySlug(slug) {
    const promise = ajax({
      type: 'GET',
      url: `/api/v0/subscriptions/promo_codes/${slug}`,
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'promocode.fetched',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'promocode.fetch-failed',
        data: { jqxhr, slug }
      });
    });
    return promise;
  }

  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/user/promo_codes`,
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'promocode.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'promocode.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new PromocodeActions();
