import { OrderedMap, OrderedSet } from 'immutable';

import taskActions from 'actions/task-actions';
import Store from 'stores/store';
import Snapshot from 'records/snapshot';
import Mp from 'lib/mp';

class SnapshotStore extends Store {
  _snapshotsByOrgSlug = OrderedMap() // <K: OrgSlug, V: OrderedSet<Snapshot>>

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
      case 'snapshot.publishing': {
        const { orgSlug, hostId, imageId } = action.data;
        this.emit('publishing', { orgSlug, hostId, imageId });

        taskActions.update(`snapshot-publishing-${imageId}`, `Publishing snapshot`);
        break;
      }
      case 'snapshot.publish-failed': {
        const { jqxhr, orgSlug, hostId, imageId } = action.data;
        this._lastError = jqxhr.errorMessage;
        this.emit('publish-failed', { orgSlug, hostId, imageId });

        taskActions.fail(`snapshot-publishing-${imageId}`);
        break;
      }
      case 'snapshot.deleted': {
        const { orgSlug, snapshotId } = action.data;

        let snapshots = this._snapshotsByOrgSlug.get(orgSlug) || OrderedSet();
        snapshots = snapshots.filter((a) => a.id !== snapshotId);
        const sorted = snapshots.sortBy((a) => a.createdAt).reverse();

        this._snapshotsByOrgSlug = this._snapshotsByOrgSlug.set(orgSlug, sorted);
        this._lastError = null;
        this.emit('deleted', { orgSlug, snapshotId });
        break;
      }
      case 'snapshot.delete-failed': {
        const { jqxhr, orgSlug, snapshotId } = action.data;
        this._lastError = jqxhr.errorMessage;
        this.emit('delete-failed', { orgSlug, snapshotId });
        break;
      }
      case 'events:snapshot.published': {
        const snapshot = Snapshot.deserialize(action.data.snapshot),
              orgSlug = action.data.org_slug;

        const snapshots = (this._snapshotsByOrgSlug.get(orgSlug) || OrderedSet()).add(snapshot);
        const sorted = snapshots.sortBy((a) => a.createdAt).reverse();

        this._snapshotsByOrgSlug = this._snapshotsByOrgSlug.set(orgSlug, sorted);
        this._lastError = null;
        this.emit('published', { snapshot });

        taskActions.done(`snapshot-publishing-${snapshot.imageId}`);
        Mp.increment('snapshots-published');
        break;
      }
      case 'events:snapshot.publish-failed': {
        const orgSlug = action.data.org_slug,
              hostId = action.data.host_id,
              imageId = action.data.image_id,
              error = action.data.error;
        this._lastError = error;
        this.emit('publish-failed', { orgSlug, hostId, imageId });
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
