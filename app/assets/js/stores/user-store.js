import Store from 'stores/store';
import User from 'records/user';
import UserProfile from 'records/user-profile';
import hostStore from 'stores/host-store';

class UserStore extends Store {
  _user = null; // <User>
  _usageRemaining = -1;
  _timer = null;

  handleAction(action) {
    switch (action.type) {
      case 'user.fetched': {
        const { data } = action.data;
        this._user = User.deserialize(data.user);
        this._usageRemaining = this._user.usageRemaining;
        this._tickUsageRemaining();
        this._lastError = null;
        break;
      }
      case 'user.fetch-failed': {
        this._user = null;
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'user.created': {
        const { data } = action.data,
              { username } = data.user;
        this._lastError = null;
        this.emit('created', { username });
        break;
      }
      case 'user.create-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('create-failed');
        break;
      }
      case 'user.updated': {
        const { data } = action.data;
        this._user = User.deserialize(data.user);
        this._lastError = null;
        break;
      }
      case 'user.update-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('update-failed');
        return;
      }
      case 'user.profile-updated': {
        const { data } = action.data;
        this._user = this._user.set('userProfile', UserProfile.deserialize(data.user_profile));
        this._lastError = null;
        break;
      }
      case 'user.profile-update-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('profile-update-failed');
        return;
      }
      case 'user.dismissed-first-time': {
        const { data } = action.data;
        this._user = User.deserialize(data.user);
        this._lastError = null;
        break;
      }
      case 'user.dismiss-first-time-failed': {
        // temporarily set firstTime value to prevent disruptive onboarding message.
        this._user = this._user.set('firstTime', false);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get user() {
    return this._user;
  }

  get userProfile() {
    if (this._user && this._user.userProfile) {
      return this._user.userProfile;
    }
    return null;
  }

  get advanced() {
    if (this.userProfile) {
      return !!this.userProfile.advanced;
    }
    return false;
  }

  get usageRemaining() {
    return this._usageRemaining;
  }

  _tickUsageRemaining() {
    if (this._usageRemaining <= 0) {
      clearTimeout(this._timer);
      return;
    }

    // Stop countdown when the free user host is stopped
    // Assume user only has 1 free host
    if (hostStore.stoppedFreeHosts.size !== 0) {
      return;
    }

    this._usageRemaining = this._usageRemaining - 1;
    this._timer = setTimeout(() => {
      this._tickUsageRemaining();
    }, 1000);

    this.emit('usage-remaining-tick');
  }
}

export default new UserStore();
