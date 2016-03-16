import Store from 'stores/store';
import Quickstart from 'records/quickstart';

class QuickstartStore extends Store {
  handleAction(action) {
    switch (action.type) {
      case 'quickstart.fetched-repo-info': {
        const { data } = action.data,
              quickstart = Quickstart.deserialize(data.quickstart);
        this.emit('fetched-repo-info', { quickstart });
        break;
      }
      case 'quickstart.fetch-repo-info-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('fetch-repo-info-failed');
        return;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new QuickstartStore();
