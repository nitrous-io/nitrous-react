import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class OrgActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/orgs',
      dataType: 'json'
    });
    promise.then((data) => {
      dispatcher.dispatch({
        type: 'org.fetched-all',
        data: { data }
      });

      const orgsBps = [];
      data.orgs.forEach(function(org) {
        if (org.billing_profile) {
          orgsBps.push(org.billing_profile);
        }
      });
      const bpData = { billing_profiles: orgsBps };
      dispatcher.dispatch({
        type: 'billing-profile.fetched-all-orgs',
        data: { data: bpData }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  create(options) {
    const { slug, name, email } = options;
    return authedAjax({
      type: 'POST',
      url: '/api/v0/orgs',
      dataType: 'json',
      data: { slug, name, email }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'org.created',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org.create-failed',
        data: { jqxhr, slug }
      });
    });
  }

  leave(orgSlug, member) {
    const promise = authedAjax({
      type: 'DELETE',
      url: `/api/v0/orgs/${orgSlug}/members/${member}`,
      dataType: 'json'
    }).then(() => {
      dispatcher.dispatch({
        type: 'org.left',
        data: { orgSlug, member }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org.leave-failed',
        data: { jqxhr, orgSlug, member }
      });
    });
    return promise;
  }
}

export default new OrgActions();
