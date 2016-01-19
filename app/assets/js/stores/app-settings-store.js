import Store from 'stores/store';
import Mp from 'lib/mp';
import Captcha from 'lib/captcha';

class AppSettingsStore extends Store {
  handleAction(action) {
    switch (action.type) {
      case 'app-settings.fetched': {
        if (action.data.stripe_key) {
          window.Stripe.setPublishableKey(action.data.stripe_key);
        }
        if (action.data.mixpanel_token) {
          Mp.init(action.data.mixpanel_token);
        }
        if (action.data.captcha_key) {
          Captcha.init(action.data.captcha_key);
        }

        break;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new AppSettingsStore();
