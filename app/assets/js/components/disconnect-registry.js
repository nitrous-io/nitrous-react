import React, { PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Host from 'records/host';
import Registry from 'records/registry';
import registryActions from 'actions/registry-actions';
import registryStore from 'stores/registry-store';

export default class DisconnectRegistry extends React.Component {
  displayName = 'DisconnectRegistry';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    registry: PropTypes.instanceOf(Registry).isRequired,
    showModal: PropTypes.bool.isRequired,
    onHideModal: PropTypes.func.isRequired
  };

  state = {
    disconnecting: false
  }

  componentDidMount() {
    registryStore.on('logged-out', this.handleRegistryLoggedOut);
    registryStore.on('logout-failed', this.handleRegistryLogoutFailed);
  }

  componentWillUnmount() {
    registryStore.off('logged-out', this.handleRegistryLoggedOut);
    registryStore.off('logout-failed', this.handleRegistryLogoutFailed);
  }

  componentWillReceiveProps() {
    this.setState({ disconnecting: false });
  }

  handleRegistryLoggedOut = (event) => {
    const { host } = this.props;

    if (host && host.slug !== event.hostSlug) {
      return;
    }

    this.props.onHideModal();
    this.setState({ disconnecting: false });
  }

  handleRegistryLogoutFailed = (event) => {
    const { host } = this.props;

    if (host && host.slug !== event.hostSlug) {
      return;
    }

    this.setState({ disconnecting: false });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const { id } = this.props.registry;
    registryActions.logout(this.props.host.slug, id);
    this.setState({ disconnecting: true });
  }

  render() {
    const { registry, showModal, onHideModal } = this.props,
          { disconnecting } = this.state,
          { displayName } = registry;

    return (
      <Modal show={showModal} onHide={onHideModal}>
        <Modal.Header>
          <Modal.Title>Disconnect from {displayName}</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <p>Are you sure you want to disconnect this registry?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={onHideModal}>Cancel</Button>
            <Button type='submit' disabled={disconnecting} bsStyle='danger'>{disconnecting ? 'Disconnecting' : 'Disconnect'}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
