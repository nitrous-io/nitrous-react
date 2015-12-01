import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Collaborator from 'records/collaborator';
import Container from 'records/container';
import collaboratorActions from 'actions/collaborator-actions';
import collaboratorStore from 'stores/collaborator-store';
import userStore from 'stores/user-store';
import planStore from 'stores/plan-store';
import hostStore from 'stores/host-store';
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

  constructor(props, context) {
    super(props, context);

    const host = hostStore.hostByHostId(this.props.container.hostId),
          plan = host ? planStore.planById(host.planId) : null;

    this.state = {
      host,
      plan,
      user: userStore.user,
      newCollaborator: null,
      adding: false,
      addFailed: false,
      showCollabLimitModal: false
    };
  }

  componentDidMount() {
    userStore.onChange(this.userStoreDidChange);
    hostStore.onChange(this.hostStoreDidChange);
    planStore.onChange(this.planStoreDidChange);

    collaboratorStore.on('added', this.onCollaboratorAdded);
    collaboratorStore.on('add-failed', this.onCollaboratorAddFailed);
    collaboratorStore.on('removed', this.onCollaboratorRemoved);
  }

  componentWillUnmount() {
    userStore.offChange(this.userStoreDidChange);
    hostStore.offChange(this.hostStoreDidChange);
    planStore.offChange(this.planStoreDidChange);

    collaboratorStore.off('added', this.onCollaboratorAdded);
    collaboratorStore.off('add-failed', this.onCollaboratorAddFailed);
    collaboratorStore.off('removed', this.onCollaboratorRemoved);
  }

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  planStoreDidChange = () => {
    if (this.state.host) {
      const plan = planStore.planById(this.state.host.planId);
      this.setState({ plan });
    }
  }

  hostStoreDidChange = () => {
    const container = this.props.container,
          host = hostStore.hostByHostId(container.hostId);
    this.setState({ host });
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

  handleNewCollaboratorChanged = (event) => {
    this.setState({
      newCollaborator: event.target.value,
      addFailed: false
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.state.plan) {
      const plan = this.state.plan,
            collaborators = this.props.collaborators;
      if (collaborators.size >= plan.maxCollaborators && plan.maxCollaborators) {
        this.setState({ showCollabLimitModal: true });
        return;
      }
    }

    this.setState({ adding: true });
    collaboratorActions.add(this.props.container, this.state.newCollaborator);
  }

  hideCollabLimitModal = () => {
    this.setState({ showCollabLimitModal: false });
  };

  handleCloseCollabLimitModal = () => {
    this.hideCollabLimitModal();
  };

  render() {
    const { collaborators, container, shared } = this.props,
          { newCollaborator, adding, addFailed, host, plan } = this.state,
          canUpgrade = plan ? !planStore.plansForUpgrade(plan).isEmpty() : false,
          org  = plan ? plan.org : false,
          { makeHref } = this.context.router,
          newOrgURL = makeHref('new-org'),
          subscriptionsUpgradeURL = host ? makeHref('subscriptions-upgrade', { subscriptionSlug: host.subscriptionSlug }) : null;

    var choices = [];
    if (canUpgrade) {
      choices.push('upgrade your subscription');
    } 
    if (!org) {
      choices.push('create an organization');
    }
    const choicesDescriptor = choices.join(' or ');

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

        <Modal show={this.state.showCollabLimitModal} onHide={this.hideCollabLimitModal}>
          <Modal.Header>
            <Modal.Title>Add More Collaborators</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You have reached the maximum number of collaborators allowed on your subscription. To add more collaborators, please {choicesDescriptor}.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleCloseCollabLimitModal}>Close</Button>
            {canUpgrade && subscriptionsUpgradeURL ? (
              <Button bsStyle='primary' href={subscriptionsUpgradeURL}>Upgrade Subscription</Button>
            ) : null}
            {!org ? (
              <Button bsStyle='primary' href={newOrgURL}>Create Organization</Button>
            ) : null}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
