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
        data: {
          data,
          hostSlug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.fetch-all-by-host-slug-failed',
        data: {
          jqxhr,
          hostSlug
        }
      });
    });
  }

  pull(hostSlug, imageRepo, update) {
    let imageId;
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/images/pull`,
      dataType: 'json',
      data: {
        repository: imageRepo,
        update,
        async: true
      }
    }).then((data) => {
      imageId = data.image.id;
      dispatcher.dispatch({
        type: 'image.pull-initiated',
        data: {
          data,
          hostSlug,
          imageRepo,
          imageId
        }
      });
      return imageId;
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.pull-failed',
        data: {
          jqxhr
        }
      });
    });
    return promise;
  }
}

export default new ImageActions();
