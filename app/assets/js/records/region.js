import { Record } from 'immutable';

export default class Region extends Record({
  id: null,
  slug: null,
  name: null,
  rank: 0
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.slug,
      name: p.name,
      rank: p.org
    });
  }
}
