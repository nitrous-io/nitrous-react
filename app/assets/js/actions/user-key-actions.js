import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class UserKeyActions {
  fetchAllByContainerSlug(containerSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${containerSlug}/keys`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user-key.fetched-all-by-container-slug',
        data: {
          data,
          containerSlug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user-key.fetch-all-by-container-slug-failed',
        data: { jqxhr }
      });
    });
  }

  /**
   * @param {Container} container
   * @param {string} key The public key to register with the container
   */
  register(container, key) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${container.slug}/keys`,
      dataType: 'json',
      data: { key }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user-key.created',
        data: {
          data,
          container,
          key
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user-key.create-failed',
        data: {
          jqxhr,
          container,
          key
        }
      });
    });
  }

  delete(container, userKey) {
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/containers/${container.slug}/keys/${window.encodeURIComponent(userKey.fingerprint)}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'user-key.deleted',
        data: {
          data,
          container,
          userKey
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'user-key.delete-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new UserKeyActions();
