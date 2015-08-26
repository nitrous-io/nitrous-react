import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class ContainerActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/containers',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-all',
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-failed',
        data: jqxhr
      });
    });
  }

  fetchAllShared() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/shared_containers',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-all-shared',
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-shared-failed',
        data: jqxhr
      });
    });
  }
}

export default new ContainerActions();
