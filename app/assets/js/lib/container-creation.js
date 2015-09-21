import { authedAjax }  from 'lib/ajax';
import dispatcher from 'app-dispatcher';
import imageActions from 'actions/image-actions';
import imageStore from 'stores/image-store';

export default class ContainerCreation {
  static _nextId = 0;

  _id = null;

  constructor(name, imageRepo, template, host, updateImage, privileged, publishAll) {
    this._id = this.constructor._nextId ++;
    this._name = name;
    this._imageRepo = imageRepo;
    this._template = template;
    this._host = host;
    this._updateImage = updateImage;
    this._privileged = privileged;
    this._publishAll = publishAll;
  }

  begin() {
    return new Promise((resolve, reject) => {
      this._checkCreateAllowed((createAllowed, jqxhr) => {
        if (createAllowed) {
          resolve();
          let imageId, onPulled, onPullFailed;

          onPulled = (id) => {
            if (id === imageId) {
              imageStore.off('pulled', onPulled);
              imageStore.off('pull-failed', onPullFailed);
            }

            this._create().then((data) => {
              dispatcher.dispatch({
                type: 'container.created',
                data: { data }
              });

            }).catch((jqxhr) => {
              this._fail(jqxhr);
            });
          };

          onPullFailed = (id) => {
            if (id === imageId) {
              imageStore.off('pulled', onPulled);
              imageStore.off('pull-failed', onPullFailed);
            }

            this._fail();
          };

          imageActions.pull(this._host.slug, this._imageRepo, this._updateImage).then((id) => {
            imageId = id;
            imageStore.on('pulled', onPulled);
            imageStore.on('pull-failed', onPullFailed);
          });
        } else {
          this._fail(jqxhr);
          reject(jqxhr);
        }
      });
    });
  }

  _fail(jqxhr) {
    dispatcher.dispatch({
      type: 'container.create-failed',
      data: {
        name: this._name,
        hostSlug: this._host.slug,
        jqxhr
      }
    });
  }

  _checkCreateAllowed(cb) {
    authedAjax({
      type: 'GET',
      url: `/api/v0/hosts/${this._host.slug}/can_create_containers`,
      dataType: 'json'
    }).then((data) => {
      cb(!!data.can_create);
    }).catch((jqxhr) => {
      cb(false, jqxhr);
    });
  }

  _create() {
    const data = {
      image: this._imageRepo,
      name: this._name,
      host: this._host.slug,
      privileged: this._privileged,
      publishAll: this._publishAll
    };

    if (this._template) {
      data.template = this._template.slug;
    }

    return authedAjax({
      type: 'POST',
      url: `/api/v0/containers`,
      dataType: 'json',
      data
    });
  }
}
