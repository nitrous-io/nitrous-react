import { OrderedMap, OrderedSet } from 'immutable';

import Store from 'stores/store';
import Snapshot from 'records/snapshot';

class SnapshotStore extends Store {
  _snapshotsByOrgSlug = OrderedMap() // <K: OrgSlug, V: OrderedSet<id>>

  handleAction(action) {
    switch (action.type) {
      case 'snapshot.fetched-all-by-org-slug': {
        const { data, orgSlug } = action.data;

        const snapshots = OrderedSet(data.snapshots.map(function(d) {
          return Snapshot.deserialize(d);
        }));

        const sorted = snapshots.sortBy((a) => a.createdAt).reverse();

        this._snapshotsByOrgSlug = this._snapshotsByOrgSlug.set(orgSlug, sorted);
        this._lastError = null;
        break;
      }
      case 'snapshot.fetch-all-by-org-slug-failed': {
        const { jqxhr, orgSlug } = action.data;
        this._lastError = jqxhr.errorMessage;
        this.emit('fetch-all-by-org-slug-failed', { orgSlug });
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  snapshotsByOrgSlug(orgSlug) {
    return this._snapshotsByOrgSlug.get(orgSlug);
  }
}

export default new SnapshotStore();
