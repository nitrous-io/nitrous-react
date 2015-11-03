import ContainerConfig from 'records/container-config';
import Store from 'stores/store';
import { OrderedMap } from 'immutable';

class ContainerConfigStore extends Store {
  _allConfigs = OrderedMap(); // <K: ContainerSlug, V: ContainerConfig>

  handleAction(action) {
    switch (action.type) {
      case 'container.fetched-config': {
        const { data, slug } = action.data,
              containerConfig = ContainerConfig.deserialize(data.config);
        this._allConfigs = this._allConfigs.set(slug, containerConfig);
        this._lastError = null;
        break;
      }
      case 'container.fetch-config-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  containerConfigByContainerSlug(slug) {
    return this._allConfigs.get(slug);
  }
}

export default new ContainerConfigStore();
