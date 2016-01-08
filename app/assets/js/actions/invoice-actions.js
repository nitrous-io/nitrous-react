import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class InvoiceActions {
  fetchAll(fromStripe) {
    const opts = {
      type: 'GET',
      url: '/api/v0/billing/invoices',
      dataType: 'json'
    };
    if (fromStripe) {
      opts.data = {
        'from_stripe': '1'
      };
    }
    const promise = authedAjax(opts
    ).then((data) => {
      dispatcher.dispatch({
        type: 'invoice.fetched-all',
        data: { data }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'invoice.fetch-all-failed',
        data: { jqxhr }
      });
    });
    return promise;
  }

  fetchAllByOrgSlug(orgSlug) {
    const promise = authedAjax({
      type: 'GET',
      url: `/api/v0/orgs/${orgSlug}/invoices`,
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'invoice.fetched-all',
        data: { data, orgSlug }
      });
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'invoice.fetch-all-failed',
        data: { jqxhr, orgSlug }
      });
    });
    return promise;
  }

  pay(invoiceId) {
    const promise = authedAjax({
      type: 'POST',
      url: `/api/v0/invoices/${invoiceId}/pay`,
      dataType: 'json'
    });
    promise.catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'invoice.pay-failed',
        data: { jqxhr, invoiceId }
      });
    });
    return promise;
  }
}

export default new InvoiceActions();
