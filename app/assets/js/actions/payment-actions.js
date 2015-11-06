import dispatcher from 'app-dispatcher';

class PaymentActions {
  requestSubmit() {
    // Allow dispatch to be run as part of another dispatch.
    // This can happen when trying to request a submit in response to another
    // dispatched event.
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'payment.submit-requested',
        data: null
      });
    }, 1);
  }
}

export default new PaymentActions();
