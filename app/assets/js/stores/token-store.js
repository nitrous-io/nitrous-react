import Store from 'stores/store';

class TokenStore extends Store {
  _token = null;

  constructor() {
    super();
    this._token = localStorage.getItem('token');
  }

  handleAction(action) {
    switch (action.type) {
      case 'token.fetched': {
        this._token = action.data.access_token;
        this._lastError = null;
        localStorage.setItem('token', this._token);
        break;
      }
      case 'token.fetch-failed': {
        this._token = null;
        this._lastError = action.data.errorMessage;
        break;
      }
      case 'token.invalidate': {
        this._token = null;
        this._lastError = null;
        localStorage.removeItem('token');
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get token() {
    return this._token;
  }
}

export default new TokenStore();
