import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class HostActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/hosts',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-all',
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-all-failed',
        data: jqxhr
      });
    });
  }
}

export default new HostActions();
