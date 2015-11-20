import Store from 'stores/store';
import Org from 'records/org';
import { OrderedMap } from 'immutable';

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
        this.emit('create-failed', { slug });
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
