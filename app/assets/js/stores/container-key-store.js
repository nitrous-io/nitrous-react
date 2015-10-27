import Store from 'stores/store';
import ContainerKey from 'records/container-key';
import { OrderedMap, OrderedSet } from 'immutable';

class ContainerKeyStore extends Store {
  _keysByContainerSlug = OrderedMap(); // <K: ContainerSlug, V: OrderedSet<ContainerKey>>

  handleAction(action) {
    switch (action.type) {
      case 'container-key.fetched-all-by-container-slug': {
        const { data, containerSlug } = action.data;

        const keys = OrderedSet(data.keys.map(function(d) {
          return ContainerKey.deserialize(d);
        }));

        this._keysByContainerSlug = this._keysByContainerSlug.set(containerSlug, keys);
        this._lastError = null;
        break;
      }
      case 'container-key.fetch-all-by-container-slug-failed': {
        const { jqxhr, containerSlug } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('fetch-failed', { containerSlug });
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  keysByContainerSlug(containerSlug) {
    return this._keysByContainerSlug.get(containerSlug);
  }
}

export default new ContainerKeyStore();
