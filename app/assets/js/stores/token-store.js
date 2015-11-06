import Store from 'stores/store';

class TokenStore extends Store {
  _token = null;

  constructor() {
    super();
    this._token = localStorage.getItem('token');
    this._invalidatedToken = null;
    this._transitioningToResendConfirmation = false;
  }

  handleAction(action) {
    switch (action.type) {
      case 'token.fetched': {
        const { data } = action.data;
        this._token = data.access_token;
        this._invalidatedToken = null;
        this._transitioningToResendConfirmation = false;
        this._lastError = null;
        localStorage.setItem('token', this._token);
        break;
      }
      case 'token.fetch-failed': {
        const { jqxhr } = action.data;
        this._token = null;
        this._lastError = jqxhr.errorMessage;
        break;
      }
      case 'token.invalidate': {
        // invalidate but store it for future use
        // e.g. confirmation resending
        if (this.token) {
          this._invalidatedToken = this.token;
          this._token = null;
        }
        localStorage.removeItem('token');
        this._lastError = null;

        // prevent multiple calls to this
        // causing multiple flows
        if (this._transitioningToResendConfirmation) {
          return;
        }

        let loc = '/#/login';
        if (action.data && action.data.type === 'confirmation_lapsed') {
          this._transitioningToResendConfirmation = true;
          loc = `/#/resend-confirmation`;
        }

        location.href = loc;
        return;
      }
      default: return;
    }
    this.notifyChange();
  }

  get token() {
    return this._token;
  }

  get invalidatedToken() {
    return this._invalidatedToken;
  }

  transitionedFromResendConfirmation() {
    this._transitioningToResendConfirmation = false;
  }
}

export default new TokenStore();
