import Store from 'stores/store';
import Host from 'records/host';
import { OrderedMap } from 'immutable';

class HostStore extends Store {
  _hosts = null;

  handleAction(action) {
    switch (action.type) {
      case 'host.fetched-all': {
        this._hosts = OrderedMap(action.data.hosts.map(function(d) {
          const h = Host.deserialize(d);
          return [h.slug, h];
        }));
        this._lastError = null;
        break;
      }
      case 'host.fetch-all-failed': {
        this._lastError = action.data.errorMessage;
      }
      default: return;
    }
    this.notifyChange();
  }

  get hosts() {
    return this._hosts;
  }

  get userHosts() {
    if (this._hosts == null) {
      return;
    }
    return this._hosts.filter((h) => {
      return !h.orgId && !h.terminatedAt;
    });
  }

  get orgHosts() {
    if (this._hosts == null) {
      return;
    }
    return this._hosts.filter((h) => {
      return h.orgId && !h.terminatedAt;
    });
  }
}

export default new HostStore();
