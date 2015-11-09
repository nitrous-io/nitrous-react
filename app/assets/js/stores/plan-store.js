import Store from 'stores/store';
import Plan from 'records/plan';
import { OrderedMap } from 'immutable';

class PlanStore extends Store {
  _plans = OrderedMap(); // <K: PlanSlug, V: Plan>
  _orgPlans = OrderedMap(); // <K: PlanSlug, V: Plan>

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
      case 'plan.fetched-all-org-plans': {
        const { data } = action.data;
        this._orgPlans = OrderedMap(data.plans.map(function(d) {
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
    return (this._plans + this._orgPlans);
  }

  get orgPlans() {
    return this._orgPlans;
  }

  get personalPlans() {
    return this._plans;
  }

  planById(id) {
    return this._plans.find((p) => {
      return p.id === id;
    });
  }
}

export default new PlanStore();
