import dispatcher from 'app-dispatcher';

class TaskActions {
  update(id, description, progress) {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'task.update',
        data: { id, description, progress }
      });
    }, 1);
  }

  remove(id) {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'task.remove',
        data: { id }
      });
    }, 1);
  }

  done(id) {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'task.done',
        data: { id }
      });
    }, 1);
  }

  fail(id) {
    window.setTimeout(function() {
      dispatcher.dispatch({
        type: 'task.fail',
        data: { id }
      });
    }, 1);
  }
}

export default new TaskActions();
