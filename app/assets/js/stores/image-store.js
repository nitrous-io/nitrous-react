import Store from 'stores/store';
import Image from 'records/image';
import { OrderedMap } from 'immutable';
import taskActions from 'actions/task-actions';

class ImageStore extends Store {
  _images = OrderedMap(); // <K: ImageId, V: Image>
  _imageIdsByHostSlug = OrderedMap(); // <K: HostSlug, V: OrderedSet<ImageId>>

  handleAction(action) {
    switch (action.type) {
      case 'image.fetched-all-by-host-slug': {
        const { data, hostSlug } = action.data;

        const images = OrderedMap(data.images.map(function(d) {
          const i = Image.deserialize(d);
          return [i.id, i];
        }));

        this._images = this._images.merge(images);
        this._imageIdsByHostSlug = this._imageIdsByHostSlug.merge(OrderedMap({
          [hostSlug]: images.keySeq().toOrderedSet() // list of keys == list of image ids
        }));
        this._lastError = null;
        break;
      }
      case 'image.pull-initiated': {
        const { data } = action.data,
              image = Image.deserialize(data.image),
              { id, repo } = image;

        this._images = this._images.set(id, image);

        taskActions.update(`image-pull-${id}`, `Pulling ${repo}...`);
        break;
      }
      case 'image.removed': {
        const { id } = action.data;
        this._images = this._images.delete(id);
        this._imageIdsByHostSlug = this._imageIdsByHostSlug.map(function(set, id) {
          return set.delete(id);
        });
        break;
      }
      case 'image.fetch-all-by-host-slug-failed':
      case 'image.pull-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
      }
      // from events-socket
      case 'events:image.pulling': {
        const { id } = action.data,
              image = this._images.get(id),
              progress = JSON.parse(action.data.progress);

        let progressPercentage;
        const { current, total } = progress.progressDetail || {};
        if (current != null && total != null) {
          progressPercentage = current / total * 100;
        }

        let progressMessage = `Pulling ${image.repo}`;
        if (progress.id && progress.status) {
          progressMessage += ` - ${progress.id}: ${progress.status}`;
        }
        progressMessage += '...';

        taskActions.update(`image-pull-${id}`, progressMessage, progressPercentage);
        break;
      }
      case 'events:image.pulled': {
        const image = Image.deserialize(action.data.image),
              id = image.id;
        this._images = this._images.set(id, image);
        taskActions.done(`image-pull-${id}`);
        this.emit('pulled', id);
        break;
      }
      case 'events:image.pull-failed': {
        const image = Image.deserialize(action.data.image),
              id = image.id;
        if (image.isBlank) {
          this._images = this._images.delete(id);
        } else {
          this._images = this._images.set(id, image);
        }
        taskActions.fail(`image-pull-${id}`);
        this.emit('pull-failed', id);
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
    const imageIds = this._imageIdsByHostSlug.get(hostSlug);
    return imageIds == null ? null : OrderedMap(imageIds.map((id) => {
      return [id, this._images.get(id)];
    }));
  }

  snapshotsByHostSlug(hostSlug) {
    const images = this.imagesByHostSlug(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return i.isSnapshot && !i.isBlank;
    });
  }

  otherImagesByHostSlug(hostSlug) {
    const images = this.imagesByHostSlug(hostSlug);
    return images == null ? null : images.filter(function(i) {
      return !i.isSnapshot && !i.isBlank;
    });
  }
}

export default new ImageStore();
