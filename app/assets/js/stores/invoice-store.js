import Store from 'stores/store';
import Invoice from 'records/invoice';
import { OrderedMap } from 'immutable';

class InvoiceStore extends Store {
  _userInvoices = OrderedMap(); // <K: id, V: Invoice>

  handleAction(action) {
    switch (action.type) {
      case 'invoice.fetched-all': {
        const { data } = action.data;
        this._userInvoices = OrderedMap(data.invoices.map(function(d) {
          const inv = Invoice.deserialize(d);
          return [inv.id, inv];
        }));
        this._lastError = null;
        break;
      }
      case 'invoice.fetch-all-failed': {
        this._userInvoices = null;
        this.handleErrorJqxhr(action.data.jqxhr);
        return; // do not notify of change
      }
      default: return;
    }
    this.notifyChange();
  }

  get userInvoices() {
    return this._userInvoices;
  }
}

export default new InvoiceStore();
