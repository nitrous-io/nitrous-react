import { EventEmitter } from 'events';
import dispatcher from 'app-dispatcher';
import snackbarActions from 'actions/snackbar-actions';
import stringUtil from 'lib/string-util';

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

  handleErrorJqxhr(jqxhr, fallbackError) {
    const { responseJSON } = jqxhr;
    if (responseJSON && ['invalid_token', 'confirmation_lapsed'].includes(responseJSON.error)) {
      return;
    }

    const err = this._lastError = jqxhr.errorMessage;
    if (err && err !== 'internal_server_error' && err !== '0 error') {
      const errMsg = stringUtil.capitalize(err);
      snackbarActions.post(errMsg, 'error');
    } else if (fallbackError) {
      const fallbackErrMsg = stringUtil.capitalize(fallbackError);
      snackbarActions.post(fallbackErrMsg, 'error');
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
