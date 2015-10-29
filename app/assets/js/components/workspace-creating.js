import React, { PropTypes } from 'react';
import Org from 'records/org';
import hostStore from 'stores/host-store';
import taskActions from 'actions/task-actions';
import EtaProgressBar from 'components/eta-progress-bar';

export default class WorkspaceCreating extends React.Component {
  displayName = 'WorkspaceCreating';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    org: PropTypes.instanceOf(Org)
  };

  static propTypes = {
    query: PropTypes.shape({
      hostSlug: PropTypes.string.isRequired
    })
  };

  state = {
    host: null,
    done: false,
    failed: false
  }

  componentDidMount() {
    hostStore.on('creating', this.onHostCreating);
    hostStore.on('created', this.onHostCreated);
    hostStore.on('create-failed', this.onHostCreateFailed);
  }

  componentWillUnmount() {
    hostStore.off('creating', this.onHostCreating);
    hostStore.off('created', this.onHostCreated);
    hostStore.off('create-failed', this.onHostCreateFailed);
  }

  onHostCreating = (data) => {
    const { hostSlug, stream } = data;
    if (hostSlug !== this.props.query.hostSlug) {
      return;
    }
    taskActions.update(this.taskId(), stream);
  }

  onHostCreated = (data) => {
    const { host } = data;
    taskActions.update(this.taskId(), 'Done!');
    taskActions.done(this.taskId());
    this.setState({ host, done: true });
    this.context.router.transitionTo('workspace', { hostSlug: host.slug });
  }

  onHostCreateFailed = () => {
    this.setState({ failed: true });
  }

  taskId() {
    return `host-creating-${this.props.query.hostSlug}`;
  }

  render() {
    const { done } = this.state,
          { hostSlug } = this.props.query;

    return (
      <div className='workspace-creating-component container'>
        <h2>Your new workspace &ldquo;{hostSlug}&rdquo; is being created...</h2>
        <p>This may take several minutes to complete.</p>
        <EtaProgressBar eta={200} done={done} />
      </div>
    );
  }
}
