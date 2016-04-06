import Store from 'stores/store';
import Referralcode from 'records/referralcode';

class ReferralcodeStore extends Store {
  _referralcode = null; // <Referralcode>

  handleAction(action) {
    switch (action.type) {
      case 'referralcode.fetched': {
        const { data } = action.data;
        this._referralcode = Referralcode.deserialize(data.referral_code);
        this._lastError = null;
        break;
      }
      case 'referralcode.fetch-failed': {
        break;
      }
      
      default: return;
    }
    this.notifyChange();
  }

  get referralcode() {
    return this._referralcode;
  }

}

export default new ReferralcodeStore();
