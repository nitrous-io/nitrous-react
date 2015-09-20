import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class OrgActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/orgs',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'org.fetched-all',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org.fetch-all-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new OrgActions();
