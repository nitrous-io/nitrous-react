import Store from 'stores/store';
import OrgMember from 'records/org-member';
import Collaborator from 'records/collaborator';

class PendingMemberStore extends Store {
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

        this.emit('fetched', { member, code });
        this._lastError = null;
        break;
      }
      case 'pending-member.fetch-failed': {
        const { code } = action.data;
        // We display our own error message if code is invalid instead of reflecting the error msg from the backend
        this.emit('fetch-failed', { code });
        break;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new PendingMemberStore();
