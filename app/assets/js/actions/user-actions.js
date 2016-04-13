import { ajax, authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class UserActions {
  fetch() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/user',
      dataType: 'json'
    });
    promise.then((data) => {
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
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.fetch-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  create(options) {
    const { username, signupEmail, password, gitHubUserName, promocodeSlug,
            inviteCode, captchaToken } = options;
    return ajax({
      type: 'POST',
      url: '/api/v0/users',
      data: { username, email: signupEmail, password, github_username: gitHubUserName, promo_code: promocodeSlug,
              invite_code: inviteCode, captcha_token: captchaToken }
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

  updateProfile(options) {
    return authedAjax({
      type: 'POST',
      url: '/api/v0/user/profile',
      data: options
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.profile-updated',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.profile-update-failed',
        data: { jqxhr }
      });
    });
  }

  connectToGitHub() {
    return authedAjax({
      type: 'POST',
      url: '/api/v0/github/authorize',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.github-connected',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.github-connect-failed',
        data: { jqxhr }
      });
    });
  }

  loginViaGithub() {
    return ajax({
      type: 'POST',
      url: '/api/v0/github/authorize_to_login',
      cache: false
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.logged-in-via-github',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.log-in-via-github-failed',
        data: { jqxhr }
      });
    });
  }

  signupViaGithub() {
    return ajax({
      type: 'POST',
      url: '/api/v0/github/authorize_to_signup',
      cache: false
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.signed-up-via-github',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.sign-up-via-github-failed',
        data: { jqxhr }
      });
    });
  }

  confirmEmail(token) {
    return ajax({
      type: 'POST',
      url: '/api/v0/user/confirm',
      cache: false,
      data: { token }
    });
  }

  resendConfirmation(options) {
    const { appToken, confirmationToken } = options;
    const params = {
      token: confirmationToken,
      app_token: appToken
    };
    return ajax({
      type: 'POST',
      url: '/api/v0/user/resend_confirm',
      cache: false,
      data: params
    });
  }

  dismissFirstTime() {
    return authedAjax({
      type: 'POST',
      url: '/api/v0/user/dismiss_first_time'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.dismissed-first-time',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.dismiss-first-time-failed',
        data: { jqxhr }
      });
    });
  }

  canDeleteAccount() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/user/can_delete'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.can-delete',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.cannot-delete',
        data: { jqxhr }
      });
    });
  }

  deleteUser() {
    const promise = authedAjax({
      type: 'DELETE',
      url: '/api/v0/user'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user.account-deleted',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user.account-delete-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new UserActions();
