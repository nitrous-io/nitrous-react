import Store from 'stores/store';
import OrgMember from 'records/org-member';
import { OrderedMap, OrderedSet } from 'immutable';

class OrgMemberStore extends Store {
  _membersByOrgSlug = OrderedMap(); // <K: OrgSlug, V: OrderedSet<OrgMember>>

  handleAction(action) {
    switch (action.type) {
      case 'org-member.fetched-all-by-org-slug': {
        const { data, orgSlug } = action.data;

        const members = OrderedSet(data.members.map((d) => {
          return OrgMember.deserialize(d);
        }))

        this._membersByOrgSlug = this._membersByOrgSlug.set(orgSlug, members);
        this._lastError = null;
        break;
      }
      case 'org-member.fetch-all-by-org-slug-failed': {
        const { jqxhr, orgSlug } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('fetch-failed', { orgSlug });
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  orgMembersByOrgSlug(slug) {
    return this._membersByOrgSlug.get(slug);
  }
}

export default new OrgMemberStore();
