import React from 'react';
import { Alert, Grid, Row, Col, Thumbnail } from 'react-bootstrap';

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
      tmuxURL = communityURL + '/tutorials/getting-started-with-tmux';

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
            <div className='shared-intro-guide'>
              <Alert bsStyle="info">
                <Fa icon='exclamation-circle' /> Oops, it appears you don&#39;t have any shared projects
              </Alert>

              <Grid className='ui-card-grid'>
                <Row>
                  <Col lg={4} md={12} sm={12} xs={12}>
                    <Thumbnail src='/app/assets/images/add-collab.png' className='shared-intro-thumbnail'>
                      <h3>Adding Collaborators</h3>
                      <p>On your project dashboard, select <strong>Manage Collaborators</strong> from <strong>Settings</strong>.</p>
                    </Thumbnail>
                  </Col>
                  <Col lg={4} md={12} sm={12} xs={12}>
                    <Thumbnail src='/app/assets/images/manage-collab.png' className='shared-intro-thumbnail'>
                      <h3>Managing Collaborators</h3>
                      <p>You can add or remove collaborators with one click.</p>
                    </Thumbnail>
                  </Col>
                  <Col lg={4} md={12} sm={12} xs={12}>
                    <Thumbnail src='/app/assets/images/live-edit.png' className='shared-intro-thumbnail'>
                      <h3>Code Together</h3>
                      <p>Launch the Web IDE and code together in real-time.</p>
                    </Thumbnail>
                  </Col>
                </Row>
              </Grid>

              <h2>More information</h2>
              <p>Visit our tutorials to find out more about collaborating on Nitrous:</p>
              <ol>
                <li><a href={pairProgramURL} target='_blank'>Pair programming on Nitrous</a></li>
                <li><a href={tmuxURL} target='_blank'>Setting up tmux</a></li>
              </ol>
            </div>
          ) : (
            <ContainerList containers={containers} shared />
          )}
        </div>
      </div>
    );
  }
}
