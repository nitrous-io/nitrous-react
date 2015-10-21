import Store from 'stores/store';

class AppSettingsStore extends Store {
  handleAction(action) {
    switch (action.type) {
      case 'app-settings.fetched': {
        if (action.data.stripe_key) {
          window.Stripe.setPublishableKey(action.data.stripe_key);
        }
        break;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new AppSettingsStore();
