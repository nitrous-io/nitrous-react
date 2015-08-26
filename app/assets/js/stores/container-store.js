import Store from 'stores/store';
import Container from 'records/container';
import { OrderedMap, Map, List } from 'immutable';

class ContainerStore extends Store {
  _containers = OrderedMap();
  _containersByHostSlug = Map();
  _sharedContainers = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'container.fetched-all-by-host-slug': {
        const containers = action.data.containers.map(function(d) {
          return Container.deserialize(d);
        });
        this._containers = this._containers.merge(OrderedMap(containers.map(function(c) {
          return [c.slug, c];
        })));
        this._containersByHostSlug = this._containersByHostSlug.merge(Map({
          [action.hostSlug]: List(containers)
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
      case 'container.fetch-all-by-host-slug-failed':
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

  get sharedContainers() {
    return this._sharedContainers;
  }

  containersByHostSlug(hostSlug) {
    const containers = this._containersByHostSlug.get(hostSlug);
    if (containers == null) { // if null or undefined
      return null;
    }
    return containers.filter(function(c) {
      return c.id && !c.terminatedAt && c.state !== 'terminated';
    });
  }
}

export default new ContainerStore();
