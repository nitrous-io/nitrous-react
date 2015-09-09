import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class ImageActions {
  fetchAllByHostSlug(hostSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${hostSlug}/images`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'image.fetched-all-by-host-slug',
        hostSlug,
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.fetch-all-by-host-slug-failed',
        hostSlug,
        data: jqxhr
      });
    });
  }
}

export default new ImageActions();
