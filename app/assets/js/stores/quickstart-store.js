import Store from 'stores/store';
import Quickstart from 'records/quickstart';

class QuickstartStore extends Store {
  handleAction(action) {
    switch (action.type) {
      case 'quickstart.fetched-repo-info': {
        const { data, requestId } = action.data,
              quickstart = Quickstart.deserialize(data.quickstart);
        this.emit('fetched-repo-info', { quickstart, requestId });
        break;
      }
      case 'quickstart.fetch-repo-info-failed': {
        const { jqxhr, requestId } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('fetch-repo-info-failed', { requestId });
        return;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new QuickstartStore();
