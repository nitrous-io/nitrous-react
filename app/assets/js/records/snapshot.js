import { Record } from 'immutable';
import md5 from 'md5';

export default class Snapshot extends Record({
  id: null,
  imageId: null,
  userId: null,
  orgId: null,
  slug: null,
  displayName: null,
  stack: null,
  filesize: null, // We can't name this property "size" because Record has a size property.
  ownerUsername: null,
  ownerName: null,
  ownerEmail: null,
  createdAt: null,
  updatedAt: null
}) {
  static deserialize(p) {
    return new this({
      id: p.id,
      imageId: p.image_id,
      userId: p.user_id,
      orgId: p.org_id,
      slug: p.slug,
      displayName: p.display_name,
      stack: p.stack,
      filesize: p.size ? p.size : null,
      ownerUsername: p.owner_username,
      ownerName: p.owner_name,
      ownerEmail: p.owner_email,
      createdAt: p.created_at ? new Date(p.created_at) : null,
      updatedAt: p.updated_at ? new Date(p.updated_at) : null
    });
  }

  static defaultStackIconUrl = makeStackIconUrl();

  get stackIconUrl() {
    return this.stack ? makeStackIconUrl(this.stack) : '';
  }

  get ownerDisplayName() {
    return this.ownerName || this.ownerUsername;
  }

  ownerGravatar(size=40) {
    if (this.ownerEmail) {
      return `https://secure.gravatar.com/avatar/${md5(this.ownerEmail)}?default=retro&secure=true&size=${size}`;
    }
  }
}

function makeStackIconUrl(stack='nitrous') {
  return `https://nitrous-image-icons-update.s3.amazonaws.com/${stack}.png`;
}
