import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class CollaboratorActions {
  fetchAllByContainerSlug(containerSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${containerSlug}/collaborators`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'collaborator.fetched-all-by-container-slug',
        data: { data, containerSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'collaborator.fetch-all-by-container-slug-failed',
        data: { jqxhr }
      });
    });
  }

  /**
   * @param {Container} container
   * @param {string} collaborator The username or email of the collaborator to add
   */
  add(container, collaborator) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${container.slug}/collaborators`,
      data: { user: collaborator },
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'collaborator.added',
        data: { data, container, collaborator }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'collaborator.add-failed',
        data: { jqxhr, container, collaborator }
      });
    });
  }

  remove(container, collaboratorId) {
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/containers/${container.slug}/collaborators/${collaboratorId}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'collaborator.removed',
        data: { data, container, collaboratorId }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'collaborator.remove-failed',
        data: { jqxhr, container, collaboratorId }
      });
    });
  }
}

export default new CollaboratorActions();
