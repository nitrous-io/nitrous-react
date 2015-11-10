import React, { PropTypes } from 'react';
import Collaborator from 'records/collaborator';
import Container from 'records/container';
import collaboratorActions from 'actions/collaborator-actions';
import collaboratorStore from 'stores/collaborator-store';
import snackbarActions from 'actions/snackbar-actions';
import userStore from 'stores/user-store';
import { Grid, Row, Col, Button, Modal, Label } from 'react-bootstrap';
import TimeAgo from 'react-timeago';
import Fa from 'components/fa';

export default class CollaboratorListItem extends React.Component {
  displayName = 'CollaboratorListItem';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static propTypes = {
    collaborator: PropTypes.instanceOf(Collaborator).isRequired,
    container: PropTypes.instanceOf(Container).isRequired,
    shared: PropTypes.bool
  };

  state = {
    user: userStore.user,
    showRemoveModal: false,
    removing: false,
    showLeaveModal: false,
    leaving: false
  };

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    collaboratorStore.on('removed', this.onCollaboratorRemoved);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    collaboratorStore.off('removed', this.onCollaboratorRemoved);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  onCollaboratorRemoved = (data) => {
    const { container, collaboratorUserId } = data;
    if ((this.props.container.slug !== container.slug)
      || (this.props.collaborator.userId !== collaboratorUserId)) {
      return;
    }

    if (this.state.removing) {
      this.hideRemoveModal();
      this.setState({ removing: false });
      return;
    }

    if (this.state.leaving) {
      snackbarActions.post(`You left the ${container.slug} project.`);
      this.setState({ leaving: false });
      this.context.router.transitionTo('shared-containers');
      return;
    }
  }

  handleRemove = () => {
    this.setState({ showRemoveModal: true });
  }

  handleRemoveModalCancel = () => {
    this.setState({ showRemoveModal: false });
  }

  handleRemoveModalOK = () => {
    this.setState({ removing: true });
    collaboratorActions.remove(this.props.container, this.props.collaborator.id);
  }

  hideRemoveModal = () => {
    this.setState({ showRemoveModal: false });
  }

  handleLeave = () => {
    this.setState({ showLeaveModal: true });
  }

  handleLeaveModalCancel = () => {
    this.setState({ showLeaveModal: false });
  }

  handleLeaveModalOK = () => {
    this.setState({ leaving: true });
    collaboratorActions.remove(this.props.container, this.props.collaborator.id);
  }

  hideLeaveModal = () => {
    this.setState({ showLeaveModal: false });
  }

  render() {
    const { collaborator, container, shared } = this.props,
          { user, removing, leaving } = this.state,
          isOwner = (container.userId === collaborator.userId),
          isSelf = (user.id === collaborator.userId);

    return (
      <div className='collaborator-list-item-component'>
        <Grid>
          <Row>
            <Col lg={1} md={1} sm={1} xs={2} className='user-avatar'>
              <img className='gravatar' src={collaborator.gravatar(72)} />
            </Col>
            <Col lg={10} md={10} sm={10} xs={10} className='collaborator-name'>
              <strong>{collaborator.displayName}</strong>
              {collaborator.pending ? (
                <span> (pending)</span>
              ) : ''}

              {shared && isSelf ? (
                <Label bsStyle='success'>You</Label>
              ): ''}

              {isOwner ? (
                <Label bsStyle='info'>Owner</Label>
              ) : (
                <span className='hint hidden-xs'>Added <TimeAgo date={collaborator.createdAt} /></span>
              )}
            </Col>

            <Col lg={1} md={1} sm={1} xs={12} className='actions'>
              {!shared ? (
                <Button bsStyle='default' className='pull-right' onClick={this.handleRemove}>
                  <Fa icon='sign-out' />
                  <span>Remove from Project</span>
                </Button>
              ) : ''}

              {shared && isSelf ? (
                <Button bsStyle='default' className='pull-right' onClick={this.handleLeave}>
                  <Fa icon='sign-out' />
                  <span>Leave Project</span>
                </Button>
              ) : ''}
            </Col>
          </Row>
        </Grid>

        <Modal show={this.state.showRemoveModal} onHide={this.hideRemoveModal}>
          <Modal.Header>
            <Modal.Title>Remove Collaborator</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>{collaborator.displayName}</strong> will no longer have access to <strong>{container.slug}</strong>.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleRemoveModalCancel}>Cancel</Button>
            <Button bsStyle='danger'
              disabled={removing}
              onClick={removing ? null : this.handleRemoveModalOK}>
              {removing ? 'Removing...' : 'Remove from Project'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showLeaveModal} onHide={this.hideLeaveModal}>
          <Modal.Header>
            <Modal.Title>Leave Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You will no longer have access to <strong>{container.slug}</strong>.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleLeaveModalCancel}>Cancel</Button>
            <Button bsStyle='danger'
              disabled={leaving}
              onClick={leaving ? null : this.handleLeaveModalOK}>
              {leaving ? 'Leaving...' : 'Leave this Project'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
