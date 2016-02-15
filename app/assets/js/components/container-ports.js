import React, { PropTypes } from 'react';
import { Panel, Button, ButtonToolbar, Input, Modal, OverlayTrigger, Tooltip, Table } from 'react-bootstrap';
import { PortBinding } from 'records/container-config';
import Host from 'records/host';
import containerActions from 'actions/container-actions';
import snackbarActions from 'actions/snackbar-actions';
import containerStore from 'stores/container-store';
import hostStore from 'stores/host-store';
import containerConfigStore from 'stores/container-config-store';
import ContainerNav from 'components/container-nav';
import LoadingIndicator from 'components/loading-indicator';
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
    newPortInvalid: false,
    showModal: false
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
      this.hideModal();
      this.setState({ processing: false });
      containerActions.fetchConfig(this.props.params.containerSlug);
    }
  }

  onContainerReconfigFailed = (data) => {
    const { containerSlug } = data;
    if (containerSlug === this.props.params.containerSlug) {
      this.hideModal();
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
    this.setState({ showModal: true });
  }

  handleApplyChangesCancel = () => {
    this.setState({ showModal: false });
  }

  handleApplyChangesOK = () => {
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

  hideModal = () => {
    this.setState({ showModal: false });
  }

  isDirty() {
    const { portBindings } = this.state;
    if (!portBindings) {
      return false;
    }
    return !portBindings.equals(this.findPortBindings());
  }

  renderPortEditor() {
    const { portBindings, processing, newPort, newPortInvalid } = this.state,
          dirty = this.isDirty();

    return (
      <div>
        <Table responsive hover>
          <thead>
            <tr>
              <th>
                <OverlayTrigger placement='top'
                  overlay={<Tooltip id='primary-port-tooltip'>Accessible from port 80</Tooltip>}>
                  <span>Primary <Fa icon='question-circle' /></span>
                </OverlayTrigger>
              </th>
              <th>Open Ports</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {portBindings.size > 0 ? portBindings.map((binding) => {
              return (
                <tr key={`binding-${binding.containerPort}`}>
                  <td className='col-preview col-md-2'>
                    <Input type='radio' name='previewPort'
                      checked={binding.preview}
                      disabled={processing}
                      onChange={this.handlePreviewChanged.bind(this, binding)} />
                  </td>
                  <td className='col-port col-md-2'>{binding.containerPort}</td>
                  <td className='col-md-8'>
                    <Button bsStyle='default'
                      className='pull-right'
                      disabled={processing}
                      onClick={this.handleRemove.bind(this, binding)}>
                      <Fa icon='close' />
                      <span>Remove</span>
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

        <div className='port-form-wrapper'>
          <form onSubmit={this.handleAddPort}>
            <Input
              label='Add Port'
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
        </div>

        <ButtonToolbar>
          <Button className='pull-right'
            bsStyle='primary'
            disabled={!dirty || processing}
            onClick={this.handleApplyChanges}>
            {processing ? 'Applying Changes...' : 'Apply Changes'}
          </Button>
        </ButtonToolbar>
      </div>
    );
  }

  renderShared() {
    const { portBindings } = this.state;

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>
              <OverlayTrigger placement='top'
                overlay={<Tooltip id='primary-port-tooltip'>Accessible from port 80</Tooltip>}>
                <span>Primary <Fa icon='question-circle' /></span>
              </OverlayTrigger>
            </th>
            <th>Open Ports</th>
          </tr>
        </thead>
        <tbody>
          {portBindings.size > 0 ? portBindings.map((binding) => {
            return (
              <tr key={`binding-${binding.containerPort}`}>
                <td className='col-preview col-md-2'>
                  <Input type='radio' name='previewPort' disabled
                    checked={binding.preview} />
                </td>
                <td className='col-port'>{binding.containerPort}</td>
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
    const { containerSlug } = this.props.params,
          { container, containerConfig, processing } = this.state,
          { host } = this.context,
          shared = !host,
          loading = (container == null || containerConfig == null);

    return (
      <div className='container-ports-component'>
        <ContainerNav activeTab='ports' containerSlug={containerSlug} container={container} host={host}>
          <Panel header={(<h4>{shared ? 'View' : 'Manage'} Ports</h4>)}>
            {loading ? (
              <LoadingIndicator />
            ) : (
              shared ? this.renderShared() : this.renderPortEditor()
            )}
          </Panel>
        </ContainerNav>

        <Modal show={this.state.showModal} onHide={this.hideModal}>
          <Modal.Header>
            <Modal.Title>Restart Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Your project will be restarted for the port changes you've made to take effect.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleApplyChangesCancel}>Cancel</Button>
            <Button bsStyle='danger'
              disabled={processing}
              onClick={processing ? null : this.handleApplyChangesOK}>
              {processing ? 'Applying Changes...' : 'Apply Changes and Restart'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
