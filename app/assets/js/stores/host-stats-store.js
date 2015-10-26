import HostStats from 'records/host-stats';
import Store from 'stores/store';
import { OrderedMap } from 'immutable';

class HostStatsStore extends Store {
  _allStats = OrderedMap(); // <K: HostSlug, V: HostStats>

  handleAction(action) {
    switch (action.type) {
      case 'host.fetched-stats': {
        const { data, hostSlug } = action.data,
              hostStats = HostStats.deserialize(data.stats);
        this._allStats = this._allStats.set(hostSlug, hostStats);
        this._lastError = null;
        break;
      }
      case 'host.fetch-stats-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  hostStatsByHostSlug(slug) {
    return this._allStats.get(slug);
  }
}

export default new HostStatsStore();
