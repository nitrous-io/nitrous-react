import Store from 'stores/store';

class PaymentStore extends Store {
  handleAction(action) {
    switch (action.type) {
      case 'payment.submit-requested': {
        this.emit('submit-requested');
        break;
      }
      default: return;
    }
    this.notifyChange();
  }
}

export default new PaymentStore();
