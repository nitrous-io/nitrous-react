import { Record } from 'immutable';

export default class Snapshot extends Record({
  id: null,
  userId: null,
  orgId: null,
  displayName: null,
  stack: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      userId: p.user_id,
      orgId: p.org_id,
      displayName: p.display_name,
      stack: null,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }
}
