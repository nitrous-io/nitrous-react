import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class OrgMemberActions {
  fetchAllByOrgSlug(orgSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/orgs/${orgSlug}/members`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'org-member.fetched-all-by-org-slug',
        data: { data, orgSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org-member.fetch-all-by-org-slug-failed',
        data: { jqxhr, orgSlug }
      });
    });
    return promise;
  }
}

export default new OrgMemberActions();
