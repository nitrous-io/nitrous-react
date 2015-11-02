import Store from 'stores/store';
import Registry from 'records/registry';
import { OrderedMap, OrderedSet } from 'immutable';

class RegistryStore extends Store {
  _registries = OrderedMap(); // <K: Id (db), V: Registry>
  _registryIdsByHostSlug = OrderedMap(); // <K: HostSlug, V: OrderedSet<Id>>

  handleAction(action) {
    switch (action.type) {
      case 'registry.fetched-all-by-host-slug': {
        const { data, hostSlug } = action.data;

        const registries = OrderedMap(data.registries.map(function(d) {
          const r = Registry.deserialize(d);
          return [r.id, r];
        }));

        this._registries = this._registries.merge(registries);
        this._registryIdsByHostSlug = this._registryIdsByHostSlug.merge(OrderedMap({
          [hostSlug]: registries.keySeq().toOrderedSet() // list of keys == list of registry ids
        }));
        this._lastError = null;
        break;
      }
      case 'registry.fetch-all-by-host-slug-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'registry.logged-in': {
        const { data, hostSlug } = action.data,
              { registry } = data,
              r = Registry.deserialize(registry),
              existing = this._registryIdsByHostSlug.get(hostSlug);

        this._registries = this._registries.set(r.id, r);
        if (existing) {
          this._registryIdsByHostSlug = this._registryIdsByHostSlug.set(hostSlug, existing.merge([r.id]));
        } else {
          this._registryIdsByHostSlug = this._registryIdsByHostSlug.set(hostSlug, OrderedSet([r.id]));
        }
        this.emit('logged-in', { hostSlug });
        this._lastError = null;
        break;
      }
      case 'registry.login-failed': {
        const { hostSlug, jqxhr } = action.data;
        this.emit('login-failed', { hostSlug });
        this.handleErrorJqxhr(jqxhr);
        break;
      }
      case 'registry.logged-out': {
        const { hostSlug, id } = action.data,
              existing = this._registryIdsByHostSlug.get(hostSlug);

        this._registries = this._registries.delete(id);
        if (existing) {
          this._registryIdsByHostSlug = this._registryIdsByHostSlug.set(hostSlug, existing.delete(id));
        }
        this.emit('logged-out', { hostSlug });
        this._lastError = null;
        break;
      }
      case 'registry.logout-failed': {
        const { hostSlug, jqxhr } = action.data;
        this.emit('logout-failed', { hostSlug });
        this.handleErrorJqxhr(jqxhr);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get registries() {
    return this._registries;
  }

  registriesForHostSlug(hostSlug) {
    const registryIds = this._registryIdsByHostSlug.get(hostSlug);
    return registryIds == null ? null : registryIds.map((id) => {
      return this._registries.get(id);
    });
  }
}

export default new RegistryStore();
