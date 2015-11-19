import { Record } from 'immutable';

export default class Plan extends Record({
  id: null,
  basePlanId: null,
  slug: null,
  name: null,
  description: null,
  type: null,
  price: null,
  basePrice: null,
  hourlyPrice: null,
  cpu: null,
  memory: null,
  storage: null,
  mostPopular: false,
  subscription: false,
  hidden: false,
  autoShutdown: false,
  maxContainers: 0,
  maxSnapshots: 0,
  maxHosts: 0,
  cleanPreview: false,
  desktopApp: false,
  ssh: false,
  customDomain: false,
  customTemplates: false,
  org: false,
  trialPeriodDays: 0
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      basePlanId: p.base_plan_id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      type: p.type,
      price: p.price,
      basePrice: p.base_price,
      hourlyPrice: p.hourly_price,
      cpu: p.cpu,
      memory: p.memory,
      storage: p.storage,
      mostPopular: !!p.most_popular,
      subscription: !!p.subscription,
      hidden: !!p.hidden,
      autoShutdown: !!p.auto_shutdown,
      maxContainers: p.max_containers,
      maxSnapshots: p.max_snapshots,
      maxHosts: p.max_hosts || 0,
      cleanPreview: !!p.clean_preview,
      desktopApp: !!p.desktop_app,
      ssh: !!p.ssh,
      customDomain: !!p.custom_domain,
      customTemplates: !!p.custom_templates,
      org: !!p.org,
      trialPeriodDays: p.trial_period_days
    });
  }

  get priceDollars() {
    return this.price / 100.0;
  }
}
