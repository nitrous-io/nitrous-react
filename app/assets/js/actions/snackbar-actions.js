import dispatcher from 'app-dispatcher';

class SnackbarActions {
  post(content) {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'snackbar.post',
        data: { content }
      });
    }, 1);
  }

  remove(id) {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'snackbar.remove',
        data: { id }
      });
    }, 1);
  }

  clear() {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'snackbar.clear'
      });
    }, 1);
  }
}

export default new SnackbarActions();
