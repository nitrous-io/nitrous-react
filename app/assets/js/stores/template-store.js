import Store from 'stores/store';
import Template from 'records/template';
import { OrderedMap } from 'immutable';

class TemplateStore extends Store {
  _templates = OrderedMap();

  handleAction(action) {
    switch (action.type) {
      case 'template.fetched-all': {
        this._templates = OrderedMap(action.data.templates.map(function(d) {
          const t = Template.deserialize(d);
          return [t.slug, t];
        }));
        this._lastError = null;
        break;
      }
      case 'template.fetch-all-failed': {
        this._lastError = action.data.errorMessage;
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get templates() {
    return this._templates;
  }
}

export default new TemplateStore();
