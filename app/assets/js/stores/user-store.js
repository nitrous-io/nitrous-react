import { EventEmitter } from 'events';
import dispatcher from 'app-dispatcher';
import User from 'records/user';

class UserStore extends EventEmitter {
  _dispatchToken = null;
  _user = null;
  _lastError = null;

  constructor() {
    super();
    this._dispatchToken = dispatcher.register((action) => {
      switch (action.type) {
        case 'user.fetched': {
          this._user = User.deserialize(action.data.user);
          this._lastError = null;
          break;
        }
        case 'user.fetch-failed': {
          this._user = null;
          this._lastError = action.data.errorMessage;
        }
        default: return;
      }
      this.emit('change');
    });
  }

  get dispatchToken() {
    return this._dispatchToken;
  }

  get user() {
    return this._user;
  }

  get lastError() {
    return this._lastError;
  }
}

export default new UserStore();
