import { Record } from 'immutable';
import md5 from 'md5';

import Plan from 'records/plan';

export default class Org extends Record({
  id: null,
  slug: null,
  email: null,
  name: null,
  role: null,
  multiHost: false,
  plan: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.slug,
      email: p.email,
      name: p.name,
      role: p.role,
      multiHost: p.multi_host,
      plan: p.plan && Plan.deserialize(p.plan),
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
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

  get roleAllowsMemberAdmin() {
    return this.role === 'owner' || this.role === 'admin';
  }

  get canLeave() {
    return this.role === 'member' || this.role === 'admin';
  }
}
