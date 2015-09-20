import React from 'react';
import TaskListItem from 'components/task-list-item';
import taskStore from 'stores/task-store';
import TimeoutTransitionGroup from 'timeout-transition-group';

export default class Tasks extends React.Component {
  displayName = 'Tasks';

  state = {
    tasks: taskStore.tasks
  };

  componentDidMount() {
    taskStore.onChange(this.taskStoreDidChange);
  }

  componentWillUnmount() {
    taskStore.offChange(this.taskStoreDidChange);
  }

  taskStoreDidChange = () => {
    this.setState({ tasks: taskStore.tasks });
  }

  render() {
    const { tasks } = this.state;

    return (
      <div className='tasks-component'>
        <TimeoutTransitionGroup transitionName='el' enterTimeout={301} leaveTimeout={301} component='ul'>
          {tasks ? tasks.toList().map((task, i) => {
            return (
              <TaskListItem key={`task-${task.id}`} task={task} index={i} />
            );
          }) : ''}
        </TimeoutTransitionGroup>
      </div>
    );
  }
}
