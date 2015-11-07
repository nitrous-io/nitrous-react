import Store from 'stores/store';
import ContainerKey from 'records/container-key';
import { OrderedMap, OrderedSet } from 'immutable';

class ContainerKeyStore extends Store {
  _keysByContainerSlug = OrderedMap(); // <K: ContainerSlug, V: OrderedSet<ContainerKey>>
  _keyAddedToGitHubByContainerSlug = OrderedMap(); // <K: ContainerSlug, V: bool>

  handleAction(action) {
    switch (action.type) {
      case 'container-key.fetched-all-by-container-slug': {
        const { data, containerSlug } = action.data;

        const keys = OrderedSet(data.keys.map((d) => {
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
      case 'container-key.fetched-status-by-container-slug': {
        const { data, containerSlug } = action.data;
        if (data.added_to_github) {
          this._keyAddedToGitHubByContainerSlug = this._keyAddedToGitHubByContainerSlug.set(containerSlug, true);
        }
        this.emit('fetched-status', { containerSlug });
        this._lastError = null;
        break;
      }
      case 'container-key.fetch-status-by-container-slug-failed': {
        const { containerSlug } = action.data;
        this.emit('fetch-status-failed', { containerSlug });
        break;
      }
      case 'container-key.added-to-github': {
        const { containerSlug } = action.data;
        this._keyAddedToGitHubByContainerSlug = this._keyAddedToGitHubByContainerSlug.set(containerSlug, true);
        this._lastError = null;
        break;
      }
      case 'container-key.add-to-github-failed': {
        const { jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        break;
      }
      case 'container-key.removed-from-github': {
        const { containerSlug } = action.data;
        this._keyAddedToGitHubByContainerSlug = this._keyAddedToGitHubByContainerSlug.set(containerSlug, false);
        this._lastError = null;
        break;
      }
      case 'container-key.remove-from-github-failed': {
        const { jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  keysByContainerSlug(containerSlug) {
    return this._keysByContainerSlug.get(containerSlug);
  }

  keyAddedToGitHubByContainerSlug(containerSlug) {
    return this._keyAddedToGitHubByContainerSlug.get(containerSlug);
  }
}

export default new ContainerKeyStore();
