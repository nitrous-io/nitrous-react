import { Record } from 'immutable';

export default class FreeUsage extends Record({
  usageQuota: null, // in seconds
  usageRemaining: null, // in seconds
  nextUsageQuotaAt: null
}) {
  static deserialize(p) {
    return new this({
      usageQuota: p.usage_quota,
      usageRemaining: p.usage_remaining,
      nextUsageQuotaAt: p.next_usage_quota_at ? new Date(p.next_usage_quota_at) : null
    });
  }

  get usagePercentage() {
    return ((this.usageRemaining / this.usageQuota) * 100).toFixed(0);
  }
}
