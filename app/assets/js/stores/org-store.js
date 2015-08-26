import Store from 'stores/store';
import Org from 'records/org';
import { OrderedMap } from 'immutable';

class OrgStore extends Store {
  _orgs = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'org.fetched-all': {
        this._orgs = OrderedMap(action.data.orgs.map(function(d) {
          const o = Org.deserialize(d);
          return [o.slug, o];
        }));
        this._lastError = null;
        break;
      }
      case 'org.fetch-all-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get orgs() {
    return this._orgs;
  }
}

export default new OrgStore();
