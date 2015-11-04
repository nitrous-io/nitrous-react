import { Record } from 'immutable';

export default class Container extends Record({
  id: null,
  cid: null,
  userId: null,
  hostId: null,
  image: null,
  slug: null,
  name: null,
  ipAddress: null,
  gatewayIp: null,
  state: null,
  systemUser: null,
  cmd: null,
  entrypoint: null,
  exitCode: null,
  config: null,
  previewHostname: null,
  sshUrl: null,
  metadata: null,
  userData: null,
  createdAt: null,
  updatedAt: null,
  terminatedAt: null,
  startedAt: null,
  finishedAt: null,
  // shared containers
  userUsername: null,
  userName: null,
  userGravatarHash: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      cid: p.cid,
      userId: p.user_id,
      hostId: p.host_id,
      image: p.image,
      slug: p.slug,
      name: p.name,
      ipAddress: p.ip_address,
      gatewayIp: p.gateway_ip,
      state: p.state,
      systemUser: p.user,
      cmd: p.cmd,
      entrypoint: p.entrypoint,
      exitCode: p.exit_code,
      config: p.config,
      previewHostname: p.preview_hostname,
      sshUrl: p.ssh_url,
      metadata: p.metadata,
      userData: p.user_data,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null,
      terminatedAt: p.terminated_at ? new Date(p.terminated_at) : null,
      startedAt: p.started_at ? new Date(p.started_at) : null,
      finishedAt: p.finished_at ? new Date(p.finished_at) : null,
      userUsername: p.user_username,
      userName: p.user_name,
      userGravatarHash: p.user_gravatar_hash
    });
  }

  get displayName() {
    return this.name || this.slug;
  }

  get isInIntermediateState() {
    return !['running', 'stopped'].includes(this.state);
  }

  get canOpenIDE() {
    return this.state === 'running';
  }
}
