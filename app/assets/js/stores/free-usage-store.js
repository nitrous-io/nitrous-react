import Store from 'stores/store';
import hostStore from 'stores/host-store';
import FreeUsage from 'records/free-usage';

class FreeUsageStore extends Store {
  _freeUsage = null; // <FreeUsage>
  _timer = null;

  handleAction(action) {
    switch (action.type) {
      case 'free-usage.fetched': {
        const { data } = action.data;
        this._freeUsage = FreeUsage.deserialize(data.user);
        clearTimeout(this._timer);
        this._tickUsageRemaining();
        this._lastError = null;
        break;
      }

      case 'free-usage.fetch-failed': {
        this._freeUsage = null;
        // Fail silently here since this is non-essential.
        return; // do not notify of change
      }

      default: return;
    }
    this.notifyChange();
  }

  get nextUsageQuotaAt() {
    if (!this._freeUsage) return null;
    return this._freeUsage.nextUsageQuotaAt;
  }

  get usageQuota() {
    if (!this._freeUsage) return null;
    return this._freeUsage.usageQuota;
  }

  get usageRemaining() {
    if (!this._freeUsage) return null;
    return this._freeUsage.usageRemaining;
  }

  get quotaReached() {
    return this._freeUsage && this._freeUsage.usageRemaining <= 0;
  }

  _tickUsageRemaining() {
    this.emit('usage-remaining-tick');

    if (this._freeUsage.usageRemaining <= 0) {
      clearTimeout(this._timer);
      return;
    }

    // Stop countdown when the free user host is stopped.
    // Assume user only has 1 free host.
    if (hostStore.stoppedFreeHosts.size !== 0) {
      return;
    }

    this._freeUsage = this._freeUsage.set('usageRemaining', this._freeUsage.usageRemaining - 1);

    this._timer = setTimeout(() => {
      this._tickUsageRemaining();
    }, 1000);
  }
}

export default new FreeUsageStore();
