import Store from 'stores/store';
import Announcement from 'records/announcement';
import { OrderedMap, OrderedSet } from 'immutable';

class AnnouncementStore extends Store {
  _hostAnnouncementsByHostSlug = OrderedMap(); // <K: HostSlug, V: OrderedSet<Announcement>>

  handleAction(action) {
    switch (action.type) {
      case 'announcement.fetched-all-by-host-slug': {
        const { data, hostSlug } = action.data;

        const announcements = OrderedSet(data.announcements.map((d) => {
          return Announcement.deserialize(d);
        }));
        const sorted = announcements.sortBy((a) => a.createdAt).reverse();

        this._hostAnnouncementsByHostSlug = this._hostAnnouncementsByHostSlug.set(hostSlug, sorted);
        this._lastError = null;
        break;
      }
      case 'announcement.fetch-all-by-host-slug-failed': {
        const { jqxhr, hostSlug } = action.data;
        this._lastError = jqxhr.errorMessage;
        this.emit('fetch-all-by-host-slug-failed', { hostSlug });
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  announcementsByHostSlug(hostSlug) {
    return this._hostAnnouncementsByHostSlug.get(hostSlug);
  }
}

export default new AnnouncementStore();
