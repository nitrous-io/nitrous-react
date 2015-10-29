import Store from 'stores/store';

class PasswordStore extends Store {
  _sendResetSucceeded = false;
  _resetSucceeded = false;

  handleAction(action) {
    switch (action.type) {
      case 'password.sent-reset': {
        this._sendResetSucceeded = true;
        this._lastError = null;
        break;
      }
      case 'password.send-reset-failed': {
        const { jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.sendResetSucceeded = false;
        break;
      }
      case 'password.reset': {
        this._resetSucceeded = true;
        this._lastError = null;
        break;
      }
      case 'password.reset-failed': {
        const { jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this._resetSucceeded = false;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get sendResetSucceeded() {
    return this._sendResetSucceeded;
  }

  get resetSucceeded() {
    return this._resetSucceeded;
  }
}

export default new PasswordStore();
