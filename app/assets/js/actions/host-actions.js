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

  fetchSubscriptionHosts(subscriptionSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/subscriptions/${subscriptionSlug}/hosts`,
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'host.fetched-sub-hosts',
        data: { data, subscriptionSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.fetch-sub-hosts-failed',
        data: { jqxhr, subscriptionSlug }
      });
    });
    return promise;
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

  terminate(hostSlug) {
    const promise = authedAjax({
      type: 'DELETE',
      url: `/api/v0/hosts/${hostSlug}`,
      dataType: 'json'
    }).then(() => {
      dispatcher.dispatch({
        type: 'host.terminated',
        data: { hostSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.terminate-failed',
        data: { jqxhr, hostSlug }
      });
    });
    return promise;
  }

  respec(hostSlug) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/respec`,
      dataType: 'json'
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.respec-failed',
        data: { jqxhr, hostSlug }
      });
    });
    return promise;
  }

  softRestart(hostSlug) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/hosts/${hostSlug}/soft_restart`,
      dataType: 'json'
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'host.soft-restart-failed',
        data: { jqxhr, hostSlug }
      });
    });
    return promise;
  }
}

export default new HostActions();
