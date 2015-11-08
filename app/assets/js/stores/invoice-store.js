import Store from 'stores/store';
import Invoice from 'records/invoice';
import { OrderedMap } from 'immutable';

class InvoiceStore extends Store {
  _invoices = OrderedMap(); // <K: id, V: Invoice>

  handleAction(action) {
    switch (action.type) {
      case 'invoice.fetched-all': {
        const { data } = action.data;
        this._invoices = OrderedMap(data.invoices.map(function(d) {
          const inv = Invoice.deserialize(d);
          return [inv.id, inv];
        }));
        this._lastError = null;
        break;
      }
      case 'invoice.fetch-all-failed': {
        this._invoices = null;
        this.handleErrorJqxhr(action.data.jqxhr);
        return; // do not notify of change
      }
      default: return;
    }
    this.notifyChange();
  }

  get invoices() {
    return this._invoices;
  }
}

export default new InvoiceStore();
