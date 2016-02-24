import Store from 'stores/store';
import Hack from 'records/hack';

class HackStore extends Store {
  handleAction(action) {
    switch (action.type) {
      case 'hack.fetched-repo-info': {
        const { data } = action.data,
              hack = Hack.deserialize(data.hack);
        this.emit('fetched-repo-info', { hack });
        break;
      }
      case 'hack.fetch-repo-info-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        return;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new HackStore();
