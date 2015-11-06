import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class PlanActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/plans',
      dataType: 'json',
      data: {
        eligible: true
      }
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'plan.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'plan.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new PlanActions();
