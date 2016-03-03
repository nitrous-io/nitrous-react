import { OrderedMap } from 'immutable';

import Store from 'stores/store';
import EarnedBonus from 'records/earned-bonus';
import Bonus from 'records/bonus';

class BonusStore extends Store {
  _bonuses = OrderedMap(); // <K: Slug, V: Bonus>
  _earnedBonuses = OrderedMap(); // <K: bonusId, V: EarnedBonus >

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
      case 'bonus.fetched-all-user-earned-bonuses': {
        const { data } = action.data;
        this._earnedBonuses = OrderedMap(data.earned_bonuses.map(function(d) {
          const b = EarnedBonus.deserialize(d);
          return [b.bonusId, b];
        }));
        this._lastError = null;
        break;
      }
      case 'bonus.fetch-all-user-earned-bonuses-failed': {
        break;
      }
      case 'bonus.earned-bonus': {
        const { data } = action.data;
        this._earnedBonuses = OrderedMap(data.earned_bonuses.map(function(d) {
          const b = EarnedBonus.deserialize(d);
          return [b.bonusId, b];
        }));

        this._lastError = null;
        break;
      }
      case 'bonus.earn-bonus-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'bonus.connected-twitter': {
        const { redirect_url } = action.data.data;
        this.emit('connected-twitter', { redirectUrl: redirect_url });
        break;
      }
      case 'bonus.connect-twitter-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'bonus.followed-twitter': {
        const { data } = action.data;
        this._earnedBonuses = OrderedMap(data.earned_bonuses.map(function(d) {
          const b = EarnedBonus.deserialize(d);
          return [b.bonusId, b];
        }));

        this.emit('followed-twitter');

        this._lastError = null;
        break;
      }
      case 'bonus.follow-twitter-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      case 'bonus.tweeted': {
        const { data } = action.data;
        this._earnedBonuses = OrderedMap(data.earned_bonuses.map(function(d) {
          const b = EarnedBonus.deserialize(d);
          return [b.bonusId, b];
        }));

        this.emit('tweeted');

        this._lastError = null;
        break;
      }
      case 'bonus.tweet-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }

      default: return;
    }
    this.notifyChange();
  }

  get earnedBonuses() {
    return this._earnedBonuses;
  }

  get bonuses() {
    return this._bonuses;
  }
}

export default new BonusStore();
