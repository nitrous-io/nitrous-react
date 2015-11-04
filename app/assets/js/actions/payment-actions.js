import dispatcher from 'app-dispatcher';

class PaymentActions {
  requestSubmit() {
    dispatcher.dispatch({
      type: 'payment.submit-requested',
      data: null
    });
  }
}

export default new PaymentActions();
