import { Record } from 'immutable';
import md5 from 'md5';

import Plan from 'records/plan';

export default class Org extends Record({
  id: null,
  slug: null,
  email: null,
  name: null,
  maxHosts: null,
  role: null,
  multiHost: false,
  usedHosts: null,
  plan: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(o) {
    return new this({
      id: o.id,
      slug: o.slug,
      email: o.email,
      name: o.name,
      maxHosts: o.max_hosts,
      usedHosts: o.used_hosts,
      role: o.role,
      multiHost: o.multi_host,
      plan: o.plan && Plan.deserialize(o.plan),
      createdAt: o.created_at ? new Date(o.created_at) : null,
      updatedAt: o.updated_at ? new Date(o.updated_at) : null
    });
  }

  gravatar(size=40) {
    if (this.email) {
      return `https://secure.gravatar.com/avatar/${md5(this.email)}?default=retro&secure=true&size=${size}`;
    }
  }

  get displayName() {
    return this.name || this.slug;
  }

  get roleAllowsBillingProfileAdmin() {
    return this.role === 'owner';
  }

  get roleAllowsMemberView() {
    return this.role === 'owner' || this.role === 'admin' || this.role === 'member';
  }

  get roleAllowsMemberAdmin() {
    return this.role === 'owner' || this.role === 'admin';
  }

  get roleAllowsSnapshotRead() {
    return this.role === 'owner' || this.role === 'admin' || this.role === 'member';
  }

  get roleAllowsSnapshotPublish() {
    return this.role === 'owner' || this.role === 'admin' || this.role === 'member';
  }

  get roleAllowsSnapshotDelete() {
    return this.role === 'owner' || this.role === 'admin';
  }

  get canLeave() {
    return this.role === 'member' || this.role === 'admin';
  }

  get validMaxHosts() {
    if (this.maxHosts) {
      return this.maxHosts;
    }
    return this.plan ? this.plan.maxHosts : 0;
  }
}
