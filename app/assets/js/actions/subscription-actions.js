import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class SubscriptionActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/subscriptions',
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'subscription.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  fetchAllByOrgSlug(orgSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/orgs/${orgSlug}/subscriptions`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'subscription.fetched-all',
        data: { data, orgSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.fetch-all-failed',
        data: { jqxhr, orgSlug }
      });
    });
    return promise;
  }

  cancel(slug) {
    const promise = authedAjax({
      type: 'DELETE',
      url: `/api/v0/subscriptions/${slug}/cancel`,
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'subscription.pending-cancel',
        data: { data, slug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.cancel-failed',
        data: { jqxhr, slug }
      });
    });
    return promise;
  }

  reactivate(slug) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/subscriptions/${slug}/reactivate`,
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'subscription.pending-reactivation',
        data: { data, slug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.reactivate-failed',
        data: { jqxhr, slug }
      });
    });
    return promise;
  }

  subscribeOrgPlan(orgSlug, planSlug) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/orgs/${orgSlug}/subscriptions`,
      dataType: 'json',
      data: { plan: planSlug }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'subscription.subscribed-org-plan',
        data: { data, orgSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.subscribe-org-plan-failed',
        data: { jqxhr, orgSlug }
      });
    });
    return promise;
  }


  upgrade(slug, plan) {
    const { id } = plan;
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/subscriptions/${slug}/upgrade`,
      dataType: 'json',
      data: { plan_id: id }
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'subscription.pending-upgrade',
        data: { data, slug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.upgrade-failed',
        data: { jqxhr, slug }
      });
    });
    return promise;
  }

  fetchUpgradeEstimate(slug, planId) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/subscriptions/${slug}/upgrade`,
      dataType: 'json',
      data: { plan_id: planId }
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'subscription.fetched-upgrade-estimate',
        data: { data, planId }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.fetch-upgrade-estimate-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }
}

export default new SubscriptionActions();
