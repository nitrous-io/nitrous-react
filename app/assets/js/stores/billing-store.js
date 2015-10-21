import Store from 'stores/store';
import BillingProfile from 'records/billing-profile';
import { OrderedMap } from 'immutable';

class BillingStore extends Store {
  _userBillingProfile = null; // <BillingProfile>
  _orgBillingProfiles = OrderedMap(); // <K: OrgID, V: BillingProfile>

  handleAction(action) {
    switch (action.type) {
      case 'billing-profile.fetched': {
        const { data } = action.data;
        const bp = BillingProfile.deserialize(data.billing_profile);
        this.assignBillingProfile(bp);
        this._lastError = null;
        break;
      }
      case 'billing-profile.fetch-failed': {
        this._billingProfile = null;
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'billing-profile.fetched-all': {
        const { data } = action.data;
        this._orgBillingProfiles = OrderedMap(data.billing_profiles.map(function(d) {
          const b = BillingProfile.deserialize(d);
          return [b.orgId, b];
        }));
        this._lastError = null;
        break;
      }
      case 'billing-profile.updated': {
        const { data } = action.data;
        const bp = BillingProfile.deserialize(data.billing_profile);
        this.assignBillingProfile(bp);
        this._lastError = null;
        break;
      }
      case 'billing-profile.update-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('update-failed');
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  assignBillingProfile = (bp) => {
    if (!bp.orgId) {
      this._userBillingProfile = bp;
      return;
    }

    this._orgBillingProfiles = this._orgBillingProfiles.set(bp.orgId, bp);
  }

  get userBillingProfile() {
    return this._userBillingProfile;
  }

  get orgBillingProfiles() {
    return this._orgBillingProfiles;
  }
}

export default new BillingStore();
