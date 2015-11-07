import md5 from 'md5';

import { Record } from 'immutable';

const allowedRolesMap = {
  owner: ['owner', 'admin', 'member', 'limited'],
  admin: ['admin', 'member', 'limited'],
  member: [],
  limited: []
};

export default class OrgMember extends Record({
  id: null,
  role: null,
  userId: null,
  username: null,
  name: null,
  email: null,
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
      email: p.email,
      orgId: p.org_id,
      orgSlug: p.org_slug,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  gravatar(size=72) {
    if (this.email) {
      return `https://secure.gravatar.com/avatar/${md5(this.email)}?default=retro&secure=true&size=${size}`;
    }
  }

  get displayName() {
    if (this.username && this.name) {
      return `${this.username} (${this.name})`;
    }
    return this.username || this.email;
  }

  get allowedRoles() {
    return Roles.allowedFor(this.role);
  }
}

export const Roles = {
  Owner: 'owner',
  Admin: 'admin',
  Member: 'member',
  Limited: 'limited',
  DefaultRole: 'member',

  allowedFor(role) {
    return allowedRolesMap[role];
  }
};
