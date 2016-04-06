import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class ReferralcodeActions {
  fetch() {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/user/referral_code`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'referralcode.fetched',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'referralcode.fetch-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new ReferralcodeActions();
