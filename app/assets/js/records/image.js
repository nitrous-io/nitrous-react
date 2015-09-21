import { Record } from 'immutable';

export default class Image extends Record({
  id: null,
  slug: null,
  name: null,
  repo: null,
  tag: null,
  userId: null,
  hostId: null,
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

  get isSnapshot() {
    return this.tag && this.tag.startsWith('__snapshot__');
  }

  get isPulledImage() {
    return !this.isSnapshot;
  }

  get isBlank() {
    return this.actualSize === 0 && this.virtualSize === 0;
  }
}
