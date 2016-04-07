import { Record } from 'immutable';

export default class Quickstart extends Record({
  owner: null,
  ownerAvatar: null,
  repoName: null,
  template: null,
  ports: null,
  scripts: null,
  noClone: null
}) {
  static deserialize(p) {
    return new this({
      owner: p.owner,
      ownerAvatar: p.owner_avatar,
      repoName: p.repo_name,
      template: p.template,
      ports: p.ports,
      scripts: p.scripts,
      noClone: p.no_clone
    });
  }
}
