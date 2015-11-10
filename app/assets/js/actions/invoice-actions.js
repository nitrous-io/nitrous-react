import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class InvoiceActions {
  fetchAll() {
    const promise = authedAjax({
      type: 'GET',
      url: '/api/v0/billing/invoices',
      dataType: 'json'
    }).then((data) => {
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
}

export default new InvoiceActions();
