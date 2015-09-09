import Store from 'stores/store';
import Image from 'records/image';
import { OrderedMap, Map } from 'immutable';

class ImageStore extends Store {
  _images = OrderedMap();
  _imagesByHostSlug = Map();

  handleAction(action) {
    switch (action.type) {
      case 'image.fetched-all-by-host-slug': {
        const images = OrderedMap(action.data.images.map(function(d) {
          const i = Image.deserialize(d);
          return [i.repo, i];
        }));
        this._images = this._images.merge(images);
        this._imagesByHostSlug = this._imagesByHostSlug.merge(Map({
          [action.hostSlug]: images
        }));
        this._lastError = null;
        break;
      }
      case 'image.fetch-all-by-host-slug-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get images() {
    return this._images;
  }

  imagesByHostSlug(hostSlug) {
    const images = this._imagesByHostSlug.get(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return i.id;
    });
  }

  snapshotsByHostSlug(hostSlug) {
    const images = this._imagesByHostSlug.get(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return i.id && i.isSnapshot;
    });
  }

  otherImagesByHostSlug(hostSlug) {
    const images = this._imagesByHostSlug.get(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return i.id && !i.isSnapshot;
    });
  }
}

export default new ImageStore();
