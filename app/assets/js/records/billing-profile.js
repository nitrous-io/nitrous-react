import { Record } from 'immutable';

export default class BillingProfile extends Record({
  userId: null,
  orgId: null,
  lastFour: null,
  cardType: null,
  expMonth: null,
  expYear: null,
  state: null,
  billingIssues: false,
  trialEligible: false
}) {
  static deserialize(p) {
    return new this({
      userId: p.user_id,
      orgId: p.org_id,
      lastFour: p.last_four,
      cardType: p.card_type,
      expMonth: p.exp_month,
      expYear: p.exp_year,
      state: p.state,
      billingIssues: p.has_billing_issues,
      trialEligible: p.trial_eligible
    });
  }

  get free() {
    return this.state === "free";
  }

  get hasCard() {
    return this.cardType && this.lastFour && this.expMonth && this.expYear;
  }
}
