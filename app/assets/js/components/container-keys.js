import React, { PropTypes } from 'react';
import { Link } from 'react-router';
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
import LoadingIndicator from 'components/loading-indicator';
import UserKeyList from 'components/user-key-list';

export default class ContainerKeys extends React.Component {
  displayName = 'ContainerKeys';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host).isRequired
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
    userKeys: null
  };

  componentDidMount() {
    const containerSlug = this.props.params.containerSlug;
    containerStore.onChange(this.containerStoreDidChange);
    containerKeyStore.onChange(this.containerKeyStoreDidChange);
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
    userKeyStore.offChange(this.userKeyStoreDidChange);
  }

  fetchData = (containerSlug) => {
    containerActions.fetchOne(containerSlug);
    containerKeyActions.fetchAllByContainerSlug(containerSlug);
    userKeyActions.fetchAllByContainerSlug(containerSlug);
  }

  containerStoreDidChange = () => {
    const container = containerStore.containerBySlug(this.props.params.containerSlug);
    this.setState({ container });
  }

  containerKeyStoreDidChange = () => {
    const containerKeys = containerKeyStore.keysByContainerSlug(this.props.params.containerSlug);
    this.setState({ containerKeys });
  }

  userKeyStoreDidChange = () => {
    const userKeys = userKeyStore.keysByContainerSlug(this.props.params.containerSlug);
    this.setState({ userKeys });
  }

  getChildContext() {
    return { container: this.state.container };
  }

  render() {
    const { container, containerKeys, userKeys } = this.state,
          { host } = this.context,
          loading = (container == null || containerKeys == null || userKeys == null);

    return (
      <div className='container-keys-component'>
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
                      </div>);
                    })
                  : (
                    <Alert bsStyle='warning'><p>There are no public keys on your project.</p></Alert>
                  )}
                </Panel>

                <Panel header='User Public Keys'>
                  <UserKeyList userKeys={userKeys} />
                </Panel>
              </div>
            ) : (
              <Alert bsStyle='warning'>
                <p>Please start this project to view its keys.</p>
                <p><Link to='containers' className='btn btn-default' params={{ hostSlug: host.slug }}>Back to Projects List</Link></p>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }
}
