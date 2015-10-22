import React, { PropTypes } from 'react';
import TimeAgo from 'react-timeago';
import Container from 'records/container';
import UserKey from 'records/user-key';
import userKeyStore from 'stores/user-key-store';
import userKeyActions from 'actions/user-key-actions';
import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import Fa from 'components/fa';

export default class UserKeyListItem extends React.Component {
  displayName = 'UserKeyListItem';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Container).isRequired
  };

  static propTypes = {
    userKey: PropTypes.instanceOf(UserKey).isRequired
  };

  state = {
    showModal: false,
    deleting: false
  };

  componentDidMount() {
    userKeyStore.on('deleted', this.onUserKeyDeleted);
  }

  componentWillUnmount() {
    userKeyStore.off('deleted', this.onUserKeyDeleted);
  }

  onUserKeyDeleted = (data) => {
    const { container, userKey } = data;
    if ((this.context.container.slug === container.slug)
      && (this.props.userKey.fingerprint === userKey.fingerprint)) {
      this.hideModal();
    }
  }

  handleDelete = () => {
    this.setState({ showModal: true }, () => {
      const modalCancel = this.refs.modalCancel.getDOMNode();
      modalCancel.focus();
    });
  }

  handleDeleteModalCancel = () => {
    this.hideModal();
  }

  handleDeleteModalOK = () => {
    this.setState({ deleting: true });
    userKeyActions.delete(this.context.container, this.props.userKey);
    // TODO Handle delete failure.
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { userKey } = this.props,
          { deleting } = this.state;

    return (
      <div className='user-key-list-item-component'>
        <Grid>
          <Row>
            <Col lg={11} md={11} sm={11} xs={12} className='content'>
              <h4>{userKey.displayName}</h4>
              <p className='hint'>Added <TimeAgo date={userKey.createdAt} /></p>
            </Col>

            <Col lg={1} md={1} sm={1} xs={12} className='actions'>
              <Button bsStyle='warning' className='pull-right' onClick={this.handleDelete}>
                <Fa icon='trash' />
              </Button>
            </Col>
          </Row>
        </Grid>

        <Modal show={this.state.showModal} onHide={this.hideModal}>
          <Modal.Header>
            <Modal.Title>Delete User Public Key</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to remove the following public key from your container?</p>
            <p><strong>{userKey.displayName}</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Button ref='modalCancel' onClick={this.handleDeleteModalCancel}>Cancel</Button>
            <Button bsStyle='danger'
              disabled={deleting}
              onClick={deleting ? null : this.handleDeleteModalOK}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
