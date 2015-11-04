import Store from 'stores/store';
import { List } from 'immutable';
import Notification from 'lib/snackbar-notification';

class SnackbarStore extends Store {
  _notifications = List(); // <Notification>

  handleAction(action) {
    switch (action.type) {
      case 'snackbar.post': {
        const { content, kind } = action.data;
        this._notifications = this._notifications.push(new Notification(content, kind));
        break;
      }
      case 'snackbar.remove': {
        const { id } = action.data;
        this._notifications = this._notifications.filter((n) => {
          return n.id !== id;
        });
        break;
      }
      case 'snackbar.clear': {
        this._notifications = List();
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get notifications() {
    return this._notifications;
  }
}

export default new SnackbarStore();
