import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Container from 'records/container';
import Host from 'records/host';
import UserKey from 'records/user-key';
import userKeyStore from 'stores/user-key-store';
import userKeyActions from 'actions/user-key-actions';
import { Alert, Button, Input, ListGroup, ListGroupItem, Modal } from 'react-bootstrap';
import Fa from 'components/fa';
import UserKeyListItem from 'components/user-key-list-item';

export default class UserKeyList extends React.Component {
  displayName = 'UserKeyList';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host),
    container: PropTypes.instanceOf(Container).isRequired
  };

  static propTypes = {
    userKeys: ImmutablePropTypes.setOf(PropTypes.instanceOf(UserKey))
  };

  state = {
    newUserKey: null,
    showModal: false,
    registering: false
  };

  componentDidMount() {
    userKeyStore.on('created', this.onUserKeyCreated);
    userKeyStore.on('create-failed', this.onUserKeyCreateFailed);
  }

  componentWillUnmount() {
    userKeyStore.off('created', this.onUserKeyCreated);
    userKeyStore.off('create-failed', this.onUserKeyCreateFailed);
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
      this.setState({ registering: false });
    }
  }

  handleNewUserKeyChanged = () => {
    this.setState({ newUserKey: this.refs.newUserKeyField.getValue() });
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
    const { userKeys } = this.props,
          { host } = this.context,
          { newUserKey, showModal, registering } = this.state;

    return (
      <div className='user-key-list-component'>
        {host.free ? (
          <Alert bsStyle='info'><Fa icon='info-circle' /> SSH access to your container is only available to paid users. If you are sharing a container, the owner of the container has to be a paying user.</Alert>
        ) : (
          <div>
            <p className='hint'> <Fa icon='info-circle' /> Register public keys from your machine so you can access your container via SSH.</p>
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
              <Alert bsStyle='warning'><p>There are no public keys registered with your container.</p></Alert>
            )}

            <Button bsStyle='default' onClick={this.handleClickRegister}>
              Register Key...
            </Button>

            <Modal show={showModal} onHide={this.hideModal}>
              <Modal.Header>
                <Modal.Title>Register New User Public Key</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Input ref='newUserKeyField' type='textarea' rows='4' disabled={registering} value={newUserKey} onChange={this.handleNewUserKeyChanged} />
              </Modal.Body>
              <Modal.Footer>
                <Button ref='modalCancel' onClick={this.handleRegisterModalCancel}>Cancel</Button>
                <Button bsStyle='danger'
                  disabled={registering}
                  onClick={registering ? null : this.handleRegisterModalOK}>
                  {registering ? 'Registering...' : 'Register Key'}
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </div>
    );
  }
}
