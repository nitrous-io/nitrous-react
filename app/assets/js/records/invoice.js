import { Record } from 'immutable';

import InvoiceItem from 'records/invoice-item';

export default class Invoice extends Record({
  id: null,
  description: null,
  amount: null,
  userId: null,
  periodStart: null,
  state: null,
  items: null
}) {
  static deserialize(inv) {
    const invItems = (inv.items || []).map((item) => {
      return InvoiceItem.deserialize(item);
    });
    return new this({
      id: inv.sid,
      description: inv.description,
      amount: inv.amount,
      userId: inv.userId,
      periodStart: inv.period_start,
      state: inv.state,
      items: invItems
    });
  }

  get amountDollars() {
    return this.amount / 100.0;
  }

  get manuallyPayable() {
    if (this.state === 'paid' || this.state === 'deferred') {
      return false;
    }
    return this.state === 'failed' || this.state === 'attempted';
  }
}
