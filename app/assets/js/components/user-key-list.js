import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Container from 'records/container';
import Host from 'records/host';
import UserKey from 'records/user-key';
import hostStore from 'stores/host-store';
import userKeyStore from 'stores/user-key-store';
import hostActions from 'actions/host-actions';
import userKeyActions from 'actions/user-key-actions';
import { Alert, Button, Input, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import Fa from 'components/fa';
import LoadingIndicator from 'components/loading-indicator';
import UserKeyListItem from 'components/user-key-list-item';

export default class UserKeyList extends React.Component {
  displayName = 'UserKeyList';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Container).isRequired
  };

  static propTypes = {
    userKeys: ImmutablePropTypes.setOf(PropTypes.instanceOf(UserKey)),
    host: PropTypes.instanceOf(Host),
    shared: PropTypes.bool
  };

  static defaultProps = {
    userKeys: null,
    host: null,
    shared: false
  };

  state = {
    host: this.props.host,
    newUserKey: null,
    showModal: false,
    registering: false,
    registerFailed: false
  };

  componentDidMount() {
    userKeyStore.on('created', this.onUserKeyCreated);
    userKeyStore.on('create-failed', this.onUserKeyCreateFailed);

    // If the `host` props is not specified (e.g. if this is a shared
    // container), we fetch it.
    if (!this.props.host) {
      hostStore.onChange(this.hostStoreDidChange);
      hostActions.fetchOne(this.context.container.hostId);
    }
  }

  componentWillUnmount() {
    userKeyStore.off('created', this.onUserKeyCreated);
    userKeyStore.off('create-failed', this.onUserKeyCreateFailed);
    hostStore.offChange(this.hostStoreDidChange);
  }

  onUserKeyCreated = (data) => {
    const { container, key } = data;
    if ((this.context.container.slug === container.slug)
      && (this.state.newUserKey === key)) {
      this.setState({ registering: false, newUserKey: null });
      this.hideModal();
      userKeyActions.fetchAllByContainerSlug(container.slug);
    }
  }

  onUserKeyCreateFailed = (data) => {
    const { container, key } = data;
    if ((this.context.container.slug === container.slug)
      && (this.state.newUserKey === key)) {
      this.setState({ registering: false, registerFailed: true });
    }
  }

  hostStoreDidChange = () => {
    const host = hostStore.hostByHostId(this.context.container.hostId);
    this.setState({ host });
  }

  handleNewUserKeyChanged = () => {
    this.setState({
      newUserKey: this.refs.newUserKeyField.getValue(),
      registerFailed: false
    });
  }

  handleRegisterModalCancel = () => {
    this.hideModal();
  }

  handleClickRegister = () => {
    this.setState({ showModal: true }, () => {
      this.refs.newUserKeyField.getInputDOMNode().focus();
    });
  }

  handleRegisterModalOK = () => {
    this.setState({ registering: true });
    userKeyActions.register(this.context.container, this.state.newUserKey);
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { userKeys, shared } = this.props,
          { host, newUserKey, showModal, registering, registerFailed } = this.state,
          loading = shared && !host;

    if (loading) {
      return (
        <div className='user-key-list-component'>
          <LoadingIndicator />
        </div>
      );
    }

    if (host.free) {
      return (
        <div className='user-key-list-component'>
          <Alert bsStyle='info'>
            {shared ? (
              <p><Fa icon='info-circle' /> You do not have SSH access to this shared project because the owner is a free user.</p>
            ) : (
              <p><Fa icon='info-circle' /> SSH access to your project is only available to paid users.</p>
            )}
          </Alert>
        </div>
      );
    }

    return (
      <div className='user-key-list-component'>
        <p className='hint'> <Fa icon='info-circle' /> Register public keys from your machine so you can access your project via SSH.</p>
        {userKeys && userKeys.size > 0 ? (
          <ListGroup>
            {userKeys.map((key) => {
              return (
                <ListGroupItem key={`userkey-${key.id}`}>
                  <UserKeyListItem userKey={key} />
                </ListGroupItem>
              );
            })}
          </ListGroup>
        ) : (
          <Alert bsStyle='warning'><p>There are no public keys registered with your project.</p></Alert>
        )}

        <Button bsStyle='default' onClick={this.handleClickRegister}>
          Register Key...
        </Button>

        <Modal show={showModal} onHide={this.hideModal}>
          <Modal.Header>
            <Modal.Title>Register New User Public Key</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label htmlFor='new-user-key-field'>Public Key</label>
            <Input ref='newUserKeyField' id='new-user-key-field'
              type='textarea' rows='5'
              disabled={registering}
              value={newUserKey}
              bsStyle={registerFailed ? 'error' : ''}
              onChange={this.handleNewUserKeyChanged} />
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={this.handleRegisterModalCancel}>Cancel</Button>
            <Button bsStyle='primary'
              disabled={registering}
              onClick={registering ? null : this.handleRegisterModalOK}>
              {registering ? 'Registering...' : 'Register Key'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
