import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import Host from 'records/host';
import collaboratorActions from 'actions/collaborator-actions';
import containerActions from 'actions/container-actions';
import collaboratorStore from 'stores/collaborator-store';
import containerStore from 'stores/container-store';
import ContainerNav from 'components/container-nav';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import CollaboratorList from 'components/collaborator-list';

export default class ContainerCollaborators extends React.Component {
  displayName = 'ContainerCollaborators';

  static contextTypes = {
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
    const { containerSlug } = this.props.params,
          { container, collaborators } = this.state,
          { host } = this.context,
          shared = !host,
          loading = (container == null || collaborators == null);

    return (
      <div className='container-collaborators-component'>
        <ContainerNav activeTab='collaborators' containerSlug={containerSlug} container={container} host={host}>
          <Panel header={<h4>{shared ? 'View' : 'Manage'} Collaborators</h4>}>
            {loading ? (
              <LoadingIndicator />
            ) : (
              <div>
                <p className='hint'><Fa icon='info-circle' /> Collaborators can work with you in real-time in the IDE and have full console access.</p>
                <CollaboratorList collaborators={collaborators} container={container} shared={shared} />
              </div>
            )}
          </Panel>
        </ContainerNav>
      </div>
    );
  }
}
