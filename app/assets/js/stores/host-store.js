import { OrderedMap, OrderedSet } from 'immutable';

import Store from 'stores/store';
import Host from 'records/host';
import SubHost from 'records/sub-host';
import taskActions from 'actions/task-actions';
import snackbarActions from 'actions/snackbar-actions';

class HostStore extends Store {
  _hosts = OrderedMap(); // <K: HostSlug, V: Host>
  _subHosts = OrderedMap(); // <K: SubscriptionSlug, V: OrderedMap<K: HostSlug, V: Host>
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
      case 'host.fetched-sub-hosts': {
        const { data, subscriptionSlug } = action.data;

        const hosts = OrderedMap(data.hosts.map(function(d) {
          const h = SubHost.deserialize(d);
          return [h.slug, h];
        }));

        this._subHosts = this._subHosts.set(subscriptionSlug, hosts);
        this.emit('fetched-sub-hosts', { subscriptionSlug });
        break;
      }
      case 'host.terminated': {
        const { hostSlug } = action.data;
        this.emit('terminated', { hostSlug });
        return;
      }
      case 'host.terminate-failed': {
        const { hostSlug, jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('terminate-failed', { hostSlug });
        return;
      }
      case 'host.respec-failed': {
        const { jqxhr, hostSlug } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('respec_failed', { hostSlug });
        break;
      }
      case 'host.soft-restart-failed': {
        const { jqxhr, hostSlug } = action.data;
        this.handleErrorJqxhr(jqxhr);
        taskActions.fail(`host-soft-restart-${hostSlug}`);
        this.emit('soft-restart-failed', { hostSlug });
        break;
      }
      // from events-socket
      case 'events:host.soft-restarting': {
        const { host } = action.data;
        taskActions.update(`host-soft-restart-${host.slug}`, `Troubleshooting ${host.slug}...`);
        break;
      }
      case 'events:host.soft-restarted': {
        const { host } = action.data;
        taskActions.done(`host-soft-restart-${host.slug}`);
        this.emit('soft-restarted', { host });
        this._lastError = null;
        break;
      }
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
      case 'events:host.respeccing':
        const { host } = action.data;
        taskActions.update(`host-respec-${host.slug}`, `Workstation ${host.slug} upgrading...`);
        break;
      case 'events:host.respecced': {
        const { host } = action.data;
        snackbarActions.post(`Workstation ${host.slug} has been upgraded!`);
        taskActions.done(`host-respec-${host.slug}`);

        const h = Host.deserialize(action.data.host);
        this._hosts = this._hosts.set(h.slug, h);
        this._lastError = null;
        break;
      }
      case 'events:host.respec_failed': {
        const { host } = action.data;
        snackbarActions.post(`Failed to upgrade workstation ${host.slug}! Please contact support`);
        taskActions.fail(`host-respec-${host.slug}`);

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
      return !h.terminatedAt && !h.shared;
    });
  }

  get userHosts() {
    return this._hosts.filter((h) => {
      return !h.orgId && h.isActive && !h.shared;
    });
  }

  get orgHosts() {
    return this._hosts.filter((h) => {
      return h.orgId && h.isActive && !h.shared;
    });
  }

  hostsBySubSlug(subSlug) {
    return this._subHosts.get(subSlug) || OrderedMap();
  }

  hostsByOrgId(orgId) {
    return this._hosts.filter((h) => {
      return h.orgId === orgId && h.isActive && !h.shared;
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
