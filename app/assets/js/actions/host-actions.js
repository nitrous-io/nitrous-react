import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class HostActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/hosts',
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  /**
   * @param {string} identifier The host's slug or ID
   */
  fetchOne(identifier) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${identifier}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-one',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-one-failed',
        data: { jqxhr }
      });
    });
  }

  create(options) {
    const { name, org, plan, region } = options;
    const params = {
      async: true,
      name,
      size: plan && plan.slug,
      region: region.slug
    };
    if (org) {
      params.org = org.slug;
    }

    return authedAjax({
      type: 'POST',
      url: '/api/v0/hosts',
      data: params
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.create-initiated',
        data: { data, host: data.host }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.create-failed',
        data: { jqxhr }
      });
    });
  }

  fetchStats(hostSlug) {
    return authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${hostSlug}/stats`,
      data: { period: '1s' },
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-stats',
        data: { data, hostSlug }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-stats-failed',
        data: { jqxhr, hostSlug }
      });
    });
  }

  start(hostSlug) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/start`,
      dataType: 'json'
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.start-failed',
        data: { jqxhr, hostSlug }
      });
    });
    return promise;
  }
}

export default new HostActions();
