import Store from 'stores/store';
import User from 'records/user';

class UserStore extends Store {
  _user = null;

  handleAction(action) {
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
    this.notifyChange();
  }

  get user() {
    return this._user;
  }
}

export default new UserStore();
