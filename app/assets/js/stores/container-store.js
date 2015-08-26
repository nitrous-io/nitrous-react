import Store from 'stores/store';
import Container from 'records/container';
import { OrderedMap } from 'immutable';

class ContainerStore extends Store {
  _containers = OrderedMap();
  _sharedContainers = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'container.fetched-all': {
        this._containers = OrderedMap(action.data.containers.map(function(d) {
          const c = Container.deserialize(d);
          return [c.slug, c];
        }));
        this._lastError = null;
        break;
      }
      case 'container.fetched-all-shared': {
        this._sharedContainers = OrderedMap(action.data.containers.map(function(d) {
          const c = Container.deserialize(d);
          return [c.slug, c];
        }));
        this._lastError = null;
        break;
      }
      case 'container.fetch-all-failed':
      case 'container.fetch-all-shared-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get containers() {
    return this._containers;
  }

  get usableContainers() {
    return this._containers.filter((c) => {
      return !c.id && !c.terminatedAt;
    });
  }

  get sharedContainers() {
    return this._sharedContainers;
  }
}

export default new ContainerStore();
