import Store from 'stores/store';
import Registry from 'records/registry';
import { OrderedMap, Map } from 'immutable';

class RegistryStore extends Store {
  _registries = OrderedMap();
  _registriesByHostSlug = Map();

  handleAction(action) {
    switch (action.type) {
      case 'registry.fetched-all-by-host-slug': {
        const registries = OrderedMap(action.data.registries.map(function(d) {
          const r = Registry.deserialize(d);
          return [r.url, r];
        }));
        this._registries = this._registries.merge(registries);
        this._registriesByHostSlug = this._registriesByHostSlug.merge(Map({
          [action.hostSlug]: registries
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
    return this._registriesByHostSlug.get(hostSlug);
  }
}

export default new RegistryStore();
