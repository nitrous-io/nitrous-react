import mixpanel from 'mixpanel-browser/build/mixpanel.cjs';
import UAParser from 'ua-parser-js';

import userStore from 'stores/user-store';
import billingStore from 'stores/billing-store';

class Mp {
  initialized = null;
  userAfterInitialized = null;

  user = null;
  billingProfile = null;

  ua = null;
  personHash = null;

  constructor() {
    userStore.onChange(this.userStoreDidChange);
    billingStore.onChange(this.billingStoreDidChange);
    this.ua = new UAParser().getResult();
  }

  userStoreDidChange = () => {
    if (userStore.user) {
      this.identify(userStore.user);
    } else {
      this.unidentify();
    }
  }

  billingStoreDidChange = () => {
    if (billingStore.userBillingProfile) {
      this.billingProfile = billingStore.userBillingProfile;
      if (this.personHash) {
        this.personHash.billing_state = billingStore.userBillingProfile.state;
      }
    }
  }

  init(token) {
    if (!mixpanel.init) {
      return;
    }

    mixpanel.init(token);
    this.initialized = true;

    if (this.userAfterInitialized) {
      this.identify(this.userAfterInitialized);
      this.userAfterInitialized = null;
    }
  }

  unidentify() {
    this.user = null;
    this.billingProfile = null;
    this.personHash = null;
  }

  identify(user) {
    if (!this.initialized) {
      this.userAfterInitialized = user;
      return;
    }

    if (!mixpanel.identify) {
      return;
    }

    if (this.user) {
      return;
    }
    this.user = user;

    mixpanel.identify(user.id.toString());

    if (!(mixpanel.people && mixpanel.people.set_once)) {
      return;
    }

    const personData = {
      $email: user.email,
      $username: user.username,
      $created: user.createdAt,
      user_id: user.id.toString()
    };
    mixpanel.people.set_once(personData);

    if (!mixpanel.people.set) {
      return;
    }

    this.personHash = {
      $name: user.displayName
    };
    const splitName = this.personHash.$name.match(/(.*)\s([^\s]+)?$/);
    if (splitName) {
      this.personHash.$first_name = splitName[1];
      this.personHash.$last_name  = splitName[2];
    } else {
      this.personHash.$first_name = this.personHash.$name;
    }
    mixpanel.people.set(this.personHash);
  }

  track(name, data) {
    if (!this.initialized) {
      return;
    }

    const props = {
      os_name: this.ua.os.name,
      os_version: this.ua.os.version,
      browser_name: this.ua.browser.name,
      browser_version: this.ua.browser.version,
      browser_major: this.ua.browser.major
    };
    if (this.user) {
      props.username = this.user.username;
      props.email = this.user.email;
      props.distinct_id = this.user.id.toString();
    }
    if (this.billingProfile) {
      props.billing_state = this.billingProfile.state;
    }
    if (data) {
      Object.assign(props, data);
    }
    mixpanel.register_once({ 'First Time': 'TRUE' });
    mixpanel.track(name, props);
    mixpanel.register({ 'First Time': 'FALSE' });
  }
}

export default new Mp();
