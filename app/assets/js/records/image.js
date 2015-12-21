import { Record } from 'immutable';

export default class Image extends Record({
  id: null,
  slug: null,
  name: null,
  repo: null,
  tag: null,
  userId: null,
  hostId: null,
  stack: null,
  isSnapshot: null,
  actualSize: 0,
  virtualSize: 0,
  builtAt: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.slug,
      name: p.name,
      repo: p.repo,
      tag: p.tag,
      userId: p.user_id,
      hostId: p.host_id,
      stack: p.stack,
      isSnapshot: p.is_snapshot,
      actualSize: p.actual_size,
      virtualSize: p.virtual_size,
      builtAt: p.built_at ? new Date(p.built_at) : null,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  get displayName() {
    return this.name || this.repo;
  }

  static defaultStackIconUrl = makeStackIconUrl();

  get stackIconUrl() {
    return this.stack ? makeStackIconUrl(this.stack) : '';
  }
}

function makeStackIconUrl(stack='nitrous') {
  return `https://nitrous-image-icons-update.s3.amazonaws.com/${stack}.png`;
}
