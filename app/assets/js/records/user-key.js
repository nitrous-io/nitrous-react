import { Record } from 'immutable';

export default class UserKey extends Record({
  id: null,
  containerId: null,
  userId: null,
  fingerprint: null,
  key: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      containerId: p.container_id,
      userId: p.user_id,
      fingerprint: p.fingerprint,
      key: p.key,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  get displayName() {
    let name = `Public Key ${this.id}`;
    const matches = this.key.match(/^\s*ssh-(rsa|dss)\s+\S+\s+(\S+)/);
    if (matches) {
      name = matches[2];
    }
    return `${name} (${this.fingerprint})`;
  }
}
