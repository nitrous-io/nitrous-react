import { Record } from 'immutable';

export default class Collaborator extends Record({
  id: null,
  containerId: null,
  userId: null,
  username: null,
  gravatarHash: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      containerId: p.container_id,
      userId: p.user_id,
      username: p.username,
      gravatarHash: p.gravatar_hash,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  gravatar(size=72) {
    if (this.gravatarHash) {
      return `https://secure.gravatar.com/avatar/${this.gravatarHash}?default=retro&secure=true&size=${size}`;
    }
  }
}
