import { Record } from 'immutable';

import InvoiceItem from 'records/invoice-item';

export default class Invoice extends Record({
  id: null,
  description: null,
  userId: null,
  totalCharge: null,
  periodStart: null,
  periodEnd: null,
  state: null,
  attempted: null,
  totalCredit: null,
  creditAvailable: null,
  items: null,
  subscription: false
}) {
  static deserialize(inv) {
    // presence of sid means invoice is from stripe json instead of db
    const invID = inv.sid ? inv.sid : inv.id;
    const invItems = (inv.items || []).map((item) => {
      return InvoiceItem.deserialize(item);
    });
    return new this({
      id: invID,
      userId: inv.user_id,
      description: inv.description,
      totalCharge: inv.total_charge,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      state: inv.state,
      attempted: inv.attempted,
      totalCredit: inv.totalCredit,
      creditAvailable: inv.creditAvailable,
      items: invItems,
      subscription: inv.subscription
    });
  }

  get totalChargeDollars() {
    return this.totalCharge / 100.0;
  }

  get creditAvailableDollars() {
    return this.creditAvailable / 100.0;
  }

  get title() {
    if (this.description) {
      return this.description;
    }
    // TODO: below is deprecated once stripe invoices are live
    return this.items[0].description.replace("Subscription to", "").trim();
  }

  get manuallyPayable() {
    if (this.state === 'paid' || this.state === 'deferred') {
      return false;
    }
    return this.state === 'failed' || this.state === 'attempted';
  }
}
