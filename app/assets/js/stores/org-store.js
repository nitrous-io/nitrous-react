import Store from 'stores/store';
import Org from 'records/org';
import { OrderedMap } from 'immutable';

class OrgStore extends Store {
  _orgs = OrderedMap(); // <K: OrgSlug, V: Org>

  handleAction(action) {
    switch (action.type) {
      case 'org.fetched-all': {
        const { data } = action.data;
        this._orgs = OrderedMap(data.orgs.map(function(d) {
          const o = Org.deserialize(d);
          return [o.slug, o];
        }));
        this._lastError = null;
        break;
      }
      case 'org.fetch-all-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
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
