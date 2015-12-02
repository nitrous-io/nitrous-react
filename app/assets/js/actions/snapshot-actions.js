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
}

export default new SnapshotActions();
