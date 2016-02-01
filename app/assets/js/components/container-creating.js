import React, { PropTypes } from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import EtaProgressBar from 'components/eta-progress-bar';
import Host from 'records/host';
import containerStore from 'stores/container-store';

export default class ContainerCreating extends React.Component {
  displayName = 'ContainerCreating';

  static contextTypes = {
    router: PropTypes.func.isRequired, // Router.PropTypes.router.isRequired
    host: PropTypes.instanceOf(Host).isRequired
  };

  static propTypes = {
    query: PropTypes.shape({
      name: PropTypes.string.isRequired,
      requestId: PropTypes.string.isRequired
    })
  };

  state = {
    container: null,
    done: false
  }

  componentDidMount() {
    containerStore.on('created', this.onContainerCreated);
    containerStore.on('create-failed', this.onContainerCreateFailed);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if ((this.props.query.name !== nextProps.query.name)
      || (this.props.query.requestId !== nextProps.query.requestId)
      || (this.context.host !== nextContext.host)) {
      this.setState({ done: false });
    }
  }

  componentWillUnmount() {
    containerStore.off('created', this.onContainerCreated);
    containerStore.off('create-failed', this.onContainerCreateFailed);
  }

  onContainerCreated = (data) => {
    const { container, hostSlug, requestId } = data;
    if (this.props.query.name === container.name
      &&  this.context.host.slug === hostSlug
      && this.props.query.requestId === requestId) {
      this.setState({ container, done: true });
    }
  };

  onContainerCreateFailed = (data) => {
    const { name, hostSlug, requestId } = data;
    if (this.props.query.name === name
        && this.context.host.slug === hostSlug
        && this.props.query.requestId === requestId) {
      this.context.router.transitionTo('containers', { hostSlug: this.context.host.slug });
    }
  };

  handleBackBtn = () => {
    this.context.router.transitionTo('containers', { hostSlug: this.context.host.slug });
  };

  render() {
    const { name } = this.props.query,
          { container, done } = this.state,
          communityURL = 'https://community.nitrous.io',
          snapshotURL = communityURL + '/docs/snapshots',
          editCodeURL = communityURL + '/docs/edit-your-code',
          previewAppURL = communityURL + '/docs/preview-your-app';

    return (
      <div className='container-creating-component'>
        {done ? (
          <div className='container done'>
            <h2>Your project &ldquo;{name}&rdquo; is ready!</h2>
            <ButtonToolbar>
              <Button onClick={this.handleBackBtn}>Back to Project List</Button>
              <a href={`/ide/#/${container.slug}`} className='btn btn-primary' target='_blank'>Open IDE</a>
            </ButtonToolbar>
          </div>
        ) : (
          <div className='container creating'>
            <h2>Your new container &ldquo;{name}&rdquo; is being created...</h2>
            <p>This may take several minutes to complete.</p>
            <EtaProgressBar eta={200} done={done} />
          </div>
        )}

        <div className='container tutorial-links'>
          <h2>Getting Started</h2>
          <ul>
            <li><a href={snapshotURL} target='_blank'>Snapshot a Project</a></li>
            <li><a href={editCodeURL} target='_blank'>Editing Code on a New Project</a></li>
            <li><a href={previewAppURL} target='_blank'>Previewing Your Application</a></li>
          </ul>
        </div>
      </div>
    );
  }
}
