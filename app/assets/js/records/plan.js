import { Record } from 'immutable';

export default class Plan extends Record({
  id: null,
  slug: null,
  name: null,
  description: null,
  price: null,
  cpu: null,
  memory: null,
  storage: null,
  subscription: false,
  hidden: false,
  autoShutdown: false,
  maxContainers: 0,
  maxHosts: 0,
  maxCollaborators: 1,
  org: false,
  edu: false,
  trialPeriodDays: 0
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      cpu: p.cpu,
      memory: p.memory,
      storage: p.storage,
      subscription: !!p.subscription,
      hidden: !!p.hidden,
      autoShutdown: !!p.auto_shutdown,
      maxContainers: p.max_containers,
      maxHosts: p.max_hosts || 0,
      maxCollaborators: p.max_collaborators,
      org: !!p.org,
      edu: !!p.edu,
      trialPeriodDays: p.trial_period_days
    });
  }

  get priceDollars() {
    return this.price / 100.0;
  }

  get isStandard() {
    const planTypeRe = /standard/;
    return this.slug.match(planTypeRe);
  }

  get isBasic() {
    const planTypeRe = /basic/;
    return this.slug.match(planTypeRe);
  }

  get isPlus() {
    if (this.org) {
      return false;
    }
    const planTypeRe = /plus/;
    return this.slug.match(planTypeRe);
  }
}
