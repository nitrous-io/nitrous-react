import Store from 'stores/store';
import UserKey from 'records/user-key';
import { OrderedMap, OrderedSet } from 'immutable';

class UserKeyStore extends Store {
  _keysByContainerSlug = OrderedMap(); // <K: ContainerSlug, V: OrderedSet<UserKey>>

  handleAction(action) {
    switch (action.type) {
      case 'user-key.fetched-all-by-container-slug': {
        const { data, containerSlug } = action.data;

        const keys = OrderedSet(data.keys.map(function(d) {
          return UserKey.deserialize(d);
        }));

        this._keysByContainerSlug = this._keysByContainerSlug.set(containerSlug, keys);
        this._lastError = null;
        break;
      }
      case 'user-key.fetch-all-by-container-slug-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'user-key.created': {
        const { container, key } = action.data;
        // Note that we do not get the full UserKey object, so we emit a
        // 'created' event to notify subscribers (who will then decide whether
        // to re-fetch the keys).
        this.emit('created', { container, key });
        this._lastError = null;
        break;
      }
      case 'user-key.create-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        const { container, key } = action.data;
        this.emit('create-failed', { container, key });
        break;
      }
      case 'user-key.deleted': {
        const { container, userKey } = action.data;

        let keySet = this._keysByContainerSlug.get(container.slug);
        keySet = keySet.delete(userKey);

        this._keysByContainerSlug = this._keysByContainerSlug.set(container.slug, keySet);
        this._lastError = null;

        this.emit('deleted', { container, userKey });
        break;
      }
      case 'user-key.delete-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
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

export default new UserKeyStore();
