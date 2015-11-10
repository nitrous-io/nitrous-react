import Store from 'stores/store';
import Subscription from 'records/subscription';
import hostStore from 'stores/host-store';
import { OrderedMap } from 'immutable';
import snackbarActions from 'actions/snackbar-actions';

class SubscriptionStore extends Store {
  _userSubscriptions = OrderedMap(); // <K: slug, V: Subscription>
  _orgSubscriptions = OrderedMap(); // <K: orgSlug, V: <K: slug, V: Subscription>

  handleAction(action) {
    switch (action.type) {
      case 'subscription.fetched-all': {
        const { data, orgSlug } = action.data;
        const subs = OrderedMap(data.subscriptions.map(function(d) {
          const s = Subscription.deserialize(d);
          return [s.slug, s];
        }));
        if (orgSlug) {
          this._orgSubscriptions = this._orgSubscriptions.set(orgSlug, subs);
        } else {
          this._userSubscriptions = subs;
        }
        this._lastError = null;
        break;
      }
      case 'subscription.fetch-all-failed': {
        const { orgSlug } = action.data;
        if (orgSlug) {
          this._orgSubscriptions.set(orgSlug, null);
        } else {
          this._userSubscriptions = null;
        }
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
      case 'events:subscription.updated': {
        const { data } = action;
        const sub = Subscription.deserialize(data.subscription);
        this._subscriptions = this._subscriptions.set(sub.slug, sub);
        this._lastError = null;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get userSubscriptions() {
    return this._userSubscriptions;
  }

  orgSubscriptionsBySlug(orgSlug) {
    return this._orgSubscriptions.get(orgSlug);
  }

  get activeUserSubscriptions() {
    return this._userSubscriptions.filter((s) => {
      return hostStore.liveHosts.has(s.hostSlug);
    });
  }

  get trialSubscription() {
    return this._userSubscriptions.find((s) => {
      return s.activeTrialEnd;
    });
  }

  findBySlug(slug) {
    return this._subscriptions.find((s) => {
      return s.slug === slug;
    });
  }
}

export default new SubscriptionStore();
