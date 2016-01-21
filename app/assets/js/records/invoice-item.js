import { Record } from 'immutable';

export default class InvoiceItem extends Record({
  id: null,
  description: null,
  amount: null
}) {
  static deserialize(i) {
    return new this({
      id: i.sid,
      description: i.description,
      amount: i.amount
    });
  }

  get amountDollars() {
    if (!this.amount) {
      return 0.0;
    }
    return this.amount / 100.0;
  }
}
