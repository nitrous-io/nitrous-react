import { Record } from 'immutable';
import md5 from 'md5';

export default class Org extends Record({
  id: null,
  slug: null,
  email: null,
  name: null,
  billingProfile: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.username,
      email: p.email,
      name: p.name,
      billingProfile: p.billing_profile,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.created_at ? new Date(p.updated_at) : null
    });
  }

  gravatar(size=40) {
    if (this.email) {
      return `https://secure.gravatar.com/avatar/${md5(this.email)}?default=retro&secure=true&size=${size}`;
    }
  }
}
