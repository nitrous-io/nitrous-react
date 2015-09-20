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
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-all-failed',
        data: { jqxhr }
      });
    });
  }

  fetchOne(slug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${slug}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-one',
        data: {
          data,
          slug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-one-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new HostActions();
