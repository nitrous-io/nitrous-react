import { OrderedMap } from 'immutable';

import Store from 'stores/store';
import Subscription from 'records/subscription';
import hostStore from 'stores/host-store';
import snackbarActions from 'actions/snackbar-actions';
import orgStore from 'stores/org-store';

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
        const { data } = action,
              sub = Subscription.deserialize(data.subscription);
        if (sub.orgId) {
          const org = orgStore.orgByOrgId(sub.orgId);
          if (org) {
            let subs = this._orgSubscriptions.get(org.slug);
            if (!subs) {
              subs = OrderedMap();
            }
            subs = subs.set(sub.slug, sub);
            this._orgSubscriptions = this._orgSubscriptions.set(org.slug, subs);
          }
        } else {
          this._userSubscriptions = this._userSubscriptions.set(sub.slug, sub);
        }
        this._lastError = null;
        break;
      }
      case 'events:subscription.deleted': {
        const { data } = action,
              sub = Subscription.deserialize(data.subscription);
        if (sub.orgId) {
          const org = orgStore.orgByOrgId(sub.orgId);
          if (org) {
            let subs = this._orgSubscriptions.get(org.slug);
            if (!subs) {
              subs = OrderedMap();
            }
            subs = subs.delete(sub.slug, sub);
            this._orgSubscriptions = this._orgSubscriptions.set(org.slug, subs);
          }
        } else {
          this._userSubscriptions = this._userSubscriptions.delete(sub.slug);
        }
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
    return this._userSubscriptions.find((s) => {
      return s.slug === slug;
    });
  }
}

export default new SubscriptionStore();
