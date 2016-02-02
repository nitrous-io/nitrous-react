import { OrderedMap } from 'immutable';

import Store from 'stores/store';
import BonusUse from 'records/bonus-use';
import Bonus from 'records/bonus';

class BonusStore extends Store {
  _bonuses = OrderedMap(); // <K: Slug, V: Bonus>
  _bonusUses = OrderedMap(); // <K: bonusId, V: BonusUse>

  handleAction(action) {
    switch (action.type) {
      case 'bonus.fetched-all': {
        const { data } = action.data;
        this._bonuses = OrderedMap(data.bonuses.map(function(d) {
          const b = Bonus.deserialize(d);
          return [b.slug, b];
        }));
        this._lastError = null;
        break;
      }
      case 'bonus.fetch-all-failed': {
        break;
      }
      case 'bonus.fetched-all-bonus-uses': {
        const { data } = action.data;
        this._bonusUses = OrderedMap(data.bonus_uses.map(function(d) {
          const b = BonusUse.deserialize(d);
          return [b.bonusId, b];
        }));
        this._lastError = null;
        break;
      }
      case 'bonus.fetch-all-bonus-use-failed': {
        break;
      }
      case 'bonus.earned-bonus': {
        const { data } = action.data;
        this._bonusUses = OrderedMap(data.bonus_uses.map(function(d) {
          const b = BonusUse.deserialize(d);
          return [b.bonusId, b];
        }));

        this._lastError = null;
        break;
      }
      case 'bonus.earn-bonus-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }

      default: return;
    }
    this.notifyChange();
  }

  get bonusUses() {
    return this._bonusUses;
  }

  get bonuses() {
    return this._bonuses;
  }
}

export default new BonusStore();
