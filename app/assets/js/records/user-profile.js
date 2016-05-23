import { Record } from 'immutable';

export default class UserProfile extends Record({
  id: null,
  advanced: false,
  maxHosts: 0,
  authorizedGitHubUserName: null,
  canDeleteGitHubPublicKeys: false,
  gitName: null,
  gitEmail: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      advanced: p.advanced,
      maxHosts: p.max_hosts,
      authorizedGitHubUserName: p.authorized_github_user_name,
      canDeleteGitHubPublicKeys: p.can_delete_github_public_keys,
      gitName: p.git_name,
      gitEmail: p.git_email
    });
  }
}
