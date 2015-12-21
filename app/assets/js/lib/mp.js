import UAParser from 'ua-parser-js';

import userStore from 'stores/user-store';
import billingStore from 'stores/billing-store';
import subscriptionStore from 'stores/subscription-store';

const dashboardVersion = "0.1";

class Mp {
  initialized = null;
  userAfterInitialized = null;

  user = null;
  billingProfile = null;
  trialSubscription = null;

  ua = null;
  personHash = null;

  constructor() {
    userStore.onChange(this.userStoreDidChange);
    billingStore.onChange(this.billingStoreDidChange);
    subscriptionStore.onChange(this.subscriptionStoreDidChange);
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
        if (this.mixpanel.people && this.mixpanel.people.set) {
          this.mixpanel.people.set(this.personHash);
        }
      }
    }
  }

  subscriptionStoreDidChange = () => {
    if (subscriptionStore.trialSubscription) {
      this.trialSubscription = subscriptionStore.trialSubscription;
    }

    if (this.mixpanel.people && this.mixpanel.people.set) {
      this.mixpanel.people.set({has_trial: (this.trialSubscription !== null)});
    }
  }

  init(token) {
    if (!this.mixpanel.init) {
      return;
    }

    this.mixpanel.init(token);
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

    if (!this.mixpanel.identify) {
      return;
    }

    if (this.user) {
      return;
    }
    this.user = user;

    this.mixpanel.identify(user.id.toString());

    if (!(this.mixpanel.people && this.mixpanel.people.set_once)) {
      return;
    }

    const personData = {
      $email: user.email,
      $username: user.username,
      $created: user.createdAt,
      user_id: user.id.toString(),
      has_trial: this.trialSubscription !== null
    };
    this.mixpanel.people.set_once(personData);

    if (!this.mixpanel.people.set) {
      return;
    }

    this.personHash = {
      $name: user.displayName,
      dashboardVersion
    };
    const splitName = this.personHash.$name.match(/(.*)\s([^\s]+)?$/);
    if (splitName) {
      this.personHash.$first_name = splitName[1];
      this.personHash.$last_name  = splitName[2];
    } else {
      this.personHash.$first_name = this.personHash.$name;
    }
    this.mixpanel.people.set(this.personHash);
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
      browser_major: this.ua.browser.major,
      dashboardVersion
    };
    if (this.user) {
      props.username = this.user.username;
      props.email = this.user.email;
      props.distinct_id = this.user.id.toString();
    }
    if (this.billingProfile) {
      props.billing_state = this.billingProfile.state;
    }
    props.has_trial = (this.trialSubscription !== null);
    if (data) {
      Object.assign(props, data);
    }
    this.mixpanel.register_once({ 'First Time': 'TRUE' });
    this.mixpanel.track(name, props);
    this.mixpanel.register({ 'First Time': 'FALSE' });
  }

  increment(property, value=1) {
    if (typeof property === 'object') {
      this.mixpanel.people.increment(property);
      return;
    }

    this.mixpanel.people.increment(property, value);
  }

  get mixpanel() {
    if (!window.mixpanel) {
      return {}; // return stub (similar if blocked by ads)
    }
    return window.mixpanel;
  }
}

export default new Mp();
