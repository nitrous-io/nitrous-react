import Store from 'stores/store';
import Host from 'records/host';
import { OrderedMap } from 'immutable';
import taskActions from 'actions/task-actions';

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
        const { data, slug } = action.data,
              h = Host.deserialize(data.host);
        this._hosts = this._hosts.set(slug, h);
        this._lastError = null;
        break;
      }
      case 'host.fetch-all-failed':
      case 'host.fetch-one-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'host.create-initiated': {
        const { data } = action.data,
              host = Host.deserialize(data.host),
              { id } = data.host;
        taskActions.update(`host-create-${id}`, 'Creating workspace...');
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
        const { id } = action.data,
              progress = JSON.parse(action.data.progress);
        if (!id) {
          break;
        }

        let progressMessage = 'Creating workspace';
        if (progress.stream) {
          progressMessage += ` - ${progress.stream}`;
        }
        progressMessage += '...';

        taskActions.update(`host-create-${id}`, progressMessage);
        break;
      }
      case 'events:host.created': {
        const host = Host.deserialize(action.data.host),
              { id, slug } = host;
        this._hosts = this._hosts.set(slug, host);
        taskActions.done(`host-create-${id}`);
        this.emit('created', { host });
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
