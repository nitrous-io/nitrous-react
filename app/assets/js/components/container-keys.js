import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';
import Container from 'records/container';
import Host from 'records/host';
import containerActions from 'actions/container-actions';
import containerKeyActions from 'actions/container-key-actions';
import userKeyActions from 'actions/user-key-actions';
import containerStore from 'stores/container-store';
import containerKeyStore from 'stores/container-key-store';
import userKeyStore from 'stores/user-key-store';
import { Alert, Panel } from 'react-bootstrap';
import SelectableTextarea from 'components/selectable-textarea';
import Fa from 'components/fa';
import ContextSwitcher from 'components/context-switcher';
import LoadingIndicator from 'components/loading-indicator';
import WorkspaceNav from 'components/workspace-nav';
import UserKeyList from 'components/user-key-list';

export default class ContainerKeys extends React.Component {
  displayName = 'ContainerKeys';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host)
  };

  static childContextTypes = {
    container: PropTypes.instanceOf(Container)
  };

  static propTypes = {
    params: PropTypes.shape({
      containerSlug: PropTypes.string.isRequired
    })
  };

  state = {
    container: containerStore.containerBySlug(this.props.params.containerSlug),
    containerKeys: null,
    containerKeyOnGitHub: false,
    userKeys: null,
    containerKeysFailed: false,
    containerKeyStatusFailed: false,
    processingGitHubActions: false,
    fetchingKeyStatus: true
  };

  componentDidMount() {
    const containerSlug = this.props.params.containerSlug;
    containerStore.onChange(this.containerStoreDidChange);
    containerKeyStore.onChange(this.containerKeyStoreDidChange);
    containerKeyStore.on('fetch-failed', this.onContainerKeyFetchFailed);
    containerKeyStore.on('fetch-status-failed', this.onContainerKeyFetchStatusFailed);
    containerKeyStore.on('fetched-status', this.onContainerKeyFetchedStatus);
    userKeyStore.onChange(this.userKeyStoreDidChange);
    this.fetchData(containerSlug);
  }

  componentWillReceiveProps(nextProps) {
    const containerSlug = nextProps.params.containerSlug;
    if (this.props.params.containerSlug !== containerSlug) {
      const container = containerStore.containerBySlug(this.props.params.containerSlug);
      this.setState({ container });
      this.fetchData(containerSlug);
    }
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
    containerKeyStore.offChange(this.containerKeyStoreDidChange);
    containerKeyStore.off('fetch-failed', this.onContainerKeyFetchFailed);
    containerKeyStore.off('fetch-status-failed', this.onContainerKeyFetchStatusFailed);
    containerKeyStore.off('fetched-status', this.onContainerKeyFetchedStatus);
    userKeyStore.offChange(this.userKeyStoreDidChange);
  }

  fetchData = (containerSlug) => {
    this.setState({ fetchingKeyStatus: true });
    containerActions.fetchOne(containerSlug);
    containerKeyActions.fetchAllByContainerSlug(containerSlug);
    containerKeyActions.fetchStatusByContainerSlug(containerSlug);
    userKeyActions.fetchAllByContainerSlug(containerSlug);
  }

  containerStoreDidChange = () => {
    const container = containerStore.containerBySlug(this.props.params.containerSlug);
    this.setState({ container });
  }

  containerKeyStoreDidChange = () => {
    const containerSlug = this.props.params.containerSlug,
          containerKeys = containerKeyStore.keysByContainerSlug(containerSlug),
          keyAdded = containerKeyStore.keyAddedToGitHubByContainerSlug(containerSlug);

    if (containerKeys) {
      this.setState({ containerKeysFailed: false });
    }

    this.setState({
      containerKeys,
      containerKeyOnGitHub: keyAdded,
      processingGitHubActions: false
    });
  }

  onContainerKeyFetchFailed = (data) => {
    const { containerSlug } = data;
    if (containerSlug === this.props.params.containerSlug) {
      this.setState({ containerKeysFailed: true });
    }
  }

  onContainerKeyFetchStatusFailed = (data) => {
    const { containerSlug } = data;
    if (containerSlug === this.props.params.containerSlug) {
      this.setState({ fetchingKeyStatus: false, containerKeyStatusFailed: true });
    }
  }

  onContainerKeyFetchedStatus = (data) => {
    const { containerSlug } = data;
    if (containerSlug === this.props.params.containerSlug) {
      this.setState({ fetchingKeyStatus: false });
    }
  }

  userKeyStoreDidChange = () => {
    const userKeys = userKeyStore.keysByContainerSlug(this.props.params.containerSlug);
    this.setState({ userKeys });
  }

  getChildContext() {
    return { container: this.state.container };
  }

  handleAddToGitHub = () => {
    // TODO Note that we are assuming that a container has only 1 container key.
    this.setState({ processingGitHubActions: true });
    containerKeyActions.addToGitHub(this.props.params.containerSlug);
  }

  handleRemoveFromGitHub = () => {
    this.setState({ processingGitHubActions: true });
    containerKeyActions.removeFromGitHub(this.props.params.containerSlug);
  }

  renderContainerKeyActionButton = () => {
    const { fetchingKeyStatus, processingGitHubActions, containerKeyStatusFailed, containerKeyOnGitHub } = this.state;
    if (fetchingKeyStatus) {
      return (
        <Button className='pull-right' disabled>Loading...</Button>
      );
    }

    if (containerKeyStatusFailed) {
      return '';
    }

    return (containerKeyOnGitHub ? (
        <Button
          className='pull-right'
          onClick={this.handleRemoveFromGitHub}
          disabled={processingGitHubActions}>
          {processingGitHubActions ? 'Removing from GitHub...' : 'Remove from GitHub'}
        </Button>
      ) : (
        <Button
          className='pull-right'
          onClick={this.handleAddToGitHub}
          disabled={processingGitHubActions}>
          {processingGitHubActions ? 'Adding to GitHub...' : 'Add to GitHub'}
        </Button>
      )
    );
  }

  render() {
    const { container, containerKeys, userKeys, containerKeysFailed } = this.state,
          { host } = this.context,
          shared = !host,
          loading = (container == null || (containerKeys == null && !containerKeysFailed) || userKeys == null),
          { makeHref } = this.context.router;

    return (
      <div className='container-keys-component container-subpage container'>
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
              Manage SSH Keys
            </h4>

            {container.state === 'running' ? (
              <div>
                <Panel header='Project Public Keys'>
                  <p className='hint'> <Fa icon='info-circle' /> Public keys on your project. Add these to external services to allow access to them from your project.</p>

                  {containerKeys && containerKeys.size > 0 ?
                    containerKeys.map((key) => {
                      return (<div key={`container-key-${key.fingerprint}`}>
                        <p>{key.displayName}</p>
                        <SelectableTextarea readOnly className='key-field' rows='5'
                          value={key.key} />
                        {this.renderContainerKeyActionButton(key)}
                      </div>);
                    })
                  : (
                    containerKeysFailed ? (
                      <Alert bsStyle='danger'><p>There was an error fetching the public keys on your project.</p></Alert>
                    ) : (
                      <Alert bsStyle='warning'><p>There are no public keys on your project.</p></Alert>
                    )
                  )}
                </Panel>

                <Panel header='User Public Keys'>
                  <UserKeyList userKeys={userKeys} host={host} shared={shared} />
                </Panel>
              </div>
            ) : (
              <Alert bsStyle='warning'>
                <p>Please start this project to view its keys.</p>
                {!shared ? (
                  <p><Link to='containers' className='btn btn-default' params={{ hostSlug: host.slug }}>Back to Projects List</Link></p>
                ): (
                  <p><Link to='shared-containers' className='btn btn-default'>Back to Projects List</Link></p>
                )}
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }
}
