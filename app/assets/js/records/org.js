import { Record } from 'immutable';
import md5 from 'md5';

export default class Org extends Record({
  id: null,
  slug: null,
  email: null,
  name: null,
  role: null,
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
    return this.role === 'owner' || this.role === 'admin';
  }
}
