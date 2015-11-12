import { Record } from 'immutable';
import md5 from 'md5';

export default class Host extends Record({
  id: null,
  userId: null,
  regionId: null,
  planId: null,
  orgId: null,
  slug: null,
  name: null,
  ipAddress: null,
  staticIp: false,
  freighterdPort: null,
  freighterdVersion: null,
  dockerVersion: null,
  providerIdentifier: null,
  hostname: null,
  proxyHostname: null,
  plan: null,
  state: 'stopped',
  autoShutdown: false,
  updateAvailable: null,
  maxContainers: 0,
  pendingRespec: false,
  subscriptionSlug: null,
  free: false,
  createdAt: null,
  updatedAt: null,
  terminatedAt: null,
  lastRunningAt: null,
  lastPingedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      userId: p.user_id,
      regionId: p.region_id,
      planId: p.plan_id,
      orgId: p.org_id,
      slug: p.slug,
      name: p.name,
      ipAddress: p.ip_address,
      staticIp: !!p.static_ip,
      freighterdPort: p.freighterd_port,
      freighterdVersion: p.freighterd_version,
      dockerVersion: p.docker_version,
      providerIdentifier: p.provider_identifier,
      hostname: p.hostname,
      proxyHostname: p.proxy_hostname,
      plan: p.size,
      state: p.state,
      autoShutdown: !!p.auto_shutdown,
      updateAvailable: p.update_available,
      maxContainers: p.max_containers,
      pendingRespec: !!p.pending_respec,
      subscriptionSlug: p.subscription_slug,
      free: !!p.free,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null,
      terminatedAt: p.terminated_at ? new Date(p.terminated_at) : null,
      lastRunningAt: p.last_running_at ? new Date(p.last_running_at) : null,
      lastPingedAt: p.last_pinged_at ? new Date(p.last_pinged_at) : null
    });
  }

  gravatar(size=40) {
    if (this.email) {
      return `https://secure.gravatar.com/avatar/${md5(this.email)}?default=retro&secure=true&size=${size}`;
    }
  }

  get displayName() {
    return this.name || this.slug;
  }

  get displayState() {
    switch (this.state) {
      case 'respeccing': {
        return 'upgrade in progress';
      }
      case 'respec_failed': {
        return 'upgrade failed';
      }
    }
    return this.state;
  }

  get isActive() {
    return !this.terminatedAt && this.state !== 'terminated' && this.state !== 'terminating';
  }
}
