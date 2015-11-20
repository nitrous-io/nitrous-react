import { OrderedMap } from 'immutable';

import Store from 'stores/store';
import Subscription from 'records/subscription';
import hostStore from 'stores/host-store';
import snackbarActions from 'actions/snackbar-actions';
import orgStore from 'stores/org-store';

class SubscriptionStore extends Store {
  _userSubscriptions = OrderedMap(); // <K: slug, V: Subscription>
  _orgSubscriptions = OrderedMap(); // <K: orgSlug, V: <K: slug, V: Subscription>

  // To store states for frontend (e.g. canceling/reactivating),
  // only works when states are mutually exclusive
  _pendingStates = OrderedMap(); // <K: slug, V: string>

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
      case 'subscription.pending-cancel': {
        this._setPendingState(action.data.slug, 'canceling');
        break;
      }
      case 'subscription.cancel-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this._setPendingState(action.data.slug);
        snackbarActions.post('Failed to cancel subscription!');
        break;
      }
      case 'subscription.pending-reactivation': {
        this._setPendingState(action.data.slug, 'reactivating');
        break;
      }
      case 'subscription.reactivate-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this._setPendingState(action.data.slug);
        snackbarActions.post('Failed to reactivate subscription!');
        break;
      }
      case 'subscription.subscribed-org-plan': {
        const { data, orgSlug } = action.data,
              s = Subscription.deserialize(data.subscription);

        if (orgSlug) {
          let subs = this._orgSubscriptions.get(orgSlug);
          if (!subs) {
            subs = new OrderedMap();
          }
          this._orgSubscriptions = this._orgSubscriptions.set(orgSlug, subs.set(s.slug, s));
        } else {
          this._userSubscriptions = this._userSubscriptions.set(s.slug, s);
        }
        this._lastError = null;
        this.emit('subscribed-org-plan', { orgSlug });
        return;
      }
      case 'subscription.subscribe-org-plan-failed': {
        const { jqxhr, orgSlug } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('subscribe-org-plan-failed', { orgSlug });
        return;
      }
      case 'events:subscription.updated': {
        const { data } = action,
              sub = Subscription.deserialize(data.subscription),
              pendingState = this.getPendingState(sub.slug);

        if (pendingState === 'canceling') {
          snackbarActions.post('Subscription has been canceled.');
        } else if (pendingState === 'reactivating') {
          snackbarActions.post('Subscription has been reactivated.');
        }

        this._setPendingState(sub.slug);

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
              sub = Subscription.deserialize(data.subscription),
              pendingState = this.getPendingState(sub.slug);

        if (pendingState === 'canceling') {
          snackbarActions.post('Subscription has been canceled.');
        }

        this._setPendingState(sub.slug);

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

  _setPendingState(slug, state) {
    if (state) {
      this._pendingStates = this._pendingStates.set(slug, state);
    } else {
      this._pendingStates = this._pendingStates.delete(slug);
    }
  }

  getPendingState(slug) {
    return this._pendingStates.get(slug);
  }
}

export default new SubscriptionStore();
