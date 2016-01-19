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
              inv = Invoice.deserialize(invoice);
        let orgInvoices = this.orgInvoicesByInvoiceId(inv.id);

        if (!orgInvoices) {
          this._userInvoices = this.userInvoices.set(inv.id, inv);
        } else {
          const orgInvoicesWithOrgSlugKey = this.orgInvoicesWithOrgSlugKeyByInvoicesKeyValueObject(orgInvoices),
                orgSlug = orgInvoicesWithOrgSlugKey.keySeq().first();
          orgInvoices = orgInvoices.set(inv.id, inv);
          this._orgInvoices = this._orgInvoices.set(orgSlug, orgInvoices);
        }

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

  // Returns the Value in _orgInvoices (ie. V: <K: id, V: Invoice>) without the orgSlug key.
  orgInvoicesByInvoiceId(invoiceId) {
    return this._orgInvoices.find((invoices) => {
      return invoices.find((invoice) => {
        return invoice.id === invoiceId;
      });
    });
  }

  // Returns the _orgInvoices object with orgSlug as its key by matching its Value (ie. V: <K: id, V: Invoice>) to the given invoices key-value object.
  orgInvoicesWithOrgSlugKeyByInvoicesKeyValueObject(invoicesObj) {
    return this._orgInvoices.find((invoices) => {
      return invoices === invoicesObj;
    });
  }
}

export default new InvoiceStore();
