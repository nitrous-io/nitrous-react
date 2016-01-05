import { Record } from 'immutable';

export default class Invoice extends Record({
  id: null,
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
    const invID = inv.sid ? inv.sid : inv.id;
    return new this({
      id: invID,
      userId: inv.user_id,
      totalCharge: inv.total_charge,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      state: inv.state,
      attempted: inv.attempted,
      totalCredit: inv.totalCredit,
      creditAvailable: inv.creditAvailable,
      // FIXME: Deserialize items to InvoiceItem
      items: inv.items,      
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
    return this.items[0].description.replace("Subscription to", "").trim();
  }

  get manuallyPayable() {
    if (this.state === 'paid' || this.state === 'deferred') {
      return false;
    }
    return this.state === 'failed' || this.state === 'attempted';
  }
}
