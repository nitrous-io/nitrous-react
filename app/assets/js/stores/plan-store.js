import Store from 'stores/store';
import Plan from 'records/plan';
import { OrderedMap } from 'immutable';

class PlanStore extends Store {
  _plans = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'plan.fetched-all': {
        this._plans = OrderedMap(action.data.plans.map(function(d) {
          const p = Plan.deserialize(d);
          return [p.slug, p];
        }));
        this._lastError = null;
        break;
      }
      case 'plan.fetch-all-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get plans() {
    return this._plans.filter((p) => {
      return !p.hidden && p.subscription && p.price > 0;
    });
  }

  get personalPlans() {
    return this.plans.filter((p) => !p.org);
  }

  get orgPlans() {
    return this.plans.filter((p) => p.org);
  }
}

export default new PlanStore();
