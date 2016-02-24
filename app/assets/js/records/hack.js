import { Record } from 'immutable';

export default class Hack extends Record({
  owner: null,
  repoName: null,
  template: null,
  ports: null
}) {
  static deserialize(p) {
    return new this({
      owner: p.owner,
      repoName: p.repo_name,
      template: p.template,
      ports: p.ports
    });
  }
}
