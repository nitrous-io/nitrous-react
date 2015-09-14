import Store from 'stores/store';
import Container from 'records/container';
import { OrderedMap } from 'immutable';

class ContainerStore extends Store {
  _containers = OrderedMap();
  _containerSlugsByHostSlug = OrderedMap();
  _sharedContainers = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'container.fetched-all-by-host-slug': {
        const containers = OrderedMap(action.data.containers.map(function(d) {
          const c = Container.deserialize(d);
          return [c.slug, c];
        }));
        this._containers = this._containers.merge(containers);
        this._containerSlugsByHostSlug = this._containerSlugsByHostSlug.merge(OrderedMap({
          [action.hostSlug]: containers.keySeq().toList() // list of keys == list of container slugs
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
    const containerSlugs = this._containerSlugsByHostSlug.get(hostSlug);
    return containerSlugs == null ? null : OrderedMap(containerSlugs.map((slug) => {
      return [slug, this._containers.get(slug)];
    }));
  }

  liveContainersByHostSlug(hostSlug) {
    const containers = this.containersByHostSlug(hostSlug);
    return containers == null ? null : containers.filter(function(c) {
      return c.id && !c.terminatedAt && c.state !== 'terminated';
    });
  }
}

export default new ContainerStore();
