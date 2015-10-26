import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';
const Stripe = window.Stripe;

class BillingActions {
  updateCard(data) {
    let url = '/user/billing_profile';
    if (data.orgSlug) {
      url = "/orgs/"+data.orgSlug+"/billing_profile";
    }

    return new Promise(function(resolve, reject) {
      Stripe.card.createToken({
        name: data.cardholderName,
        number: data.ccNumber,
        exp_month: data.expirationMonth,
        exp_year: data.expirationYear,
        cvc: data.cvc,
        address_zip: data.zipCode
      }, (status, response) => {
        if (response.error) {
          dispatcher.dispatch({
            type: 'billing-profile.update-failed',
            data: {
              jqxhr: {
                errorMessage: response.error.message || 'Failed to send card token'
              }
            }
          });
          return reject();
        }

        authedAjax({
          type: 'POST',
          url: '/api/v0'+url,
          dataType: 'json',
          data: {
            card_token: response.id
          }
        }).then((data) => {
          dispatcher.dispatch({
            type: 'billing-profile.updated',
            data: {
              data
            }
          });
          resolve();
        }).catch((jqxhr) => {
          dispatcher.dispatch({
            type: 'billing-profile.update-failed',
            data: {
              jqxhr
            }
          });
          reject();
        });
      });
    });
  }
}

export default new BillingActions();
