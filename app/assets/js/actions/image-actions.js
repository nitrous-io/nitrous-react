import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class ImageActions {
  fetchAllByHostSlug(hostSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${hostSlug}/images`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'image.fetched-all-by-host-slug',
        data: { data, hostSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.fetch-all-by-host-slug-failed',
        data: { jqxhr, hostSlug }
      });
    });
    return promise;
  }

  pull(hostSlug, repository, update) {
    let id;
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/images/pull`,
      dataType: 'json',
      data: {
        repository,
        update,
        async: true
      }
    }).then((data) => {
      id = data.image.id;
      dispatcher.dispatch({
        type: 'image.pull-initiated',
        data: {
          data,
          hostSlug,
          repository,
          id
        }
      });
      return id;
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.pull-failed',
        data: {
          jqxhr,
          hostSlug,
          repository,
          id
        }
      });
    });
    return promise;
  }

  push(hostSlug, id, repository) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/images/${id}/push`,
      dataType: 'json',
      data: {
        repository,
        async: true
      }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'image.push-initiated',
        data: {
          data,
          hostSlug,
          id,
          repository
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.push-failed',
        data: {
          jqxhr,
          hostSlug,
          id,
          repository
        }
      });
    });
  }

  remove(hostSlug, id) {
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/hosts/${hostSlug}/images/${id}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'image.removed',
        data: {
          data,
          hostSlug,
          id
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'image.remove-failed',
        data: {
          jqxhr,
          hostSlug,
          id
        }
      });
    });
  }
}

export default new ImageActions();
