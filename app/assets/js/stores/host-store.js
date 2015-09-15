import Store from 'stores/store';
import Host from 'records/host';
import { OrderedMap } from 'immutable';

class HostStore extends Store {
  _hosts = OrderedMap();

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
      case 'host.fetched-one': {
        const h = Host.deserialize(action.data.host);
        this._hosts = this._hosts.set(h.slug, h);
        this._lastError = null;
        break;
      }
      case 'host.fetch-all-failed':
      case 'host.fetch-one-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get hosts() {
    return this._hosts;
  }

  get liveHosts() {
    return this._hosts.filter((h) => {
      return !h.terminatedAt;
    });
  }

  get userHosts() {
    return this._hosts.filter((h) => {
      return !h.orgId && !h.terminatedAt && h.state !== 'terminated';
    });
  }

  hostsByOrgId(orgId) {
    return this._hosts.filter((h) => {
      return h.orgId === orgId && !h.terminatedAt && h.state !== 'terminated';
    });
  }

  hostSlugByHostId(hostId) {
    const host = this._hosts.find((h) => {
      return h.id === hostId;
    });
    return host ? host.slug : null;
  }
}

export default new HostStore();
