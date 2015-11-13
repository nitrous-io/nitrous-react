import Store from 'stores/store';
import Host from 'records/host';
import { OrderedMap, OrderedSet } from 'immutable';

class HostStore extends Store {
  _hosts = OrderedMap(); // <K: HostSlug, V: Host>
  _cancelledHosts = OrderedSet(); // <HostSlug>

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
      case 'host.start-failed': {
        const { jqxhr, hostSlug } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('start-failed', { hostSlug });
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
      case 'events:host.created':
      case 'events:host.starting':
      case 'events:host.started':
      case 'events:host.restarting':
      case 'events:host.restarted':
      case 'events:host.stopping':
      case 'events:host.stopped':
      case 'events:host.updated':
      case 'events:host.destroying': {
        const host = Host.deserialize(action.data.host);

        if (this._cancelledHosts.has(host.slug)) {
          break;
        }

        this._hosts = this._hosts.set(host.slug, host);

        if (action.type === 'events:host.created') {
          this.emit('created', { host });
        }

        if (action.type === 'events:host.started') {
          this.emit('started', { host });
        }

        break;
      }
      case 'events:host.create-failed': {
        const host = Host.deserialize(action.data.host);
        this._hosts = this._hosts.set(host.slug, host);
        this.emit('create-failed', { host });
        break;
      }
      case 'events:subscription.deleted': {
        const { data } = action,
              hostSlug = data.subscription && data.subscription.host_slug;
        if (hostSlug) {
          this._cancelledHosts = this._cancelledHosts.add(hostSlug);
          this._hosts = this._hosts.delete(hostSlug);
        }
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
      return !h.orgId && h.isActive;
    });
  }

  hostsByOrgId(orgId) {
    return this._hosts.filter((h) => {
      return h.orgId === orgId && h.isActive;
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
