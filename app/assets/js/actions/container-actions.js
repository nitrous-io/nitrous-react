import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class ContainerActions {
  fetchAllByHostSlug(hostSlug) {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/containers',
      dataType: 'json',
      data: {
        host: hostSlug
      }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-all-by-host-slug',
        hostSlug,
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-by-host-slug-failed',
        hostSlug,
        data: jqxhr
      });
    });
  }

  fetchAllShared() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/shared_containers',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-all-shared',
        data
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-shared-failed',
        data: jqxhr
      });
    });
  }

  postAction(container, action) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${container.slug}/${action}`,
      dataType: 'json'
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: `container.${action}-failed`,
        containerSlug: container.slug,
        data: jqxhr
      });
    });
  }

  start(container) {
    return this.postAction(container, 'start');
  }

  stop(container) {
    return this.postAction(container, 'stop');
  }

  restart(container) {
    return this.postAction(container, 'restart');
  }

  terminate(container) {
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/containers/${container.slug}`,
      dataType: 'json'
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: `container.terminate-failed`,
        containerSlug: container.slug,
        data: jqxhr
      });
    });
  }
}

export default new ContainerActions();
