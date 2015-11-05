import Store from 'stores/store';
import Container from 'records/container';
import ContainerConfig from 'records/container-config';
import { OrderedMap, OrderedSet } from 'immutable';
import snackbarActions from 'actions/snackbar-actions';
import hostStore from 'stores/host-store';

class ContainerStore extends Store {
  _containers = OrderedMap(); // <K: ContainerSlug, V: Container>
  _containerSlugsByHostSlug = OrderedMap(); // <K: HostSlug, V: OrderedSet<ContainerSlug>>
  _sharedContainerSlugs = OrderedSet(); // <ContainerSlug>

  handleAction(action) {
    switch (action.type) {
      // use curly braces to ensure each case has its own let/const variable scope
      case 'container.fetched-all-by-host-slug': {
        const { data, hostSlug } = action.data;
        // deserialize containers
        const containers = OrderedMap(data.containers.map(function(d) {
          const c = Container.deserialize(d);
          return [c.slug, c];
        }));
        // merge the newly fetched containers with global container map
        this._containers = this._containers.merge(containers);
        // update the host -> containers mapping. use slugs instead of Record objects to ensure
        // that there is only one Record object that represents a model object
        this._containerSlugsByHostSlug = this._containerSlugsByHostSlug.merge(OrderedMap({
          [hostSlug]: containers.keySeq().toOrderedSet() // list of keys == list of container slugs
        }));
        this._lastError = null;
        break;
      }
      case 'container.fetched-all-shared': {
        const { data } = action.data;
        // deserialize containers
        const containers = OrderedMap(data.containers.map(function(d) {
          const c = Container.deserialize(d);
          return [c.slug, c];
        }));
        // merge the newly fetched containers with global container map
        this._containers = this._containers.merge(containers);
        // update shared containers set
        this._sharedContainerSlugs = containers.map(function(c) {
          return c.slug;
        });
        this._lastError = null;
        break;
      }
      case 'container.fetched-one': {
        const { data, slug } = action.data,
              c = Container.deserialize(data.container);
        this._containers = this._containers.set(slug, c);
        this._lastError = null;
        break;
      }
      case 'container.fetch-all-by-host-slug-failed':
      case 'container.fetch-all-shared-failed':
      case 'container.fetched-one-failed':
      case 'container.start-failed':
      case 'container.stop-failed':
      case 'container.restart-failed':
      case 'container.terminate-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'container.create-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        const { name, hostSlug } = action.data;
        snackbarActions.post(`Failed to create project “${name}”!`);
        this.emit('create-failed', { name, hostSlug });
        break;
      }
      case 'container.reconfigure-failed': {
        const { containerSlug, jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('reconfigure-failed', { containerSlug });
        break;
      }
      // from events-socket
      case 'events:container.reconfigured': {
        const { config, container } = action.data,
              c = Container.deserialize(container),
              containerConfig = ContainerConfig.deserialize(config);
        this.emit('reconfigured', { container: c, containerConfig });
        break;
      }
      case 'events:container.reconfigure-failed': {
        const { container, error } = action.data,
              c = Container.deserialize(container);

        this._containers = this._containers.set(c.slug, c);

        if (error) {
          if (error.includes('freighter')) {
            snackbarActions.post(`Failed to reconfigure “${c.displayName}”!`);
          } else {
            snackbarActions.post(error);
          }
        }
        this.emit('reconfigure-failed', { containerSlug: c.slug });
        break;
      }
      case 'events:container.starting':
      case 'events:container.started':
      case 'events:container.stopping':
      case 'events:container.stopped':
      case 'events:container.restarting':
      case 'events:container.restarted':
      case 'events:container.created':
      case 'events:container.destroying':
      case 'events:container.destroyed':
      case 'events:container.reconfiguring': {
        const c = Container.deserialize(action.data.container);

        // replace the old container object in the global container map with newly updated object
        this._containers = this._containers.set(c.slug, c);

        // if the container belongs to a known host, make sure its slug is added to the set of
        // containers for the host, so that the UI can be updated if it is a new container
        const hostSlug = hostStore.hostSlugByHostId(c.hostId);
        if (hostSlug) {
          const set = (this._containerSlugsByHostSlug.get(hostSlug) || OrderedSet()).add(c.slug);
          this._containerSlugsByHostSlug = this._containerSlugsByHostSlug.set(hostSlug, set);
        }

        if (action.type === 'events:container.created') {
          snackbarActions.post(`Your project “${c.displayName}” was created successfully.`);
          this.emit('created', { container: c, hostSlug });
        }

        if (action.type === 'events:container.destroyed') {
          snackbarActions.post(`Your project “${c.displayName}” was terminated successfully.`);
        }
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
    return this._sharedContainerSlugs.map((slug) => {
      return this._containers.get(slug);
    });
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

  containerBySlug(slug) {
    return this._containers.get(slug);
  }
}

export default new ContainerStore();
