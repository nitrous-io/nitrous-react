import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class TemplateActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/templates',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'template.fetched-all',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'template.fetch-all-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new TemplateActions();
