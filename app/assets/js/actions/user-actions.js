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
    const { username, email, password, gitHubUserName } = options;
    return ajax({
      type: 'POST',
      url: '/api/v0/users',
      data: { username, email, password, github_username: gitHubUserName }
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
    const { name, email, password, existingPassword } = options;
    const params = {
      name,
      email,
      async: true
    };
    if (password) {
      params.password = password;
    }
    if (existingPassword) {
      params.existing_password = existingPassword;
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

  connectToGitHub() {
    return authedAjax({
      type: 'POST',
      url: '/api/v0/github/authorize',
      dataType: 'json',
      data: { beta: true }
    });
  }

  loginViaGithub() {
    return ajax({
      type: 'POST',
      url: '/api/v0/github/authorize_to_login',
      cache: false,
      data: { beta: true }
    });
  }

  signupViaGithub() {
    return ajax({
      type: 'POST',
      url: '/api/v0/github/authorize_to_signup',
      cache: false,
      data: { beta: true }
    });
  }
}

export default new UserActions();
