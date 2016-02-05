import { Record } from 'immutable';

export default class EarnedBonus extends Record({
  id: null,
  bonusId: null,
  userId: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      bonusId: p.bonus_id,
      userId: p.user_id,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }
}
