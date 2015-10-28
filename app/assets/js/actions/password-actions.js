import { ajax } from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class PasswordActions {
  sendResetPassword(email) {
    return ajax({
      type: 'POST',
      url: '/api/v0/send_reset_password_token',
      dataType: 'json',
      data: { login: email }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'password.sent-reset',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'password.send-reset-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new PasswordActions();
