import { Record } from 'immutable';
import md5 from 'md5';
import UserProfile from 'records/user-profile';

export default class User extends Record({
  id: null,
  username: null,
  email: null,
  unconfirmedEmail: null,
  name: null,
  admin: false,
  phone: null,
  phoneAuthed: false,
  phoneCountryCode: null,
  userProfile: null,
  maxContainers: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      username: p.username,
      email: p.email,
      unconfirmedEmail: p.unconfirmed_email,
      name: p.name,
      admin: !!p.admin,
      phone: p.phone,
      phoneAuthed: !!p.phone_authed,
      phoneCountryCode: p.phone_country_code,
      userProfile: UserProfile.deserialize(p.user_profile),
      maxContainers: p.max_containers,
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
    return this.name || this.username;
  }
}
