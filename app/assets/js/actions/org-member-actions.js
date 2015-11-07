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

  /**
   * @param {string} orgSlug
   * @param {string} member The username or email of the member to add
   * @param {string} memberRole The role of the member in the org
   */
  add(orgSlug, member, memberRole) {
    const promise = authedAjax({
      type: 'PUT',
      url: `/api/v0/orgs/${orgSlug}/members/${member}`,
      dataType: 'json',
      data: { role: memberRole }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'org-member.added',
        data: { data, orgSlug, member }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org-member.add-failed',
        data: { jqxhr, orgSlug, member }
      });
    });
    return promise;
  }

  /**
   * @param {string} orgSlug
   * @param {string} member The username or email of the member to remove
   */
  remove(orgSlug, member) {
    const promise = authedAjax({
      type: 'DELETE',
      url: `/api/v0/orgs/${orgSlug}/members/${member}`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'org-member.removed',
        data: { data, orgSlug, member }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org-member.remove-failed',
        data: { jqxhr, orgSlug, member }
      });
    });
    return promise;
  }

  /**
   * @param {string} orgSlug
   * @param {string} member The username or email of the member to update
   * @param {string} memberRole The role of the member in the org
   */
  update(orgSlug, member, memberRole) {
    const promise = authedAjax({
      type: 'PUT',
      url: `/api/v0/orgs/${orgSlug}/members/${member}`,
      dataType: 'json',
      data: { role: memberRole }
    }).then((data) => {
      dispatcher.dispatch({
        type: 'org-member.updated',
        data: { data, orgSlug, member }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'org-member.update-failed',
        data: { jqxhr, orgSlug, member }
      });
    });
    return promise;
  }
}

export default new OrgMemberActions();
