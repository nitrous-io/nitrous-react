import { ajax, authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class UserActions {
  fetch() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/user',
      dataType: 'json'
    }).then((data) => {
      const bp = data.user.billing_profile;
      delete data.user.billing_profile;
      dispatcher.dispatch({
        type: 'user.fetched',
        data: { data }
      });

      const bpData = { billing_profile: bp };
      dispatcher.dispatch({
        type: 'billing-profile.fetched',
        data: { data: bpData }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.fetch-failed',
        data: { jqxhr }
      });
    });
  }

  create(options) {
    const { username, email, password } = options;
    return ajax({
      type: 'POST',
      url: '/api/v0/users',
      data: { username, email, password }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.created',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.create-failed',
        data: { jqxhr }
      });
    });
  }

  update(options) {
    const { name, email, password } = options;
    const params = {
      name,
      email,
      async: true
    };
    if (password) {
      params.password = password;
    }
    return authedAjax({
      type: 'PUT',
      url: '/api/v0/users',
      data: params
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.updated',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.update-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new UserActions();
