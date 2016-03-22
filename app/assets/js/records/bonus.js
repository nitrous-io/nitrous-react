import { Record } from 'immutable';
import format from 'lib/format';

export default class Bonus extends Record({
  id: null,
  slug: null,
  amount: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.slug,
      amount: p.amount,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  get amountHours() {
    return format.convertSecondsToHours(this.amount);
  }
}
