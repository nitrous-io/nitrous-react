import { OrderedMap } from 'immutable';

import Store from 'stores/store';
import Promocode from 'records/promocode';

class PromocodeStore extends Store {
  _promocodes = OrderedMap(); // <K: Slug, V: Promocode>
  _userPromocodes = OrderedMap(); // <K: Slug, V: Promocode>

  handleAction(action) {
    switch (action.type) {
      case 'promocode.fetched': {
        const { data } = action.data,
              promocode = Promocode.deserialize(data.promo_code);
        this._promocodes = this._promocodes.set(promocode.slug, promocode);
        this._lastError = null;
        break;
      }
      case 'promocode.fetch-failed': {
        const { jqxhr, slug } = action.data;
        this._promocodes = this._promocodes.delete(slug);
        this.handleErrorJqxhr(jqxhr);
        break;
      }
      case 'promocode.fetched-all': {
        const { data } = action.data;

        this._userPromocodes = OrderedMap(data.promo_codes.map(function(d) {
          const p = Promocode.deserialize(d);
          return [p.slug, p];
        }));

        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  promocodeBySlug(slug) {
    return this._promocodes.get(slug);
  }

  userPromocodeForPlanId(planId) {
    return this._userPromocodes.find((p) => {
      return p.planIDs && p.planIDs.has(planId);
    });
  }
}

export default new PromocodeStore();
