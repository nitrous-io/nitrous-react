import Store from 'stores/store';
import CustomDomain from 'records/custom-domain';

import { OrderedMap, OrderedSet } from 'immutable';

class CustomDomainStore extends Store {
  _customDomainsByContainerSlug = OrderedMap(); // <K: ContainerSlug, V: OrderedSet<CustomDomain>>

  handleAction(action) {
    switch (action.type) {
      case 'custom-domain.fetched-all-by-container-slug': {
        const { data, containerSlug } = action.data;

        const customDomains = OrderedSet(data.custom_domains.map(function(d) {
          return CustomDomain.deserialize(d);
        }));

        this._customDomainsByContainerSlug = this._customDomainsByContainerSlug.set(containerSlug, customDomains);
        break;
      }
      case 'custom-domain.added': {
        this.emit('added');
        break;
      }
      case 'custom-domain.add-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('add-failed');
        break;
      }
      case 'custom-domain.deleted': {
        this.emit('deleted');
        break;
      }
      case 'custom-domain.delete-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      default: return;
    }

    this.notifyChange();
  }

  customDomainsByContainerSlug(containerSlug) {
    return this._customDomainsByContainerSlug.get(containerSlug);
  }
}

export default new CustomDomainStore();
