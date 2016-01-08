import Store from 'stores/store';
import Invoice from 'records/invoice';
import { OrderedMap } from 'immutable';

class InvoiceStore extends Store {
  _userInvoices = OrderedMap(); // <K: id, V: Invoice>
  _orgInvoices = OrderedMap(); // <K: orgSlug, V: <K: id, V: Invoice>

  handleAction(action) {
    switch (action.type) {
      case 'invoice.fetched-all': {
        const { data, orgSlug } = action.data;
        const invoices = OrderedMap(data.invoices.map(function(d) {
          const inv = Invoice.deserialize(d);
          return [inv.id, inv];
        }));
        if (orgSlug) {
          this._orgInvoices = this._orgInvoices.set(orgSlug, invoices);
        } else {
          this._userInvoices = invoices;
        }
        this._lastError = null;
        break;
      }
      case 'invoice.fetch-all-failed': {
        const { orgSlug } = action.data;
        if (orgSlug) {
          this._orgInvoices.set(orgSlug, null);
        } else {
          this._userInvoices = null;
        }
        this.handleErrorJqxhr(action.data.jqxhr);
        return; // do not notify of change
      }
      case 'invoice.pay-failed': {
        const { jqxhr, invoiceId } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('pay-failed', { invoiceId });
        return; // do not notify of change
      }
      // from events-socket
      case 'events:invoice.updated': {
        const { invoice } = action.data,
              inv = Invoice.deserialize(invoice),
              orgInv = this.orgInvoiceByInvoiceId(inv.id);

        if (!orgInv) {
          this._userInvoices = this.userInvoices.set(inv.id, inv);
        }
        // FIXME: Update this._orgInvoices

        this.emit('paid', { inv });
        this._lastError = null;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get userInvoices() {
    return this._userInvoices;
  }

  orgInvoicesBySlug(orgSlug) {
    return this._orgInvoices.get(orgSlug);
  }

  orgInvoiceByInvoiceId(invoiceId) {
    return this._orgInvoices.find((orgInvs) => {
      return orgInvs.find((inv) => {
        return inv.id === invoiceId;
      });
    });
  }
}

export default new InvoiceStore();
