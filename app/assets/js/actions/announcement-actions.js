import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class AnnouncementActions {
  fetchAllByHostSlug(hostSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${hostSlug}/announcements`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'announcement.fetched-all-by-host-slug',
        data: { data, hostSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'announcement.fetch-all-by-host-slug-failed',
        data: { jqxhr, hostSlug }
      });
    });
    return promise;
  }
}

export default new AnnouncementActions();
