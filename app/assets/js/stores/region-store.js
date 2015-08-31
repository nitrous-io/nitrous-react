import Store from 'stores/store';
import Region from 'records/region';
import { OrderedMap } from 'immutable';

class RegionStore extends Store {
  _regions = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'region.fetched-all': {
        this._regions = OrderedMap(action.data.regions.map(function(d) {
          const r = Region.deserialize(d);
          return [r.slug, r];
        }));
        this._lastError = null;
        break;
      }
      case 'region.fetch-all-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get regions() {
    return this._regions;
  }
}

export default new RegionStore();
