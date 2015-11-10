import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class SubscriptionActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/subscriptions',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'subscription.fetched-all',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.fetch-all-failed',
        data: { jqxhr }
      });
    });
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
    return authedAjax({
      type: 'DELETE',
      url: `/api/v0/subscriptions/${slug}/cancel`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'subscription.canceled',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.cancel-failed',
        data: { jqxhr }
      });
    });
  }

  reactivate(slug) {
    return authedAjax({
      type: 'POST',
      url: `/api/v0/subscriptions/${slug}/reactivate`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'subscription.reactivated',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'subscription.reactivate-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new SubscriptionActions();
