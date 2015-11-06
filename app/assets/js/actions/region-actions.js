import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class RegionActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/regions',
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'region.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'region.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new RegionActions();
