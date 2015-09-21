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
      name: PropTypes.string.isRequired
    })
  };

  state = {
    done: false
  }

  componentDidMount() {
    containerStore.on('created', this.onContainerCreated);
    containerStore.on('create-failed', this.onContainerCreateFailed);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if ((this.props.query.name !== nextProps.query.name) || (this.context.host !== nextContext.host)) {
      this.setState({ done: false });
    }
  }

  componentWillUnmount() {
    containerStore.off('created', this.onContainerCreated);
    containerStore.off('create-failed', this.onContainerCreateFailed);
  }

  onContainerCreated = (data) => {
    const { name, hostSlug } = data;
    if ((this.props.query.name === name) && (this.context.host.slug === hostSlug)) {
      // this can trip up if there is another container created with the same name,
      // but we should really make container names unique (scoped to host) anyway
      this.setState({ done: true });
    }
  };

  onContainerCreateFailed = (data) => {
    const { name, hostSlug } = data;
    if ((this.props.query.name === name) && (this.context.host.slug === hostSlug)) {
      this.context.router.transitionTo('containers', { hostSlug: this.context.host.slug });
    }
  };

  handleBackBtn = () => {
    this.context.router.transitionTo('containers', { hostSlug: this.context.host.slug });
  };

  handleOpenIdeBtn = () => {
    window.alert('Not Implemented!');
  };

  render() {
    const { name } = this.props.query,
          { done } = this.state;

    return (
      <div className='container-creating-component'>
        {done ? (
          <div className='container done'>
            <h2>Your container &ldquo;{name}&rdquo; is ready!</h2>
            <ButtonToolbar>
              <Button onClick={this.handleBackBtn}>Back to Project List</Button>
              <Button bsStyle='primary' onClick={this.handleOpenIdeBtn}>Open IDE</Button>
            </ButtonToolbar>
          </div>
        ) : (
          <div className='container creating'>
            <h2>Your new container &ldquo;{name}&rdquo; is being created...</h2>
            <p>This may take several minutes to complete.</p>
            <EtaProgressBar eta={200} done={done} />
          </div>
        )}
      </div>
    );
  }
}
