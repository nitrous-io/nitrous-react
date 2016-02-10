import { Record } from 'immutable';
import md5 from 'md5';

import UserProfile from 'records/user-profile';
import format from 'lib/format';

export default class User extends Record({
  id: null,
  username: null,
  email: null,
  unconfirmedEmail: null,
  confirmed: null,
  name: null,
  firstTime: false,
  admin: false,
  phone: null,
  phoneAuthed: false,
  phoneCountryCode: null,
  userProfile: null,
  maxContainers: null,
  usageQuota: null, // in seconds
  usageRemaining: null, // in seconds
  nextUsageQuotaAt: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      username: p.username,
      email: p.email,
      unconfirmedEmail: p.unconfirmed_email,
      confirmed: p.confirmed,
      name: p.name,
      firstTime: p.first_time,
      admin: !!p.admin,
      phone: p.phone,
      phoneAuthed: !!p.phone_authed,
      phoneCountryCode: p.phone_country_code,
      userProfile: p.user_profile && UserProfile.deserialize(p.user_profile),
      maxContainers: p.max_containers,
      usageQuota: p.usage_quota,
      usageRemaining: p.usage_remaining,
      nextUsageQuotaAt: p.next_usage_quota_at ? new Date(p.next_usage_quota_at) : null,
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

  // unconfirmedEmail: this is present when the user has updated their email.
  // Otherwise, the email field stores the unconfirmed email address they used
  // when they signed up.
  get unverifiedEmail() {
    if (this.confirmed) {
      return null;
    }

    return this.unconfirmedEmail || this.email;
  }

  get usageRemainingHours() {
    return format.convertSecondsToHours(this.usageRemaining);
  }

  get usageQuotaHours() {
    return format.convertSecondsToHours(this.usageQuota);
  }

  get usagePercentage() {
    return ((this.usageRemaining / this.usageQuota) * 100).toFixed(0);
  }
}
