import Store from 'stores/store';
import Host from 'records/host';
import { OrderedMap } from 'immutable';

class HostStore extends Store {
  _hosts = OrderedMap(); // <K: HostSlug, V: Host>

  handleAction(action) {
    switch (action.type) {
      case 'host.fetched-all': {
        const { data } = action.data;
        this._hosts = OrderedMap(data.hosts.map(function(d) {
          const h = Host.deserialize(d);
          return [h.slug, h];
        }));
        this._lastError = null;
        break;
      }
      case 'host.fetched-one': {
        const { data } = action.data,
              h = Host.deserialize(data.host);
        this._hosts = this._hosts.set(h.slug, h);
        this._lastError = null;
        break;
      }
      case 'host.fetch-all-failed':
      case 'host.fetch-one-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'host.create-initiated': {
        const host = Host.deserialize(action.data.host);
        this._hosts = this._hosts.set(host.slug, host);
        this.emit('create-initiated', { host });
        break;
      }
      case 'host.create-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('create-failed');
        break;
      }
      // from events-socket
      case 'events:host.creating': {
        const { id, slug, progress } = action.data;
        if (!id || !slug || !progress) {
          return;
        }

        const progressObj = JSON.parse(action.data.progress),
              { stream } = progressObj;
        if (!stream) {
          return;
        }

        this.emit('creating', { hostSlug: slug, stream });
        break;
      }
      case 'events:host.created': {
        const host = Host.deserialize(action.data.host);
        this._hosts = this._hosts.set(host.slug, host);
        this.emit('created', { host });
        break;
      }
      case 'events:host.create-failed': {
        const host = Host.deserialize(action.data.host);
        this._hosts = this._hosts.set(host.slug, host);
        this.emit('create-failed', { host });
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

  hostByHostId(hostId) {
    return this._hosts.find((h) => {
      return h.id === hostId;
    });
  }

  hostSlugByHostId(hostId) {
    const host = this.hostByHostId(hostId);
    return host ? host.slug : null;
  }
}

export default new HostStore();
