import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';
import ContainerCreation from 'lib/container-creation';

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
        data: {
          data,
          hostSlug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-by-host-slug-failed',
        data: {
          jqxhr,
          hostSlug
        }
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
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-shared-failed',
        data: { jqxhr }
      });
    });
  }

  fetchOne(slug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${slug}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-one',
        data: {
          data,
          slug
        }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-one-failed',
        data: { jqxhr }
      });
    });
  }

  fetchConfig(slug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/containers/${slug}/config`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-config',
        data: { data, slug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-config-failed',
        data: { jqxhr, slug }
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
        data: {
          jqxhr,
          containerSlug: container.slug
        }
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
        type: 'container.terminate-failed',
        data: {
          jqxhr,
          containerSlug: container.slug
        }
      });
    });
  }

  create(name, imageRepo, template, host, updateImage, privileged, publishAll) {
    const containerCreation = new ContainerCreation(
      name, imageRepo, template, host, updateImage, privileged, publishAll
    );
    return containerCreation.begin();
  }
}

export default new ContainerActions();
