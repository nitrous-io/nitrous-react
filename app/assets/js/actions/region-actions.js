import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class RegionActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/regions',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'region.fetched-all',
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'region.fetch-all-failed',
        data: jqxhr
      });
    });
  }
}

export default new RegionActions();
