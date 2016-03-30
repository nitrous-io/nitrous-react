import { authedAjax }  from 'lib/ajax';
import ContainerRunCommandSocket from 'lib/container-run-command-socket';
import dispatcher from 'app-dispatcher';

class ContainerActions {
  fetchAllByHostSlug(hostSlug) {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/containers',
      dataType: 'json',
      data: { host: hostSlug }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.fetched-all-by-host-slug',
        data: { data, hostSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.fetch-all-by-host-slug-failed',
        data: { jqxhr, hostSlug }
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
        data: { data, slug }
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
        data: { jqxhr, containerSlug: container.slug }
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
        data: { jqxhr, containerSlug: container.slug }
      });
    });
  }

  reconfigure(container, newConfig) {
    const formData = newConfig.toFormData();
    formData.async = true;

    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${container.slug}/reconfig`,
      dataType: 'json',
      data: formData
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.reconfigure-failed',
        data: { jqxhr, containerSlug: container.slug }
      });
    });
  }

  commit(containerSlug, name) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${containerSlug}/commit`,
      dataType: 'json',
      data: { name }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.committed',
        data: { data, containerSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.commit-failed',
        data: { jqxhr, containerSlug }
      });
    });
  }

  createAtomic(name, host, opts) {
    const { imageRepo, template, snapshotId,
      privileged, ports, publishAll, skipPull, repo } = opts;

    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/containers/create_atomic`,
      data: {
        name,
        host: host.slug,
        image: imageRepo,
        template,
        snapshot_id: snapshotId,
        privileged,
        port: ports,
        publish_all: publishAll,
        skip_pull: skipPull,
        repo
      },
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'container.creating',
        data: { data, name, hostSlug: host.slug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.create-failed',
        data: { jqxhr, name, hostSlug: host.slug }
      });
    });
    return promise;
  }

  runCommand(host, container, command, timeout, requestId) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/containers/${container.slug}/token`,
      data: { permission: ['run_command'] },
      dataType: 'json'
    }).then((data) => {
      const socket = new ContainerRunCommandSocket(data.token, requestId);
      socket.connect(host, container, command, timeout);
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'container.run-command-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new ContainerActions();
