import React, { PropTypes } from 'react';
import { Button, Input, Nav, NavItem, OverlayTrigger, Tooltip, Table } from 'react-bootstrap';

import { PortBinding } from 'records/container-config';
import Host from 'records/host';
import containerActions from 'actions/container-actions';
import snackbarActions from 'actions/snackbar-actions';
import containerStore from 'stores/container-store';
import hostStore from 'stores/host-store';
import containerConfigStore from 'stores/container-config-store';
import ContextSwitcher from 'components/context-switcher';
import LoadingIndicator from 'components/loading-indicator';
import HostNav from 'components/host-nav';
import Fa from 'components/fa';

export default class ContainerPorts extends React.Component {
  displayName = 'ContainerPorts';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host)
  };

  static propTypes = {
    params: PropTypes.shape({
      containerSlug: PropTypes.string.isRequired
    })
  };

  findPortBindings = () => {
    const containerConfig = containerConfigStore.containerConfigByContainerSlug(this.props.params.containerSlug);
    if (!containerConfig) {
      return null;
    }
    return containerConfig.editableConfiguredPortBindings;
  }

  state = {
    container: containerStore.containerBySlug(this.props.params.containerSlug),
    containerConfig: containerConfigStore.containerConfigByContainerSlug(this.props.params.containerSlug),
    portBindings: this.findPortBindings(),
    processing: false,
    newPort: null,
    newPortInvalid: false
  }

  componentDidMount() {
    const containerSlug = this.props.params.containerSlug;

    containerStore.onChange(this.containerStoreDidChange);
    containerStore.on('reconfigured', this.onContainerReconfigured);
    containerStore.on('reconfigure-failed', this.onContainerReconfigFailed);
    containerActions.fetchOne(containerSlug);

    containerConfigStore.onChange(this.containerConfigStoreDidChange);
    containerActions.fetchConfig(containerSlug);

    if (this.context.host) {
      hostStore.on('started', this.onHostStarted);
    }
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
    containerStore.off('reconfigured', this.onContainerReconfigured);
    containerStore.off('reconfigure-failed', this.onContainerReconfigFailed);
    containerConfigStore.offChange(this.containerConfigStoreDidChange);

    if (this.context.host) {
      hostStore.off('started', this.onHostStarted);
    }
  }

  containerStoreDidChange = () => {
    const container = containerStore.containerBySlug(this.props.params.containerSlug);
    this.setState({ container });
  }

  onContainerReconfigured = (data) => {
    const { container } = data;
    if (container.slug === this.props.params.containerSlug) {
      snackbarActions.post(`Your project “${container.displayName}” has been successfully reconfigured.`);
      this.setState({ processing: false });
      containerActions.fetchConfig(this.props.params.containerSlug);
    }
  }

  onContainerReconfigFailed = (data) => {
    const { containerSlug } = data;
    if (containerSlug === this.props.params.containerSlug) {
      this.setState({ processing: false });
    }
  }

  containerConfigStoreDidChange = () => {
    const containerConfig = containerConfigStore.containerConfigByContainerSlug(this.props.params.containerSlug);
    this.setState({ containerConfig, portBindings: this.findPortBindings() });
  }

  onHostStarted = (data) => {
    const { host } = data;
    if (this.context.host.slug === host.slug) {
      snackbarActions.clear();
      containerActions.fetchConfig(this.props.params.containerSlug);
    }
  }

  handlePreviewChanged = (binding) => {
    let { portBindings } = this.state;
    portBindings = portBindings.map((v) => {
      return v.merge({ preview: (v === binding) });
    });
    this.setState({ portBindings });
  }

  handleRemove = (binding) => {
    let { portBindings } = this.state;
    portBindings = portBindings.filterNot((v) => {
      return v === binding;
    });
    this.setState({ portBindings });
  }

  handleNewPortChanged = (event) => {
    const newPort = event.target.value,
          parsedPort = parseInt(newPort, 10),
          invalid = newPort && !(parsedPort >= 1 && parsedPort <= 65535);
    this.setState({ newPort: parsedPort.toString(), newPortInvalid: invalid });
  }

  handleAddPort = (event) => {
    event.preventDefault();

    const { newPort } = this.state;
    let { portBindings } = this.state;

    portBindings = portBindings.push(new PortBinding({
      public: true,
      containerPort: newPort,
      tcp: true
    }));

    this.setState({ newPort: null, portBindings });
  }

  handleApplyChanges = () => {
    this.setState({ processing: true });

    const { container, containerConfig, portBindings } = this.state;
    let newConfig = containerConfig.withEditedPortBindings(portBindings);

    const previewPortBinding = portBindings.find((v) => v.preview);
    if (previewPortBinding) {
      newConfig = newConfig.withPreviewPort(previewPortBinding.containerPort);
    } else {
      newConfig = newConfig.withoutPreviewPort();
    }

    containerActions.reconfigure(container, newConfig);
  }

  isDirty = () => {
    const { portBindings } = this.state;
    if (!portBindings) {
      return false;
    }
    return !portBindings.equals(this.findPortBindings());
  }

  renderPortEditor = () => {
    const { portBindings, processing, newPort, newPortInvalid } = this.state,
          dirty = this.isDirty();

    return (
      <div>
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Open Ports</th>
              <th>
                <OverlayTrigger placement='top'
                  overlay={<Tooltip id='primary-port-tooltip'>Accessible from port 80</Tooltip>}>
                  <span>Primary <Fa icon='question-circle' /></span>
                </OverlayTrigger>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {portBindings.size > 0 ? portBindings.map((binding) => {
              return (
                <tr key={`binding-${binding.containerPort}`}>
                  <td className='col-port'>{binding.containerPort}</td>
                  <td className='col-preview'>
                    <Input type='radio' name='previewPort'
                      checked={binding.preview}
                      disabled={processing}
                      onChange={this.handlePreviewChanged.bind(this, binding)} />
                  </td>
                  <td>
                    <Button bsStyle='warning'
                      disabled={processing}
                      onClick={this.handleRemove.bind(this, binding)}>
                      <Fa icon='trash' />
                    </Button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan='3' className='text-center'>No open ports</td>
              </tr>
            )}
          </tbody>
        </Table>

        <form onSubmit={this.handleAddPort}>
          <Input
            type='number' min='1' max='65535' required
            placeholder='New port'
            value={newPort}
            bsStyle={newPortInvalid ? 'error' : null}
            help={newPortInvalid ? 'Please enter a port number from 1-65535' : ''}
            disabled={processing}
            onChange={this.handleNewPortChanged}
            buttonAfter={
              <Button bsStyle='primary' type='submit' disabled={!newPort || newPortInvalid || processing}>Add</Button>
            } />
        </form>

        {dirty ? (
          <Button className='pull-right'
            bsStyle='primary'
            disabled={processing}
            onClick={this.handleApplyChanges}>
            {processing ? 'Applying Changes...' : 'Apply Changes'}
          </Button>
        ) : ''}
      </div>
    );
  }

  renderShared = () => {
    const { portBindings } = this.state;

    return (
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>Open Ports</th>
            <th>
              <OverlayTrigger placement='top'
                overlay={<Tooltip id='primary-port-tooltip'>Accessible from port 80</Tooltip>}>
                <span>Primary <Fa icon='question-circle' /></span>
              </OverlayTrigger>
            </th>
          </tr>
        </thead>
        <tbody>
          {portBindings.size > 0 ? portBindings.map((binding) => {
            return (
              <tr key={`binding-${binding.containerPort}`}>
                <td className='col-port'>{binding.containerPort}</td>
                <td className='col-preview'>
                  <Input type='radio' name='previewPort' disabled
                    checked={binding.preview} />
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan='3' className='text-center'>No open ports</td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  }

  render() {
    const { container, containerConfig } = this.state,
          { host } = this.context,
          shared = !host,
          loading = (container == null || containerConfig == null),
          { makeHref } = this.context.router;

    return (
      <div className='container-ports-component container-subpage container'>
        {shared ? (
          <div>
            <ContextSwitcher shared />
            <Nav className='ui-centered-tabs' bsStyle='tabs' activeKey='containers'>
              <NavItem href={makeHref('shared-containers')} eventKey='containers'>Projects</NavItem>
            </Nav>
          </div>
        ) : (
          <HostNav host={host} activeTab='containers' />
        )}

        {loading ? (
          <LoadingIndicator />
        ) : (
          <div className='inner-container'>
            <h4>
              {container.displayName}
              <span className='divider'><Fa icon='angle-right' /></span>
              {shared ? 'View Ports' : 'Manage Ports'}
            </h4>

            {shared ? this.renderShared() : this.renderPortEditor()}
          </div>
        )}
      </div>
    );
  }
}
