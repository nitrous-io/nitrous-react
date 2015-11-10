import React, { PropTypes } from 'react';
import { Table, Button, ButtonToolbar } from 'react-bootstrap';
import Host from 'records/host';
import ConnectRegistry from 'components/connect-registry';
import DisconnectRegistry from 'components/disconnect-registry';
import registryStore from 'stores/registry-store';
import registryActions from 'actions/registry-actions';

export default class Registries extends React.Component {
  displayName = 'Registries';

  static propTypes = {
    host: PropTypes.instanceOf(Host).isRequired,
    showDisconnect: PropTypes.bool.isRequired
  };

  state = {
    showConnectModal: false,
    showDisconnectModal: false,
    urlPrefill: null,
    registries: (registryStore.registriesForHostSlug(this.props.host.slug) || []),
    deletableRegistry: null
  }

  componentDidMount() {
    registryStore.onChange(this.registryStoreDidChange);
    registryActions.fetchAllByHostSlug(this.props.host.slug);
  }

  componentWillUnmount() {
    registryStore.offChange(this.registryStoreDidChange);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ registries: (registryStore.registriesForHostSlug(nextProps.host.slug) || []) });
  }

  registryStoreDidChange = () => {
    this.setState({ registries: (registryStore.registriesForHostSlug(this.props.host.slug) || []) });
  }

  handleConnectDockerRegistryButton = () => {
    this.setState({ showConnectModal: true, urlPrefill: "index.docker.io" });
  }

  handleConnectQuayRegistryButton = () => {
    this.setState({ showConnectModal: true, urlPrefill: "quay.io" });
  }

  handleConnectCustomRegistryButton = () => {
    this.setState({ showConnectModal: true, urlPrefill: null });
  }

  handleConnectRegistryModalHide = () => {
    this.setState({ showConnectModal: false });
  }

  handleDisconnectRegistry = (registry) => {
    this.setState({ showDisconnectModal: true, deletableRegistry: registry });
  }

  handleDisconnectRegistryModalHide = () => {
    this.setState({ showDisconnectModal: false });
  }

  registryFor = (registryUrl) => {
    const { registries } = this.state;

    if (!registries) {
      return false;
    }

    return registries.find((registry) => {
      return registry.url === registryUrl;
    });
  }

  remainingRegistries = (excludingRegistries) => {
    const { registries } = this.state;

    if (!registries) {
      return [];
    }

    return registries.filter((registry) => {
      return excludingRegistries.indexOf(registry) === -1;
    });
  }

  disconnectRegistryButton = (registry) => {
    if (!this.props.showDisconnect) {
      return '';
    }

    return <Button bsStyle="warning" onClick={this.handleDisconnectRegistry.bind(this, registry)}>Disconnect</Button>;
  }

  render() {
    const { host, showDisconnect } = this.props,
          { showConnectModal, showDisconnectModal, urlPrefill, deletableRegistry } = this.state,
          quayRegistry = this.registryFor("quay.io"),
          dockerRegistry = this.registryFor("index.docker.io"),
          remaining = this.remainingRegistries([quayRegistry, dockerRegistry]);

    return (
      <div className='registries-component'>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Registry</th>
              <th>Username</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DockerHub</td>
              <td>{dockerRegistry ? dockerRegistry.username : 'Not Connected'}</td>
              <td>
                <ButtonToolbar className='pull-right'>
                  {dockerRegistry ?
                    this.disconnectRegistryButton(dockerRegistry)
                    :
                    <Button onClick={this.handleConnectDockerRegistryButton}>Connect</Button>
                  }
                </ButtonToolbar>
              </td>
            </tr>
            <tr>
              <td>Quay.io</td>
              <td>{quayRegistry ? quayRegistry.username : 'Not Connected'}</td>
              <td>
                <ButtonToolbar className='pull-right'>
                  {quayRegistry ?
                    this.disconnectRegistryButton(quayRegistry)
                    :
                    <Button onClick={this.handleConnectQuayRegistryButton}>Connect</Button>
                  }
                </ButtonToolbar>
              </td>
            </tr>
            {remaining.map((registry) => {
              return (
                <tr>
                  <td>{registry.url}</td>
                  <td>{registry.username}</td>
                  <td>
                    <ButtonToolbar className='pull-right'>
                      {this.disconnectRegistryButton(registry)}
                    </ButtonToolbar>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3}>
                <Button onClick={this.handleConnectCustomRegistryButton}>Add Custom Registry</Button>
              </td>
            </tr>
          </tbody>
        </Table>

        <ConnectRegistry host={host} urlPrefill={urlPrefill} showModal={showConnectModal} onHideModal={this.handleConnectRegistryModalHide} />
        {showDisconnect && deletableRegistry ?
          <DisconnectRegistry registry={deletableRegistry} host={host} showModal={showDisconnectModal} onHideModal={this.handleDisconnectRegistryModalHide} />
        : ''}
      </div>
    );
  }
}
