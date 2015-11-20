import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Collaborator from 'records/collaborator';
import Container from 'records/container';
import collaboratorActions from 'actions/collaborator-actions';
import collaboratorStore from 'stores/collaborator-store';
import userStore from 'stores/user-store';
import snackbarActions from 'actions/snackbar-actions';
import { Button, Input, Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import CollaboratorListItem from 'components/collaborator-list-item';

export default class CollaboratorList extends React.Component {
  displayName = 'CollaboratorList';

  static contextTypes = {
    router: PropTypes.func.isRequired
  }

  static propTypes = {
    collaborators: ImmutablePropTypes.setOf(PropTypes.instanceOf(Collaborator)),
    container: PropTypes.instanceOf(Container).isRequired,
    shared: PropTypes.bool
  }

  state = {
    user: userStore.user,
    newCollaborator: null,
    adding: false,
    addFailed: false,
    showCollabLimitModal: false
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    collaboratorStore.on('added', this.onCollaboratorAdded);
    collaboratorStore.on('add-failed', this.onCollaboratorAddFailed);
    collaboratorStore.on('removed', this.onCollaboratorRemoved);
    collaboratorStore.on('collab-limit-reached', this.onCollaboratorLimitReached);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    collaboratorStore.off('added', this.onCollaboratorAdded);
    collaboratorStore.off('add-failed', this.onCollaboratorAddFailed);
    collaboratorStore.off('removed', this.onCollaboratorRemoved);
    collaboratorStore.off('collab-limit-reached', this.onCollaboratorLimitReached);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  onCollaboratorAdded = (data) => {
    const { container } = data;
    if (this.props.container.slug !== container.slug) {
      return;
    }

    if (this.state.adding) {
      this.setState({ adding: false, newCollaborator: null });
    }

    collaboratorActions.fetchAllByContainerSlug(this.props.container.slug);
  }

  onCollaboratorAddFailed = (data) => {
    const { container, collaborator } = data;
    if ((this.props.container.slug === container.slug)
      && (this.state.newCollaborator === collaborator)) {
      this.setState({ adding: false, addFailed: true });
    }
  }

  onCollaboratorRemoved = (data) => {
    const { container, collaboratorUserId, initiatorId, initiatorUsername } = data;
    if (this.props.container.slug !== container.slug) {
      return;
    }

    if (collaboratorUserId === this.state.user.id) {
      if (initiatorId !== this.state.user.id) {
        snackbarActions.post(`You have been removed from the ${container.slug} project by ${initiatorUsername}.`);
      }
      this.context.router.transitionTo('dashboard');
      return;
    }

    collaboratorActions.fetchAllByContainerSlug(this.props.container.slug);
  }

  onCollaboratorLimitReached = (data) => {
    const { container } = data;
    if (this.props.container.slug === container.slug) {
      this.setState({ showCollabLimitModal: true });
    }
  }

  handleNewCollaboratorChanged = (event) => {
    this.setState({
      newCollaborator: event.target.value,
      addFailed: false
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.setState({ adding: true });
    collaboratorActions.add(this.props.container, this.state.newCollaborator);
  }

  hideCollabLimitReachedModal = () => {
    this.setState({ showCollabLimitModal: false });
  };

  handleCloseCollabLimitModal = () => {
    this.hideCollabLimitReachedModal();
  };

  render() {
    const { collaborators, container, shared } = this.props,
          { newCollaborator, adding, addFailed } = this.state,
          { makeHref } = this.context.router,
          newOrgURL = makeHref('new-org');

    return (
      <div className='collaborator-list-component'>
        {collaborators && collaborators.size > 0 ? (
          <ListGroup>
            {collaborators.map((collaborator) => {
              return (
                <ListGroupItem key={`collaborator-${collaborator.id}`}>
                  <CollaboratorListItem
                    collaborator={collaborator}
                    container={container}
                    shared={shared} />
                </ListGroupItem>
              );
            })}
          </ListGroup>
        ) : ''}

        {!shared ? (
          <form onSubmit={this.handleSubmit}>
            <Input label='Add Collaborator'
              type='text' required placeholder='Username or email'
              value={newCollaborator}
              disabled={adding}
              bsStyle={addFailed ? 'error' : null}
              onChange={this.handleNewCollaboratorChanged} buttonAfter={
                <Button bsStyle='primary' type='submit'>
                  {adding ? 'Adding...' : 'Add'}
                </Button>
              } />
          </form>
        ) : ''}

        <Modal show={this.state.showCollabLimitReachedModal} onHide={this.hideCollabLimitReachedModal}>
          <Modal.Header>
            <Modal.Title>Add More Collaborators</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You have reached the maximum number of collaborators permitted on your subscription. To add more collaborators, please create an organization.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseCollabLimitReachedModal}>Close</Button>
            <Button bsStyle='primary' href={newOrgURL}>Create Organization</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
