import { Record } from 'immutable';

export default class Template extends Record({
  id: null,
  slug: null,
  name: null,
  description: null,
  type: null,
  privileged: false,
  image: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      type: p.type,
      privileged: !!p.privileged,
      image: p.image,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  static defaultIconUrl = makeIconUrl();

  get iconUrl() {
    return this.slug ? makeIconUrl(this.slug) : '';
  }
}

function makeIconUrl(slug='nitrous') {
  return `https://nitrous-image-icons-update.s3.amazonaws.com/${slug}.png`;
}
