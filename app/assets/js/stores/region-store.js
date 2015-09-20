import Store from 'stores/store';
import Region from 'records/region';
import { OrderedMap } from 'immutable';

class RegionStore extends Store {
  _regions = OrderedMap(); // <K: RegionSlug, V: Region>

  handleAction(action) {
    switch (action.type) {
      case 'region.fetched-all': {
        const { data } = action.data;
        this._regions = OrderedMap(data.regions.map(function(d) {
          const r = Region.deserialize(d);
          return [r.slug, r];
        }));
        this._lastError = null;
        break;
      }
      case 'region.fetch-all-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
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
