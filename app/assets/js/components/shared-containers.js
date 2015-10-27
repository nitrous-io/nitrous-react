import React, { PropTypes } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';
import collaboratorStore from 'stores/collaborator-store';
import userStore from 'stores/user-store';
import snackbarActions from 'actions/snackbar-actions';
import ContextSwitcher from 'components/context-switcher';
import ContainerList from 'components/container-list';

export default class SharedContainers extends React.Component {
  displayName = 'SharedContainers';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  state = {
    containers: containerStore.sharedContainers,
    user: userStore.user
  };

  componentDidMount() {
    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchAllShared();
    collaboratorStore.on('added', this.onCollaboratorAdded);
    collaboratorStore.on('removed', this.onCollaboratorRemoved);
    userStore.onChange(this.userStoreDidChange);
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
    collaboratorStore.off('added', this.onCollaboratorAdded);
    collaboratorStore.off('removed', this.onCollaboratorRemoved);
    userStore.offChange(this.userStoreDidChange);
  }

  onCollaboratorAdded = (data) => {
    const { container, collaboratorUserId, initiatorUsername } = data;
    if (this.state.user.id !== collaboratorUserId) {
      return;
    }
    containerActions.fetchAllShared();
    snackbarActions.post(`You have been added to the ${container.slug} project by ${initiatorUsername}.`);
  }

  onCollaboratorRemoved = (data) => {
    const { container, collaboratorUserId, initiatorUsername } = data;
    if (this.state.user.id !== collaboratorUserId) {
      return;
    }
    containerActions.fetchAllShared();
    snackbarActions.post(`You have been removed from the ${container.slug} project by ${initiatorUsername}.`);
  }

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.sharedContainers });
  };

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  }

  render() {
    const { makeHref } = this.context.router,
          containers = this.state.containers.toList();

    return (
      <div className='shared-containers-component'>
        <div className='container'>
          <ContextSwitcher shared />
          <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey='containers'>
            <NavItem href={makeHref('shared-containers')} eventKey='containers'>Projects</NavItem>
          </Nav>
          <ContainerList containers={containers} />
        </div>
      </div>
    );
  }
}
