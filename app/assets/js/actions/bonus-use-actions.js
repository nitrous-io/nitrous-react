import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class BonusUseActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/user/bonus_uses`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus-use.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus-use.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new BonusUseActions();
