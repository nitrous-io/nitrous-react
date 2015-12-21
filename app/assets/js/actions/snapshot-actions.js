import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class SnapshotActions {
  fetchAllByOrgSlug(orgSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/orgs/${orgSlug}/snapshots`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'snapshot.fetched-all-by-org-slug',
        data: { data, orgSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'snapshot.fetch-all-by-org-slug-failed',
        data: { jqxhr, orgSlug }
      });
    });
    return promise;
  }

  publish(orgSlug, hostId, imageId) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/orgs/${orgSlug}/snapshots/publish`,
      data: {
        host_id: hostId,
        image_id: imageId
      },
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'snapshot.publishing',
        data: { data, orgSlug, hostId, imageId }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'snapshot.publish-failed',
        data: { jqxhr, orgSlug, hostId, imageId }
      });
    });
    return promise;
  }

  delete(orgSlug, snapshotId) {
    const promise = authedAjax({
      type: 'DELETE',
      url: `/api/v0/orgs/${orgSlug}/snapshots/${snapshotId}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'snapshot.deleted',
        data: { data, orgSlug, snapshotId }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'snapshot.delete-failed',
        data: { jqxhr, orgSlug, snapshotId }
      });
    });
    return promise;
  }
}

export default new SnapshotActions();
