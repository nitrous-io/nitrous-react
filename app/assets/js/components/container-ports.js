import React, { PropTypes } from 'react';
import { Button, Input, Nav, NavItem, OverlayTrigger, Tooltip, Table,
         Grid, Row, Col } from 'react-bootstrap';

import { PortBinding } from 'records/container-config';
import Host from 'records/host';
import containerActions from 'actions/container-actions';
import containerStore from 'stores/container-store';
import containerConfigStore from 'stores/container-config-store';
import ContextSwitcher from 'components/context-switcher';
import LoadingIndicator from 'components/loading-indicator';
import WorkspaceNav from 'components/workspace-nav';
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

  configuredPortBindings = () => {
    const containerConfig = containerConfigStore.containerConfigByContainerSlug(this.props.params.containerSlug);
    if (!containerConfig) {
      return [];
    }
    let bindings = containerConfig.configuredPortBindings;

    // We only want users to edit port bindings that are:
    //  1. public,
    //  2. TCP,
    //  3. container port is not the SSH port (i.e. port 22).
    bindings = bindings.filter((v) => {
      return v.public && v.tcp && v.containerPort !== '22';
    });
    bindings = bindings.sort((a, b) => {
      if (a.containerPort < b.containerPort) {
        return -1;
      } else if (a.containerPort > b.containerPort) {
        return 1;
      }
      return 0;
    });
    return bindings;
  }

  state = {
    container: containerStore.containerBySlug(this.props.params.containerSlug),
    containerConfig: containerConfigStore.containerConfigByContainerSlug(this.props.params.containerSlug),
    configuredPortBindings: this.configuredPortBindings(),
    processing: false,
    dirty: false, // To indicate that there are unsaved port changes.
    newPort: null,
    newPortInvalid: false
  }

  componentDidMount() {
    const containerSlug = this.props.params.containerSlug;

    containerStore.onChange(this.containerStoreDidChange);
    containerActions.fetchOne(containerSlug);

    containerConfigStore.onChange(this.containerConfigStoreDidChange);
    containerActions.fetchConfig(containerSlug);
  }

  componentWillUnmount() {
    containerStore.offChange(this.containerStoreDidChange);
    containerConfigStore.offChange(this.containerConfigStoreDidChange);
  }

  containerStoreDidChange = () => {
    const container = containerStore.containerBySlug(this.props.params.containerSlug);
    this.setState({ container });
  }

  containerConfigStoreDidChange = () => {
    const containerConfig = containerConfigStore.containerConfigByContainerSlug(this.props.params.containerSlug);
    this.setState({ containerConfig, configuredPortBindings: this.configuredPortBindings() });
  }

  handlePreviewChanged = (binding) => {
    let { configuredPortBindings } = this.state;
    configuredPortBindings = configuredPortBindings.map((v) => {
      return v.merge({ preview: (v === binding) });
    });
    this.setState({ configuredPortBindings });
  }

  handleRemove = (binding) => {
    let { configuredPortBindings } = this.state;
    configuredPortBindings = configuredPortBindings.filterNot((v) => {
      return v === binding;
    });
    this.setState({ configuredPortBindings });
  }

  handleNewPortChanged = (event) => {
    const newPort = event.target.value,
          parsedPort = parseInt(newPort, 10),
          invalid = !(parsedPort >= 1 && parsedPort <= 65535);
    this.setState({ newPort: parsedPort, newPortInvalid: invalid });
  }

  handleAddPort = (event) => {
    event.preventDefault();

    const { newPort } = this.state;
    let { configuredPortBindings } = this.state;

    configuredPortBindings = configuredPortBindings.push(new PortBinding({
      public: true,
      containerPort: newPort,
      tcp: true
    }));

    this.setState({ newPort: null, configuredPortBindings });
  }

  handleApplyChanges = () => {
    this.setState({ processing: true });

    // TODO Actually send a reconfigure API request.
  }

  render() {
    const { container, containerConfig, configuredPortBindings,
            dirty, processing, newPort, newPortInvalid } = this.state,
          { host } = this.context,
          shared = !host,
          loading = (container == null || containerConfig == null),
          { makeHref } = this.context.router;

    return (
      <div className='container-ports-component container-subpage container'>
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
              Manage Ports
            </h4>

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
                {configuredPortBindings.map((binding) => {
                  return (
                    <tr key={`binding-${binding.containerPort}`}>
                      <td>{binding.containerPort}</td>
                      <td>
                        <Input type='radio' name='previewPort'
                          checked={binding.preview}
                          onChange={this.handlePreviewChanged.bind(this, binding)} />
                      </td>
                      <td>
                        <Button bsStyle='warning' onClick={this.handleRemove.bind(this, binding)}>
                          <Fa icon='trash' />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <form onSubmit={this.handleAddPort}>
              <Grid>
                <Row>
                  <Col lg={2} md={2} sm={6} xs={12}>
                    <Input
                      type='number' required placeholder='New container port'
                      value={newPort}
                      bsStyle={newPortInvalid ? 'error' : null}
                      help={newPortInvalid ? 'Please enter a port number from 1-65535' : ''}
                      onChange={this.handleNewPortChanged} />
                  </Col>

                  <Col lg={10} md={10} sm={6} xs={12}>
                    <Button bsStyle='default' type='submit' disabled={newPortInvalid}>Add</Button>
                  </Col>
                </Row>
              </Grid>
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
        )}
      </div>
    );
  }
}
