import dispatcher from 'app-dispatcher';
import { ajax } from 'lib/ajax';

class TokenActions {
  fetch(username, password) {
    return ajax({
      type: 'POST',
      url: '/api/v0/oauth/token',
      dataType: 'json',
      data: {
        grant_type: 'password',
        username,
        password
      }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'token.fetched',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'token.fetch-failed',
        data: { jqxhr }
      });
    });
  }

  invalidate() {
    dispatcher.dispatch({
      type: 'token.invalidate'
    });
  }

  setToken(token) {
    const data = { access_token: token };
    dispatcher.dispatch({
      type: 'token.fetched',
      data: { data }
    });
  }
}

export default new TokenActions();
