import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class BonusActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/bonuses`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  fetchAllBonusUses() {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/user/bonus_uses`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus.fetched-all-bonus-uses',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus.fetch-all-bonus-uses-failed',
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
        type: 'bonus.earned-bonus',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus.earn-bonus-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new BonusActions();
