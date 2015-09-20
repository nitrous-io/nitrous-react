import Store from 'stores/store';
import Template from 'records/template';
import { OrderedMap } from 'immutable';

class TemplateStore extends Store {
  _templates = OrderedMap(); // <K: TemplateSlug, V: Template>

  handleAction(action) {
    switch (action.type) {
      case 'template.fetched-all': {
        const { data } = action.data;
        this._templates = OrderedMap(data.templates.map(function(d) {
          const t = Template.deserialize(d);
          return [t.slug, t];
        }));
        this._lastError = null;
        break;
      }
      case 'template.fetch-all-failed': {
        this.handleErrorJqxhr(action.data.jqxhr);
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
