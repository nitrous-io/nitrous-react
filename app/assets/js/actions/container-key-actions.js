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
}

export default new ContainerKeyActions();
