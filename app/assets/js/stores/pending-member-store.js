import { OrderedMap } from 'immutable';
import Store from 'stores/store';
import OrgMember from 'records/org-member';
import Collaborator from 'records/collaborator';

class PendingMemberStore extends Store {
  _pendingMembers = OrderedMap(); // <K: InviteCode, V: Member>, Member: OrgMember or Collaborator

  handleAction(action) {
    switch (action.type) {
      case 'pending-member.fetched': {
        const { data, code } = action.data;

        let member = null;
        if (data.type === 'org') {
          member = OrgMember.deserialize(data.member);
        } else if (data.type === 'collab') {
          member = Collaborator.deserialize(data.member);
        }
        this._pendingMembers = this._pendingMembers.set(code, member);

        this._lastError = null;
        break;
      }
      case 'pending-member.fetch-failed': {
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  pendingMemberByInviteCode(code) {
    return this._pendingMembers.get(code);
  }
}

export default new PendingMemberStore();
