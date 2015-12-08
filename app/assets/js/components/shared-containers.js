import React from 'react';
import { Alert } from 'react-bootstrap';

import containerStore from 'stores/container-store';
import containerActions from 'actions/container-actions';
import collaboratorStore from 'stores/collaborator-store';
import userStore from 'stores/user-store';
import snackbarActions from 'actions/snackbar-actions';
import ContextSwitcher from 'components/context-switcher';
import ContainerList from 'components/container-list';
import Fa from 'components/fa';

const communityURL = 'https://community.nitrous.io',
      pairProgramURL = communityURL + '/tutorials/conducting-interviews-pair-programming',
      tmuxURL = communityURL + '/tutorials/getting-started-with-tmux',
      baseImagesURL = 'https://s3.amazonaws.com/nitrous-community/images/',
      selectCollabURL = baseImagesURL + 'pair_dashboard_select_collab.png',
      addedCollabURL = baseImagesURL + 'pair_added_collab.png',
      liveEditURL = baseImagesURL + 'pair_live_edit.png';

export default class SharedContainers extends React.Component {
  displayName = 'SharedContainers';

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
  };

  onCollaboratorRemoved = (data) => {
    const { container, collaboratorUserId, initiatorUsername } = data;
    if (this.state.user.id !== collaboratorUserId) {
      return;
    }
    containerActions.fetchAllShared();
    snackbarActions.post(`You have been removed from the ${container.slug} project by ${initiatorUsername}.`);
  };

  containerStoreDidChange = () => {
    this.setState({ containers: containerStore.sharedContainers });
  };

  userStoreDidChange = () => {
    this.setState({ user: userStore.user });
  };

  render() {
    const containers = this.state.containers.toList();

    return (
      <div className='shared-containers-component'>
        <div className='container'>
          <ContextSwitcher shared />
          {containers.isEmpty() ? (
            <div className='intro-guide'>
              <Alert bsStyle="info">
                <Fa icon='exclamation-circle' /> Oops, it appears you don&#39;t have any shared projects
              </Alert>

              <h2>What are Shared Projects?</h2>
              <p>Shared projects allow you to collaborate with one or more users on a single Nitrous project.</p>

              <h2>How do I view shared projects?</h2>
              <p>You need to be added to a project as a collaborator. To add a collaborator, the owner of a project can go to their project&#39;s settings and add the user:</p>
              <img src={selectCollabURL} alt="select_collab" />
              <img src={addedCollabURL} alt="added_collab" />

              <h2>How does it work?</h2>
              <p>Open your Nitrous web IDE and start editing files in real time with your collaborator:</p>
              <img src={liveEditURL} alt="live_edit" />

              <h2>More information</h2>
              <p>Visit our tutorials to find out more about collaborating on Nitrous:</p>
              <ol>
                <li><a href={pairProgramURL} target='_blank'>Pair programming on Nitrous</a></li>
                <li><a href={tmuxURL} target='_blank'>Setting up tmux</a></li>
              </ol>
            </div>
          ) : (
            <ContainerList containers={containers} />
          )}
        </div>
      </div>
    );
  }
}
