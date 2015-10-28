import React, { PropTypes } from 'react';
import Host from 'records/host';
import collaboratorActions from 'actions/collaborator-actions';
import containerActions from 'actions/container-actions';
import collaboratorStore from 'stores/collaborator-store';
import containerStore from 'stores/container-store';
import { Nav, NavItem, Panel } from 'react-bootstrap';
import ContextSwitcher from 'components/context-switcher';
import LoadingIndicator from 'components/loading-indicator';
import WorkspaceNav from 'components/workspace-nav';
import Fa from 'components/fa';
import CollaboratorList from 'components/collaborator-list';

export default class ContainerCollaborators extends React.Component {
  displayName = 'ContainerCollaborators';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host)
  };

  static propTypes = {
    params: PropTypes.shape({
      containerSlug: PropTypes.string.isRequired
    })
  };

  state = {
    container: containerStore.containerBySlug(this.props.params.containerSlug),
    collaborators: collaboratorStore.collaboratorsByContainerSlug(this.props.params.containerSlug)
  }

  componentDidMount() {
    const containerSlug = this.props.params.containerSlug;

    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchOne(containerSlug);

    collaboratorStore.onChange(this.collaboratorStoreDidChange);
    collaboratorActions.fetchAllByContainerSlug(containerSlug);
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
    collaboratorStore.offChange(this.collaboratorStoreDidChange);
  }

  containerStoreDidChange = () => {
    const container = containerStore.containerBySlug(this.props.params.containerSlug);
    this.setState({ container });
  }

  collaboratorStoreDidChange = () => {
    const collaborators = collaboratorStore.collaboratorsByContainerSlug(this.props.params.containerSlug);
    this.setState({ collaborators });
  }

  render() {
    const { container, collaborators } = this.state,
          { host } = this.context,
          shared = !host,
          loading = (container == null || collaborators == null),
          { makeHref } = this.context.router;

    return (
      <div className='container-collaborators-component container-subpage container'>
        {!shared ? (
          <WorkspaceNav host={host} activeTab='containers' />
        ) : (
          <div>
            <ContextSwitcher shared />
            <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey='containers'>
              <NavItem href={makeHref('shared-containers')} eventKey='containers'>Projects</NavItem>
            </Nav>
          </div>
        )}

        {loading ? (
          <LoadingIndicator />
        ) : (
          <div className='container'>
            <h4>
              {container.displayName}
              <span className='divider'><Fa icon='angle-right' /></span>
              Manage Collaborators
            </h4>

            <Panel>
              <p className='hint'> <Fa icon='info-circle' /> Collaborators can work with you in real-time in the IDE and have full console access.</p>

              <CollaboratorList
                collaborators={collaborators}
                container={container}
                shared={shared} />
            </Panel>
          </div>
        )}
      </div>
    );
  }
}
