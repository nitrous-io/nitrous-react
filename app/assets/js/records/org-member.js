import { Record } from 'immutable';

export default class OrgMember extends Record({
  id: null,
  role: null,
  userId: null,
  username: null,
  name: null,
  orgId: null,
  orgSlug: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      role: p.role,
      userId: p.user_id,
      username: p.username,
      name: p.name,
      orgId: p.org_id,
      orgSlug: p.org_slug,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }
}
