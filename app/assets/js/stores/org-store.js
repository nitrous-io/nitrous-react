import Store from 'stores/store';
import userStore from 'stores/user-store';
import Org from 'records/org';
import OrgMember from 'records/org-member';
import { OrderedMap, OrderedSet } from 'immutable';

class OrgStore extends Store {
  _orgs = OrderedMap(); // <K: OrgSlug, V: Org>

  handleAction(action) {
    switch (action.type) {
      case 'org.fetched-all': {
        const { data } = action.data;
        this._orgs = OrderedMap(data.orgs.map(function(d) {
          const o = Org.deserialize(d);
          return [o.slug, o];
        }));
        this._lastError = null;
        break;
      }
      case 'org.fetch-all-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'org.fetched': {
        const { data } = action.data,
              org = Org.deserialize(data.org);
        this._orgs = this._orgs.set(org.slug, org);
        this._lastError = null;
        break;
      }
      case 'org.fetch-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'org.created': {
        const { data } = action.data,
              org = Org.deserialize(data.org);
        this._orgs = this._orgs.set(org.slug, org);
        this._lastError = null;
        break;
      }
      case 'org.create-failed': {
        const { slug, jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('create-failed', { slug, jqxhr });
        break;
      }
      case 'org.left': {
        const { orgSlug } = action.data;
        this._orgs = this._orgs.delete(orgSlug);
        this._lastError = null;
        break;
      }
      case 'org.leave-failed': {
        const { jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        break;
      }
      case 'events:org-member.removed': {
        const orgSlug = action.data.org_slug,
              username = action.data.username;

        if (!userStore.user || userStore.user.username !== username) {
          return;
        }

        this._orgs = this._orgs.delete(orgSlug);
        this._lastError = null;
        break;
      }
      case 'events:org-member.changed': {
        const orgSlug = action.data.org_slug,
              members = OrderedSet(action.data.members.map((d) => {
                return OrgMember.deserialize(d);
              }));

        const currentMember = members.find((m) => m.username === userStore.user.username);
        if (!currentMember) {
          return;
        }

        let org = this._orgs.get(orgSlug);
        if (!org) {
          // When the current user is added to an org, we emit an event
          // informing clients to explictly refresh org data.
          this.emit('refresh-required');
          return;
        }
        org = org.set('role', currentMember.role);

        this._orgs = this._orgs.set(orgSlug, org);
        this._lastError = null;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get orgs() {
    return this._orgs;
  }

  orgByOrgSlug(slug) {
    return this._orgs.find((org) => org.slug === slug);
  }

  orgByOrgId(id) {
    return this._orgs.find((org) => org.id === id);
  }
}

export default new OrgStore();
