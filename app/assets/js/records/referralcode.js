import { Record } from 'immutable';

import format from 'lib/format';

export default class Referralcode extends Record({
  id: null,
  userID: null,
  code: null,
  bonus: null,
  cap: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      userID: p.user_id,
      code: p.code,
      bonus: p.bonus,
      cap: p.cap,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  get bonusHours() {
    return format.convertSecondsToHours(this.bonus);
  }

  get bonusHoursTotal() {
    return this.bonusHours * this.cap;
  }

}
