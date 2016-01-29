import { OrderedMap } from 'immutable';

import Store from 'stores/store';
import BonusUse from 'records/bonus-use';

class BonusUseStore extends Store {
  _bonusUses = OrderedMap(); // <K: bonusId, V: BonusUse>

  handleAction(action) {
    switch (action.type) {
      case 'bonus-use.fetched-all': {
        const { data } = action.data;
        this._bonusUses = OrderedMap(data.bonus_uses.map(function(d) {
          const b = BonusUse.deserialize(d);
          return [b.bonus_id, b];
        }));
        this._lastError = null;
        break;
      }
      case 'bonus-use.fetch-all-failed': {
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get bonusUses() {
    return this._bonusUses;
  }
}

export default new BonusUseStore();
