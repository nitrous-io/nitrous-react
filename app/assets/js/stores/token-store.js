import { EventEmitter } from 'events';
import dispatcher from 'app-dispatcher';

class TokenStore extends EventEmitter {
  _dispatchToken = null;
  _token = null;
  _lastError = null;

  constructor() {
    super();
    this._token = localStorage.getItem('token');
    this._dispatchToken = dispatcher.register((action) => {
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
      this.emit('change');
    });
  }

  get dispatchToken() {
    return this._dispatchToken;
  }

  get token() {
    return this._token;
  }

  get lastError() {
    return this._lastError;
  }
}

export default new TokenStore();
