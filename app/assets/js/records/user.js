import { Record } from 'immutable';
import md5 from 'md5';

export default class User extends Record({
  id: null,
  username: null,
  email: null,
  name: null,
  admin: false,
  phone: null,
  phoneAuthed: null,
  phoneCountryCode: null,
  billingProfile: null,
  userProfile: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      username: p.username,
      email: p.email,
      name: p.name,
      admin: p.admin,
      phone: p.phone,
      phoneAuthed: p.phone_authed,
      phoneCountryCode: p.phone_country_code,
      billingProfile: p.billing_profile,
      userProfile: p.user_profile,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.created_at ? new Date(p.updated_at) : null
    });
  }

  gravatar(size=36) {
    if (this.email) {
      return `https://secure.gravatar.com/avatar/${md5(this.email)}?default=retro&secure=true&size=${size}`;
    }
  }
}
