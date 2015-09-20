import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class PlanActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/plans',
      dataType: 'json',
      data: {
        eligible: true
      }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'plan.fetched-all',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'plan.fetch-all-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new PlanActions();
