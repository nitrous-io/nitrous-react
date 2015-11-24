import { Record } from 'immutable';
import Host from 'records/host';

export default class SubHost extends Record({
  host: null,
  username: null,
  gravatarHash: null
}) {
  static deserialize(s) {
    return new this({
      host: s.host && Host.deserialize(s.host),
      username: s.username,
      gravatarHash: s.gravatar_hash
    });
  }

  gravatar(size=72) {
    if (this.gravatarHash) {
      return `https://secure.gravatar.com/avatar/${this.gravatarHash}?default=retro&secure=true&size=${size}`;
    }
  }
}
