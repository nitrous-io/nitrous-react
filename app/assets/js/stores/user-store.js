import Store from 'stores/store';
import User from 'records/user';
import UserProfile from 'records/user-profile';

class UserStore extends Store {
  _user = null; // <User>

  handleAction(action) {
    switch (action.type) {
      case 'user.fetched': {
        const { data } = action.data;
        this._user = User.deserialize(data.user);
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
      case 'user.github-connected': {
        const { redirect_url } = action.data.data;
        this.emit('github-connected', { redirectUrl: redirect_url });
        return;
      }
      case 'user.github-connect-failed': {
        this.emit('github-connect-failed');
        return;
      }
      case 'user.logged-in-via-github': {
        const { redirect_url } = action.data.data;
        this.emit('logged-in-via-github', { redirectUrl: redirect_url });
        return;
      }
      case 'user.log-in-via-github-failed': {
        this.emit('log-in-via-github-failed');
        return;
      }
      case 'user.signed-up-via-github': {
        const { redirect_url } = action.data.data;
        this.emit('signed-up-via-github', { redirectUrl: redirect_url });
        return;
      }
      case 'user.sign-up-via-github-failed': {
        this.emit('sign-up-via-github-failed');
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
      case 'user.can-delete': {
        this.emit('can-delete');
        return;
      }
      case 'user.cannot-delete': {
        const { jqxhr } = action.data,
              {responseJSON } = jqxhr;
        let errorMessage = jqxhr.errorMessage;

        if (responseJSON && responseJSON.error_description) {
          errorMessage = responseJSON.error_description;
        }
        this.emit('cannot-delete', { errorMessage });
        return;
      }
      case 'user.account-deleted': {
        this.emit('account-deleted');
        return;
      }
      case 'user.account-delete-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('account-delete-failed');
        return;
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
}

export default new UserStore();
