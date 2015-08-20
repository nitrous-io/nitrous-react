import Model from 'models/model';
import token from 'models/token';
import md5 from 'md5';

class CurrentUser extends Model {
  id = null;
  username = null;
  email = null;
  name = null;
  admin = false;
  phone = null;
  phoneAuthed = null;
  phoneCountryCode = null;
  billingProfile = null;
  userProfile = null;
  createdAt = null;
  updatedAt = null;

  isPresent() {
    return this.id != null;
  }

  deserialize(s) {
    this.setIfDefined({
      id: s.id,
      username: s.username,
      email: s.email,
      name: s.name,
      admin: s.admin,
      phone: s.phone,
      phoneAuthed: s.phone_authed,
      phoneCountryCode: s.phone_country_code,
      billingProfile: s.billing_profile,
      userProfile: s.user_profile,
      createdAt: s.createdAt ? new Date(s.createdAt) : null,
      updatedAt: s.createdAt ? new Date(s.updatedAt) : null
    });
  }

  fetch() {
    return token.ajax({
      type: 'GET',
      url: '/api/v0/user',
      dataType: 'json'
    }).then((data) => {
      this.deserialize(data.user);
    });
  }

  gravatar(size=36) {
    if (this.email) {
      return `https://secure.gravatar.com/avatar/${md5(this.email)}?default=retro&secure=true&size=${size}`;
    }
  }
}

export default new CurrentUser();
