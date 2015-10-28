import Store from 'stores/store';
import Collaborator from 'records/collaborator';
import Container from 'records/container';
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
      case 'collaborator.add-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        const { container, collaborator } = action.data;
        this.emit('add-failed', { container, collaborator });
        break;
      }
      case 'collaborator.remove-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      // from events-socket
      case 'events:collaborator.added': {
        const { collaborator } = action.data,
              container = Container.deserialize(action.data.container),
              initiator = action.data.initiated_by;
        this.emit('added', {
          container,
          collaboratorUserId: (collaborator ? collaborator.id : null),
          collaboratorUsername: (collaborator ? collaborator.username : null),
          initiatorId: initiator.id,
          initiatorUsername: initiator.username
        });
        break;
      }
      case 'events:collaborator.removed': {
        const { collaborator } = action.data,
              container = Container.deserialize(action.data.container),
              initiator = action.data.initiated_by;
        this.emit('removed', {
          container,
          collaboratorUserId: (collaborator ? collaborator.id : null),
          collaboratorUsername: (collaborator ? collaborator.username : null),
          initiatorId: initiator.id,
          initiatorUsername: initiator.username
        });
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
