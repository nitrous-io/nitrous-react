import React, { PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';
import Task from 'records/task';
import classNames from 'classnames';

export default class TaskListItem extends React.Component {
  displayName = 'TaskListItem';

  static propTypes = {
    task: PropTypes.instanceOf(Task).isRequired,
    index: PropTypes.number.isRequired
  };

  state = {
    hidden: false
  };

  handleClick = () => {
    this.setState({ hidden: !this.state.hidden });
  };

  render() {
    const { task } = this.props,
          { hidden } = this.state,
          itemHeight = 61,
          margin = 15;

    let barStyle = 'default';
    if (task.progress === 100) {
      barStyle = 'success';
    } else if (task.progress === -1) {
      barStyle = 'danger';
    }

    const barProgress = task.progress === -1 ? 100 : task.progress,
          indeterminate = task.progress == null;

    return (
      <li className={classNames('task-list-item-component', 'popover', { hidden })}
        style={{ bottom: (itemHeight + margin) * this.props.index }}
        onClick={this.handleClick}>
        <div className='popover-content'>
          <p className='task-description'>{task.description}</p>
          <ProgressBar now={barProgress} bsStyle={barStyle} active={indeterminate} />
        </div>
      </li>
    );
  }
}
