import Store from 'stores/store';
import Collaborator from 'records/collaborator';
import { OrderedMap, OrderedSet } from 'immutable';

class CollaboratorStore extends Store {
  _collaboratorsByContainerSlug = OrderedMap(); // <K: ContainerSlug, V: OrderedSet<Collaborator>>

  handleAction(action) {
    switch (action.type) {
      case 'collaborator.fetched-all-by-container-slug': {
        const { data, containerSlug } = action.data;

        const collaborators = OrderedSet(data.collaborators.map(function(d) {
          return Collaborator.deserialize(d);
        }));

        this._collaboratorsByContainerSlug = this._collaboratorsByContainerSlug.set(containerSlug, collaborators);
        this._lastError = null;
        break;
      }
      case 'collaborator.fetch-all-by-container-slug-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'collaborator.added': {
        const { container, collaborator } = action.data;
        // Note that we do not get the full Collaborator object, so we emit an
        // 'added' event to notify subscribers (who will then decide whether
        // to re-fetch data).
        this.emit('added', { container, collaborator });
        this._lastError = null;
        break;
      }
      case 'collaborator.add-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        const { container, collaborator } = action.data;
        this.emit('add-failed', { container, collaborator });
        break;
      }
      case 'collaborator.removed': {
        const { container, collaboratorId } = action.data;

        let collaborators = this._collaboratorsByContainerSlug.get(container.slug);
        collaborators = collaborators.filterNot((c) => {
          return c.id === collaboratorId;
        });

        this._collaboratorsByContainerSlug = this._collaboratorsByContainerSlug.set(container.slug, collaborators);

        this._lastError = null;
        break;
      }
      case 'collaborator.remove-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  collaboratorsByContainerSlug(containerSlug) {
    return this._collaboratorsByContainerSlug.get(containerSlug);
  }
}

export default new CollaboratorStore();
