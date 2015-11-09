import Store from 'stores/store';
import Subscription from 'records/subscription';
import { OrderedMap } from 'immutable';
import snackbarActions from 'actions/snackbar-actions';

class SubscriptionStore extends Store {
  _subscriptions = OrderedMap(); // <K: slug, V: Subscription>

  handleAction(action) {
    switch (action.type) {
      case 'subscription.fetched-all': {
        const { data } = action.data;
        this._subscriptions = OrderedMap(data.subscriptions.map(function(d) {
          const s = Subscription.deserialize(d);
          return [s.slug, s];
        }));
        this._lastError = null;
        break;
      }
      case 'subscription.fetch-all-failed': {
        this._subscriptions = null;
        this.handleErrorJqxhr(action.data.jqxhr);
        return; // do not notify of change
      }
      case 'subscription.canceled': {
        snackbarActions.post(`Subscription has been canceled.`);
        break;
      }
      case 'subscription.cancel-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        snackbarActions.post(`Failed to cancel subscription!`);
        break;
      }
      case 'subscription.reactivated': {
        snackbarActions.post(`Subscription has been reactivated.`);
        break;
      }
      case 'subscription.reactivate-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        snackbarActions.post(`Failed to reactivate subscription!`);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get subscriptions() {
    return this._subscriptions;
  }

  get trialSubscription() {
    return this._subscriptions.find((s) => {
      return s.activeTrialEnd;
    });
  }
}

export default new SubscriptionStore();
