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
    return new this({
      id: inv.id,
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
}
