import { Record } from 'immutable';

export default class Registry extends Record({
  id: null,
  hostId: null,
  email: null,
  url: null,
  username: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      hostId: p.host_id,
      email: p.email,
      url: p.url,
      username: p.username
    });
  }
}
