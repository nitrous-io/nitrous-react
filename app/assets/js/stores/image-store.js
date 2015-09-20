import Store from 'stores/store';
import Image from 'records/image';
import { OrderedMap } from 'immutable';

class ImageStore extends Store {
  _images = OrderedMap(); // <K: ImageRepo, V: Image>
  _imageReposByHostSlug = OrderedMap(); // <K: HostSlug, V: OrderedSet<ImageRepo>>

  handleAction(action) {
    switch (action.type) {
      case 'image.fetched-all-by-host-slug': {
        const { data, hostSlug } = action.data;

        const images = OrderedMap(data.images.map(function(d) {
          const i = Image.deserialize(d);
          return [i.repo, i];
        }));

        this._images = this._images.merge(images);
        this._imageReposByHostSlug = this._imageReposByHostSlug.merge(OrderedMap({
          [hostSlug]: images.keySeq().toOrderedSet() // list of keys == list of image repos
        }));
        this._lastError = null;
        break;
      }
      case 'image.fetch-all-by-host-slug-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
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
    const imageRepos = this._imageReposByHostSlug.get(hostSlug);
    return imageRepos == null ? null : OrderedMap(imageRepos.map((repo) => {
      return [repo, this._images.get(repo)];
    }));
  }

  snapshotsByHostSlug(hostSlug) {
    const images = this.imagesByHostSlug(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return i.isSnapshot;
    });
  }

  otherImagesByHostSlug(hostSlug) {
    const images = this.imagesByHostSlug(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return !i.isSnapshot;
    });
  }
}

export default new ImageStore();
