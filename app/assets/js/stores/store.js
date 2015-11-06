import { EventEmitter } from 'events';
import dispatcher from 'app-dispatcher';
import snackbarActions from 'actions/snackbar-actions';

export default class Store extends EventEmitter {
  _dispatchToken = null;
  _lastError = null;

  constructor() {
    super();
    this._dispatchToken = dispatcher.register((action) => {
      this.handleAction(action);
      return true;
    });
  }

  // override me
  handleAction(action) {
    switch (action.type) {
      default: return;
    }
    this.notifyChange();
  }

  handleErrorJqxhr(jqxhr) {
    const { responseJSON } = jqxhr;
    if (responseJSON && ['invalid_token', 'confirmation_lapsed'].includes(responseJSON.error)) {
      return;
    }

    const err = this._lastError = jqxhr.errorMessage;
    if (err === 'internal_server_error') {
      return;
    }
    if (err) {
      snackbarActions.post(err);
    }
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

  off = this.removeListener;

  get dispatchToken() {
    return this._dispatchToken;
  }

  get lastError() {
    return this._lastError;
  }
}
