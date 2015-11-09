import { Record } from 'immutable';
import Plan from 'records/plan';

export default class Subscription extends Record({
  slug: null,
  planId: null,
  orgId: null,
  billingProfileId: null,
  state: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  hostSlug: null,
  cancelPending: null,
  trialEnd: null,
  plan: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(s) {
    return new this({
      slug: s.slug,
      planId: s.plan_id,
      orgId: s.org_id,
      billingProfileId: s.billing_profile_id,
      state: s.state,
      currentPeriodStart: s.current_period_start ? new Date(s.current_period_start) : null,
      currentPeriodEnd: s.current_period_end ? new Date(s.current_period_end) : null,
      hostSlug: s.host_slug,
      cancelPending: s.cancel_pending,
      trialEnd: s.trial_end,
      plan: s.plan && Plan.deserialize(s.plan),
      createdAt: s.created_at ? new Date(s.created_at) : null,
      updatedAt: s.updated_at ? new Date(s.updated_at) : null
    });
  }

  get activeTrialEnd() {
    const currentDate = new Date();
    if (currentDate < this.trialEnd) {
      return;
    }
    return this.trialEnd;
  }
}
