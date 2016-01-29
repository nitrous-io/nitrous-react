import { Record } from 'immutable';

export default class BonusUse extends Record({
  id: null,
  bonus_id: null,
  user_id: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      bonus_id: p.bonus_id,
      user_id: p.user_id,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }
}
