import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import Org from 'records/org';
import hostStore from 'stores/host-store';
import hostActions from 'actions/host-actions';
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
    host: hostStore.liveHosts.get(this.props.query.hostSlug),
    done: false,
    failed: false
  }

  componentDidMount() {
    hostStore.onChange(this.hostStoreDidChange);
    hostActions.fetchOne(this.props.query.hostSlug);

    hostStore.on('creating', this.onHostCreating);
    hostStore.on('created', this.onHostCreated);
    hostStore.on('create-failed', this.onHostCreateFailed);
  }

  componentWillReceiveProps(nextProps) {
    const hostSlug = nextProps.query.hostSlug;
    if (this.props.query.hostSlug !== hostSlug) {
      this.setState({ host: hostStore.liveHosts.get(hostSlug) });
      hostActions.fetchOne(hostSlug);
    }
  }

  componentWillUnmount() {
    hostStore.offChange(this.hostStoreDidChange);
    hostStore.off('creating', this.onHostCreating);
    hostStore.off('created', this.onHostCreated);
    hostStore.off('create-failed', this.onHostCreateFailed);
  }

  hostStoreDidChange = () => {
    const host = hostStore.liveHosts.get(this.props.query.hostSlug);
    // Handle case where user goes back to this page after host was created.
    if (host && host.state !== 'born') {
      this.context.router.transitionTo('workspace', { hostSlug: host.slug });
    }
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
    if (this.props.query.hostSlug !== host.slug) {
      return;
    }

    taskActions.update(this.taskId(), 'Done!');
    taskActions.done(this.taskId());
    this.setState({ host, done: true });
    this.context.router.transitionTo('workspace', { hostSlug: host.slug });
  }

  onHostCreateFailed = (data) => {
    const { host } = data;
    if (this.props.query.hostSlug !== host.slug) {
      return;
    }
    this.setState({ failed: true });
    taskActions.fail(this.taskId());
  }

  taskId() {
    return `host-creating-${this.props.query.hostSlug}`;
  }

  render() {
    const { done, failed } = this.state,
          { hostSlug } = this.props.query,
          { org } = this.context;

    return (
      <div className='workspace-creating-component container'>
        <h2>Your new workspace &ldquo;{hostSlug}&rdquo; is being created...</h2>
        <p>This may take several minutes to complete.</p>
        {!failed ? (
          <EtaProgressBar eta={200} done={done} />
        ) : (
          <div>
            <EtaProgressBar eta={200} done bsStyle='danger' label='Failed to create workspace!' />
            {org ? (
              <Link className='btn btn-default' to='new-org-workspace' params={{ orgSlug: org.slug }}>Try again</Link>
            ) : (
              <Link className='btn btn-default' to='new-user-workspace'>Try again</Link>
            )}
          </div>
        )}
      </div>
    );
  }
}
