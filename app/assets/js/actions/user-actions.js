import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class UserActions {
  fetch() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/user',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.fetched',
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.fetch-failed',
        data: jqxhr
      });
    });
  }
}

export default new UserActions();
