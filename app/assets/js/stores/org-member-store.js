import Store from 'stores/store';
import OrgMember from 'records/org-member';
import { OrderedMap, OrderedSet } from 'immutable';

class OrgMemberStore extends Store {
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND';

  _membersByOrgSlug = OrderedMap(); // <K: OrgSlug, V: OrderedSet<OrgMember>>

  handleAction(action) {
    switch (action.type) {
      case 'org-member.fetched-all-by-org-slug': {
        const { data, orgSlug } = action.data;

        const members = OrderedSet(data.members.map((d) => {
          return OrgMember.deserialize(d);
        }));

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
      case 'org-member.added':
      case 'org-member.removed':
      case 'org-member.updated': {
        const { data, orgSlug } = action.data;

        // The action creator for this dispatched payload sends the new list of
        // all members (instead of just the added/removed/updated member).
        const members = OrderedSet(data.members.map((d) => {
          return OrgMember.deserialize(d);
        }));

        this._membersByOrgSlug = this._membersByOrgSlug.set(orgSlug, members);
        this._lastError = null;
        break;
      }
      case 'org-member.add-failed':
      case 'org-member.remove-failed':
      case 'org-member.update-failed': {
        const { jqxhr, orgSlug, member } = action.data;

        let errorMessage = this._lastError = jqxhr.errorMessage;
        switch (jqxhr.status) {
          case 404: {
            // The API returns a 404 with an error message that is not helpful
            // to users when the member does not exist on Nitrous.
            errorMessage = this.MEMBER_NOT_FOUND;
            break;
          }
        }

        let event = 'add-failed';
        if (action.type === 'org-member.remove-failed') {
          event = 'remove-failed';
        } else if (action.type === 'org-member.update-failed') {
          event = 'update-failed';
        }
        this.emit(event, { orgSlug, member, errorMessage });
        break;
      }
      case 'events:org-member.changed': {
        const orgSlug = action.data.org_slug,
              members = OrderedSet(action.data.members.map((d) => {
                return OrgMember.deserialize(d);
              }));

        this._membersByOrgSlug = this._membersByOrgSlug.set(orgSlug, members);
        this._lastError = null;
        break;
      }
      case 'events:org-member.removed': {
        const orgSlug = action.data.org_slug,
              username = action.data.username;

        let members = this._membersByOrgSlug.get(orgSlug);
        if (members == null) {
          break;
        }

        members = this._membersByOrgSlug.get(orgSlug).filter((m) => m.username !== username);

        this._membersByOrgSlug = this._membersByOrgSlug.set(orgSlug, members);
        this._lastError = null;
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
