import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class RegistryActions {
  fetchAllByHostSlug(hostSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${hostSlug}/registries`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'registry.fetched-all-by-host-slug',
        hostSlug,
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'registry.fetch-all-by-host-slug-failed',
        hostSlug,
        data: jqxhr
      });
    });
  }
}

export default new RegistryActions();
