import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class ContainerKeyActions {
  fetchAllByContainerSlug(containerSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${containerSlug}/container_keys`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container-key.fetched-all-by-container-slug',
        data: { data, containerSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container-key.fetch-all-by-container-slug-failed',
        data: { jqxhr, containerSlug }
      });
    });
  }

  // Gets status of container keys for a container, e.g. whether the key has
  // been added to GitHub.
  fetchStatusByContainerSlug(containerSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${containerSlug}/container_keys/status`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container-key.fetched-status-by-container-slug',
        data: { data, containerSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container-key.fetch-status-by-container-slug-failed',
        data: { jqxhr, containerSlug }
      });
    });
  }

  addToGitHub(containerSlug) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${containerSlug}/container_keys/github`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container-key.added-to-github',
        data: { data, containerSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container-key.add-to-github-failed',
        data: { jqxhr, containerSlug }
      });
    });
  }

  removeFromGitHub(containerSlug) {
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/containers/${containerSlug}/container_keys/github`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container-key.removed-from-github',
        data: { data, containerSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container-key.remove-from-github-failed',
        data: { jqxhr, containerSlug }
      });
    });
  }
}

export default new ContainerKeyActions();
