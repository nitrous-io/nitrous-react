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

  earnBonus(action) {
    const promise = authedAjax({
      type: 'POST',
      url: '/api/v0/user/bonus',
      data: { action }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus-use.earned-bonus',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus-use.earn-bonus-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new BonusUseActions();
