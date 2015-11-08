import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';

class InvoiceActions {
  fetchAll() {
    return authedAjax({
      type: 'GET',
      url: '/api/v0/billing/invoices',
      dataType: 'json'
    }).then((data) => {
      dispatcher.dispatch({
        type: 'invoice.fetched-all',
        data: { data }
      });
    }).catch((jqxhr) => {
      dispatcher.dispatch({
        type: 'invoice.fetch-all-failed',
        data: { jqxhr }
      });
    });
  }
}

export default new InvoiceActions();
