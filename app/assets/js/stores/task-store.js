import Store from 'stores/store';
import { OrderedMap } from 'immutable';
import Task from 'records/task';

class TaskStore extends Store {
  _tasks = OrderedMap(); // <K: TaskId, V: Task>

  handleAction(action) {
    switch (action.type) {
      case 'task.update': {
        const task = new Task(action.data);
        this._tasks = this._tasks.set(task.id, task);
        break;
      }
      case 'task.remove': {
        const { id } = action.data;
        this._tasks = this._tasks.delete(id);
        break;
      }
      case 'task.done': {
        const { id } = action.data;
        let task = this._tasks.get(id);
        if (task) {
          // first, update progress to 100 to update UI
          task = task.set('progress', 100);
          this._tasks = this._tasks.set(id, task);
          // then schedule deletion and done callback
          window.setTimeout(() => {
            this._tasks = this._tasks.delete(id);
            this.notifyChange();
          }, 1);
        }
        break;
      }
      case 'task.fail': {
        const { id } = action.data;
        let task = this._tasks.get(id);
        if (task) {
          // first, update progress to -1 to update UI
          task = task.set('progress', -1);
          this._tasks = this._tasks.set(id, task);
          // then schedule deletion and fail callback
          window.setTimeout(() => {
            this._tasks = this._tasks.delete(id);
            this.notifyChange();
          }, 1);
        }
        break;
      }
      default: return;
    }
    this.notifyChange();
  }

  get tasks() {
    return this._tasks;
  }
}

export default new TaskStore();
