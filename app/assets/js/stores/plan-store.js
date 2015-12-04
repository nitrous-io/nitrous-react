import Store from 'stores/store';
import Plan from 'records/plan';
import { OrderedMap } from 'immutable';

class PlanStore extends Store {
  _plans = OrderedMap(); // <K: PlanSlug, V: Plan>

  handleAction(action) {
    switch (action.type) {
      case 'plan.fetched-all': {
        const { data } = action.data;
        this._plans = OrderedMap(data.plans.map(function(d) {
          const p = Plan.deserialize(d);
          return [p.slug, p];
        }));
        this._lastError = null;
        break;
      }
      case 'plan.fetch-all-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get plans() {
    return this._plans.filter((p) => {
      return !p.hidden && !p.maxHosts && p.subscription && p.price > 0;
    });
  }

  get multiHostPlans() {
    return this._plans.filter((p) => {
      return !p.hidden && p.maxHosts && p.subscription && p.price > 0;
    });
  }

  get personalPlans() {
    return this.plans.filter((p) => !p.org);
  }

  get orgPlans() {
    return this.plans.filter((p) => p.org && !p.edu);
  }

  get orgMultiHostPlans() {
    return this.multiHostPlans.filter((p) => p.org && !p.edu);
  }

  get eduPlans() {
    return this.multiHostPlans.filter((p) => p.org && p.edu);
  }

  planById(id) {
    return this._plans.find((p) => {
      return p.id === id;
    });
  }

  plansForUpgrade(plan) {
    let scope = this.personalPlans;
    if (plan.org) {
      if (plan.edu) {
        scope = this.eduPlans;
      } else if (plan.maxHosts) {
        scope = this.orgMultiHostPlans;
      } else {
        scope = this.orgPlans;
      }
    }

    const currentPlanPrice = plan.price;
    return scope.filter((p) => {
      // when a user's existing plan type has a price change, filter the same
      // plan from being offered in upgrades
      const r = /basic|standard|plus/;
      if (plan.slug.match(r) === p.slug.match(r) && plan.slug.match(r) !== null) {
        return false;
      }
      return p.price > currentPlanPrice;
    });
  }
}

export default new PlanStore();
