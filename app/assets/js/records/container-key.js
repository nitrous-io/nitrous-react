import { Record } from 'immutable';

export default class ContainerKey extends Record({
  fingerprint: null,
  key: null
}) {
  static deserialize(p) {
    return new this({
      fingerprint: p.fingerprint,
      key: p.key
    });
  }

  get displayName() {
    let name = 'Container Key';
    const matches = this.key.match(/^\s*ssh-(rsa|dss)\s+\S+\s+(\S+)/);
    if (matches) {
      name = matches[2];
    }
    return `${name} (${this.fingerprint})`;
  }
}
