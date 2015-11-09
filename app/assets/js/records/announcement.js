import { Record } from 'immutable';

export default class Announcement extends Record({
  id: null,
  hostId: null,
  userId: null,
  subject: null,
  message: null,
  expiresAt: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      hostId: p.host_id,
      userId: p.user_id,
      subject: p.subject,
      message: p.message,
      expiresAt: p.expires_at ? new Date(p.expires_at) : null,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  // Returns an array of lines in the message.
  get messageLines() {
    return this.message.match(/[^\r\n]+/g);
  }
}
