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

  get displayName() {
    if (!this.url) {
      return null;
    }
    
    if (this.url.includes('index.docker.io') !== -1) {
      return 'DockerHub';
    } else if (this.url.includes('quay.io') !== -1) {
      return 'Quay';
    }
    return this.url;
  }
}
