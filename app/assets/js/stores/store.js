import { EventEmitter } from 'events';
import dispatcher from 'app-dispatcher';

export default class Store extends EventEmitter {
  _dispatchToken = null;
  _lastError = null;

  constructor() {
    super();
    this._dispatchToken = dispatcher.register(this.handleAction.bind(this));
  }

  // override me
  handleAction(action) {
    switch (action.type) {
      default: return;
    }
    this.notifyChange();
  }

  notifyChange() {
    this.emit('change');
  }

  onChange(fn) {
    this.on('change', fn);
  }

  offChange(fn) {
    this.removeListener('change', fn);
  }

  get dispatchToken() {
    return this._dispatchToken;
  }

  get lastError() {
    return this._lastError;
  }
}
