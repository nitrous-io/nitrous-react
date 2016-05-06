import React, { PropTypes } from 'react';
import { Panel, Table, Button, Modal, Input } from 'react-bootstrap';
import Host from 'records/host';
import customDomainActions from 'actions/custom-domain-actions';
import containerActions from 'actions/container-actions';
import containerStore from 'stores/container-store';
import customDomainStore from 'stores/custom-domain-store';
import ContainerNav from 'components/container-nav';
import LoadingIndicator from 'components/loading-indicator';
import Fa from 'components/fa';
import Mp from 'lib/mp';
import MpEvents from 'lib/mp-events';

export default class ContainerCustomDomains extends React.Component {
  displayName = 'ContainerCustomDomains';

  static contextTypes = {
    router: PropTypes.func.isRequired,
    host: PropTypes.instanceOf(Host)
  };

  state = {
    container: null,
    customDomains: null,
    showModal: false,
    adding: false,
    domainName: null,
    port: null,
    containerPort: null
  }

  static propTypes = {
    params: PropTypes.shape({
      containerSlug: PropTypes.string.isRequired
    })
  };

  componentDidMount() {
    const containerSlug = this.props.params.containerSlug;
    customDomainStore.onChange(this.customDomainStoreDidChange);
    customDomainStore.on('added', this.onCustomDomainAdded);
    customDomainStore.on('add-failed', this.onCustomDomainAddFailed);
    customDomainStore.on('deleted', this.onCustomDomainDeleted);

    containerStore.onChange(this.containerStoreDidChange);

    customDomainActions.fetchAllByContainerSlug(containerSlug);
    containerActions.fetchOne(containerSlug);

    Mp.track(MpEvents.EventDashboardViewedContainerCustomDomains);
  }

  componentWillUnmount() {
    customDomainStore.offChange(this.customDomainStoreDidChange);
    customDomainStore.off('added', this.onCustomDomainAdded);
    customDomainStore.off('add-failed', this.onCustomDomainAddFailed);
    customDomainStore.off('deleted', this.onCustomDomainDeleted);
    containerStore.offChange(this.containerStoreDidChange);
  }

  customDomainStoreDidChange = () => {
    const customDomains = customDomainStore.customDomainsByContainerSlug(this.props.params.containerSlug);
    this.setState({ customDomains });
  }

  containerStoreDidChange = () => {
    const container = containerStore.containerBySlug(this.props.params.containerSlug);
    this.setState({ container });
  }

  onCustomDomainAdded = () => {
    this.hideModal();
    this.setState({
      adding: false,
      domainName: null,
      port: null,
      containerPort: null
    });
    const containerSlug = this.props.params.containerSlug;
    customDomainActions.fetchAllByContainerSlug(containerSlug);
  }

  onCustomDomainAddFailed = () => {
    this.setState({ adding: false });
  }

  onCustomDomainDeleted = () => {
    const containerSlug = this.props.params.containerSlug;
    customDomainActions.fetchAllByContainerSlug(containerSlug);
  }

  handleChangeDomainNameField = (event) => {
    this.setState({ domainName: event.target.value });
  }

  handleChangePortField = (event) => {
    this.setState({ port: event.target.value });
  }

  handleChangeContainerPortField = (event) => {
    this.setState({ containerPort: event.target.value });
  }

  handleClickAddDomain = () => {
    this.setState({ showModal: true }, () => {
      this.refs.domainNameField.getInputDOMNode().focus();
    });
  }

  handleAddDomain = (event) => {
    event.preventDefault();
    this.setState({ adding: true });

    const { domainName, port, containerPort } = this.state;
    const containerSlug = this.props.params.containerSlug;

    customDomainActions.add(containerSlug, domainName, port, containerPort);
  }

  handleRemoveDomain = (customDomain) => {
    const containerSlug = this.props.params.containerSlug;
    customDomainActions.delete(containerSlug, customDomain.id);
  }

  hideModal = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { containerSlug } = this.props.params,
          { container, customDomains, showModal,
            adding, domainName, port, containerPort } = this.state,
          { host } = this.context,
          loading = (container == null || customDomains == null);

    return (
      <div className='container-custom-domains-component'>
        <ContainerNav activeTab='custom-domains' containerSlug={containerSlug} container={container} host={host}>
          <Panel header={(<h4>Manage Custom Domains</h4>)}>
            {loading ? (
              <LoadingIndicator />
            ) : (
              <div className="table-responsive">
                <p className='hint'><Fa icon='info-circle' /> <a target="_blank" href="https://community.nitrous.io/docs/custom-domains">How to use Custom Domains</a></p>
                <Table striped bordered>
                  <tbody>
                    <tr>
                      <th width="50%">Domain Name</th>
                      <th width="20%">Port</th>
                      <th width="20%">Project Port</th>
                      <th width="10%"></th>
                    </tr>
                    {customDomains.size > 0 ? customDomains.map((customDomain) => {
                      return (
                        <tr>
                          <td>{customDomain.domain}</td>
                          <td>{customDomain.port}</td>
                          <td>{customDomain.containerPort}</td>
                          <td>
                            <Button bsStyle='default' onClick={this.handleRemoveDomain.bind(this, customDomain)}>
                              <span>Remove</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan='4' className='text-center'>No custom domains</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <Button bsStyle='primary' className='add-domain-button pull-right' onClick={this.handleClickAddDomain}>
                  Add New Domain Name
                </Button>
              </div>
            )}
          </Panel>
        </ContainerNav>

        <Modal show={showModal} onHide={this.hideModal}>
          <form onSubmit={this.handleAddDomain}>
            <Modal.Header>
              <Modal.Title>Add New Domain Name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label htmlFor='domain-name-field'>Domain Name</label>
                <Input type='text' ref='domainNameField' id='domain-name-field'
                  placeholder='www.example.com' required disabled={adding}
                  value={domainName} onChange={this.handleChangeDomainNameField} />
                <label htmlFor='port-field'>Port</label>
                <Input id='port-field'
                  type='number' min='80' max='9999' required
                  placeholder='80' disabled={adding}
                  value={port} onChange={this.handleChangePortField} />
                <label htmlFor='container-port-field'>Project Port</label>
                <Input id='container-port-field'
                  type='number' min='1024' max='9999' required
                  placeholder='1024 - 9999' disabled={adding}
                  value={containerPort} onChange={this.handleChangeContainerPortField} />
            </Modal.Body>
            <Modal.Footer>
              <Button ref='modalCancel' onClick={this.hideModal}>Cancel</Button>
              <Button bsStyle='primary' type='submit' disabled={adding}>
                {adding ? 'Adding...' : 'Add Domain Name'}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    );
  }
}
