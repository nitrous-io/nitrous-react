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

  fetchAllUserEarnedBonuses() {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/user/earned_bonuses`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus.fetched-all-user-earned-bonuses',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus.fetch-all-user-earned-bonuses-failed',
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
