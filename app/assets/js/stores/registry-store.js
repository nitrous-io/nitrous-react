import Store from 'stores/store';
import Registry from 'records/registry';
import { OrderedMap } from 'immutable';

class RegistryStore extends Store {
  _registries = OrderedMap();
  _registryUrlsByHostSlug = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'registry.fetched-all-by-host-slug': {
        const registries = OrderedMap(action.data.registries.map(function(d) {
          const r = Registry.deserialize(d);
          return [r.url, r];
        }));
        this._registries = this._registries.merge(registries);
        this._registryUrlsByHostSlug = this._registryUrlsByHostSlug.merge(OrderedMap({
          [action.hostSlug]: registries.keySeq().toOrderedSet() // list of keys == list of registry urls
        }));
        this._lastError = null;
        break;
      }
      case 'registry.fetch-all-by-host-slug-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get registries() {
    return this._registries;
  }

  registriesByHostSlug(hostSlug) {
    const registryUrls = this._registryUrlsByHostSlug.get(hostSlug);
    return registryUrls == null ? null : OrderedMap(registryUrls.map((url) => {
      return [url, this._registries.get(url)];
    }));
  }
}

export default new RegistryStore();
