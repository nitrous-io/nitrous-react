import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class OrgActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/orgs',
      dataType: 'json'
    }).then((data) => {
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
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org.fetch-all-failed',
        data: { jqxhr }
      });
    });
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
}

export default new OrgActions();
