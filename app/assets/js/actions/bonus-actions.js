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

  connectTwitter() {
    const promise = authedAjax({
      type: 'POST',
      url: '/api/v0/twitter/connect'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus.connected-twitter',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus.connect-twitter-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  followTwitter() {
    const promise = authedAjax({
      type: 'POST',
      url: '/api/v0/twitter/follow'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'bonus.followed-twitter',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'bonus.follow-twitter-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new BonusActions();
