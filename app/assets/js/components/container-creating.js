import React, { PropTypes } from 'react';
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
        <div className='content'>
          {done ? (
            <div>
              <h2>Your project &ldquo;{name}&rdquo; is ready!</h2>
              <div className='buttons'>
                <a href={`/ide/#/${container.slug}`} className='primary' target='_blank'>Open IDE</a>
                <a href='#' onClick={this.handleBackBtn}>Back to Project List</a>
                <a href='https://community.nitrous.io/docs/installing-the-nitrogen-atom-plugin-d9a97d12-b6ab-4ad2-b219-45f05451d692' target='_blank'>Install Nitrogen</a>
              </div>
            </div>
          ) : (
            <div>
              <h2>Your new project &ldquo;{name}&rdquo; is being created...</h2>
              <p>This may take several minutes to complete.</p>
              <div className='bar'>
                <div className='progress'></div>
              </div>
              <p>(The process will continue even if you leave the page.)</p>
            </div>
          )}

          <h3>Getting Started</h3>
          <ul>
            <li><a href={snapshotURL} target='_blank'>Snapshot a Project</a></li>
            <li><a href={editCodeURL} target='_blank'>Editing Code on a New Project</a></li>
            <li><a href={previewAppURL} target='_blank'>Previewing Your Application</a></li>
          </ul>
        </div>

        <div className='hero'>
          <div className='image'></div>
        </div>
      </div>
    );
  }
}
