import Store from 'stores/store';
import Image from 'records/image';
import { OrderedMap, OrderedSet } from 'immutable';
import taskActions from 'actions/task-actions';
import hostStore from 'stores/host-store';

class ImageStore extends Store {
  _images = OrderedMap(); // <K: id, V: Image>
  _idsByHostSlug = OrderedMap(); // <K: HostSlug, V: OrderedSet<id>>

  handleAction(action) {
    switch (action.type) {
      case 'image.fetched-all-by-host-slug': {
        const { data, hostSlug } = action.data;

        const images = OrderedMap(data.images.map(function(d) {
          const i = Image.deserialize(d);
          return [i.id, i];
        }));

        this._images = this._images.merge(images);
        this._idsByHostSlug = this._idsByHostSlug.merge(OrderedMap({
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
      case 'image.push-initiated': {
        const { id, repository } = action.data;

        taskActions.update(`image-push-${id}-${repository}`, `Pushing ${repository}...`);
        this.emit('push-initiated', { id, repository });
        break;
      }
      case 'image.removed': {
        const { id } = action.data;
        this._images = this._images.delete(id);
        this._idsByHostSlug = this._idsByHostSlug.map(function(set) {
          return set.delete(id);
        });
        this.emit('removed', { id });
        break;
      }
      case 'image.remove-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        this.emit('remove-failed', { id: action.data.id });
        break;
      }
      case 'image.push-failed': {
        const { id, repository } = action.data;

        this.handleErrorJqxhr(action.data.jqxhr);
        taskActions.fail(`image-push-${id}-${repository}`);
        this.emit('push-failed', { id, repository });
        break;
      }
      case 'image.pull-failed': {
        const { repository, jqxhr } = action.data;
        this.handleErrorJqxhr(jqxhr);
        this.emit('pull-failed', { repository });
        break;
      }
      case 'image.fetch-all-by-host-slug-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
        break;
      }
      // from events-socket
      case 'events:image.pulling': {
        const { id } = action.data,
              progress = JSON.parse(action.data.progress);

        const image = (this._images.get(id) || { repo: action.data.slug });

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

        if (progress.errorDetail) {
          this.handleErrorJqxhr({
            errorMessage: progress.errorDetail.message
          });
        }

        taskActions.update(`image-pull-${id}`, progressMessage, progressPercentage);
        // only emit if we have made some progress
        if (current || total) {
          this.emit('pulling', { id, repository: image.repo });
        }
        break;
      }
      case 'events:image.pulled': {
        const image = Image.deserialize(action.data.image),
              id = image.id;
        this._images = this._images.set(id, image);

        const host = hostStore.hostByHostId(image.hostId);
        if (host) {
          const hostSlug = host.slug,
                existingIds = this._idsByHostSlug.get(hostSlug);
          if (existingIds) {
            this._idsByHostSlug = this._idsByHostSlug.set(hostSlug, existingIds.merge([id]));
          } else {
            this._idsByHostSlug = this._idsByHostSlug.set(hostSlug, OrderedSet([id]));
          }
        }

        taskActions.done(`image-pull-${id}`);
        this.emit('pulled', { id, repository: image.repo });
        break;
      }
      case 'events:image.pull-failed': {
        const image = Image.deserialize(action.data.image),
              { id, repo }  = image;

        if (image.isBlank) {
          this._images = this._images.delete(id);
        } else {
          this._images = this._images.set(id, image);
        }
        taskActions.fail(`image-pull-${id}`);
        this.emit('pull-failed', { id, repository: repo });
        break;
      }
      case 'events:image.pushing': {
        const { id, repository } = action.data,
              progress = JSON.parse(action.data.progress);

        let progressPercentage;
        const { current, total } = progress.progressDetail || {};
        if (current != null && total != null) {
          progressPercentage = current / total * 100;
        }

        let progressMessage = `Pushing ${repository}`;
        if (progress.id && progress.status) {
          progressMessage += ` - ${progress.id}: ${progress.status}`;
        }
        progressMessage += '...';

        taskActions.update(`image-push-${id}-${repository}`, progressMessage, progressPercentage);
        break;
      }
      case 'events:image.pushed': {
        const image = Image.deserialize(action.data.image),
              { repository } = action.data;

        taskActions.done(`image-push-${image.id}-${repository}`);
        break;
      }
      case 'events:image.push-failed': {
        const image = Image.deserialize(action.data.image),
              { repository, error } = action.data;

        taskActions.fail(`image-push-${image.id}-${repository}`);
        this.emit('push-failed', { id: image.id, repository });

        if (error) {
          this.handleErrorJqxhr({
            errorMessage: error
          });
        }

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
    const ids = this._idsByHostSlug.get(hostSlug);
    return ids == null ? null : OrderedMap(ids.map((id) => {
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
      return i && !i.isSnapshot && !i.isBlank;
    });
  }
}

export default new ImageStore();
