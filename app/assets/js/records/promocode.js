import { Record, OrderedSet } from 'immutable';
import { duration } from 'moment';

export default class Promocode extends Record({
  slug: null,
  trialSeconds: null,
  planIDs: null
}) {
  static deserialize(p) {
    return new this({
      slug: p.slug,
      trialSeconds: p.trial_seconds,
      planIDs: p.plan_ids && OrderedSet(p.plan_ids)
    });
  }

  get trialInfo() {
    if (!this.trialSeconds) {
      return;
    }

    const parsed = duration(this.trialSeconds, 'seconds');
    if (parsed) {
      const dayWord = parsed.days() === 1 ? "day" : "days";
      return `${parsed.days()} ${dayWord} free trial`;
    }
    return;
  }
}
