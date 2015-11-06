import React from 'react';
import DocsAnchor from 'components/docs-anchor';
import { Grid, Alert, Badge, Button, ButtonGroup, ButtonToolbar, Col, DropdownButton, FormControls, Input, Label, ListGroup, ListGroupItem, MenuItem, Modal, Nav, Navbar, NavDropdown, Panel, PanelGroup, Popover, ProgressBar, Row, SplitButton, Tab, Table, Tabs, Tooltip, Well} from 'react-bootstrap';
import Fa from 'components/fa';
import LoadingIndicator from 'components/loading-indicator';
import snackbarActions from 'actions/snackbar-actions';

// ------------------------------------
export default class DocsUI extends React.Component {
  displayName = 'DocsUI';

  state = {
    loading: false
  };

  handleClick = () => {
    this.setState({loading: !this.state.loading});
    window.setTimeout(() => {
      this.setState({loading: !this.state.loading});
    }, 2000);
  };

  handleShowSnackbar = (kind) => {
    return () => {
      snackbarActions.post("Short Message", kind);
      snackbarActions.post("Hello, this is a longer message", kind);
    };
  };

  // ------------------------------------
  // Typography
  renderTypographyExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="typography">Typography</DocsAnchor></h1>
        <div className="docs-demo-wrapper">
          <Grid>
            <Row>
              <Col lg={4} md={4} sm={6} xs={12}>
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>
                <p className="lead">Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
              </Col>
              <Col lg={4} md={4} sm={6} xs={12}>
                <h2>Example body text</h2>
                <p>Nullam quis risus eget <a href="#">urna mollis ornare</a> vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula.</p>
                <p><small>This line of text is meant to be treated as fine print.</small></p>
                <p>The following snippet of text is <strong>rendered as bold text</strong>.</p>
                <p>The following snippet of text is <em>rendered as italicized text</em>.</p>
                <p>An abbreviation of the word attribute is <abbr title="attribute">attr</abbr>.</p>
              </Col>
              <Col lg={4} md={4} sm={6} xs={12}>
                <h2>Emphasis classes</h2>
                <p className="text-muted">Fusce dapibus, tellus ac cursus commodo, tortor mauris nibh.</p>
                <p className="text-primary">Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                <p className="text-warning">Etiam porta sem malesuada magna mollis euismod.</p>
                <p className="text-danger">Donec ullamcorper nulla non metus auctor fringilla.</p>
                <p className="text-success">Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Buttons
  renderButtonsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="buttons">Buttons</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <Button>Default</Button>
            <Button bsStyle="primary">Primary</Button>
            <Button bsStyle="success">Success</Button>
            <Button bsStyle="info">Info</Button>
            <Button bsStyle="warning">Warning</Button>
            <Button bsStyle="danger">Danger</Button>
            <Button bsStyle="link">Link</Button>
          </ButtonToolbar>

          <ButtonToolbar>
            <Button active>Default</Button>
            <Button bsStyle="primary" active>Primary</Button>
            <Button bsStyle="success" active>Success</Button>
            <Button bsStyle="info" active>Info</Button>
            <Button bsStyle="warning" active>Warning</Button>
            <Button bsStyle="danger" active>Danger</Button>
            <Button bsStyle="link" active>Link</Button>
          </ButtonToolbar>

          <ButtonToolbar>
            <Button disabled>Default</Button>
            <Button bsStyle="primary" disabled>Primary</Button>
            <Button bsStyle="success" disabled>Success</Button>
            <Button bsStyle="info" disabled>Info</Button>
            <Button bsStyle="warning" disabled>Warning</Button>
            <Button bsStyle="danger" disabled>Danger</Button>
            <Button bsStyle="link" disabled>Link</Button>
          </ButtonToolbar>
        </div>

        <h2 className="docs-title"><DocsAnchor id="buttons-sizes">Sizes</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <Button bsStyle="primary" bsSize="large">Large button</Button>
            <Button bsSize="large">Large button</Button>
          </ButtonToolbar>
          <ButtonToolbar>
            <Button bsStyle="primary">Default button</Button>
            <Button>Default button</Button>
          </ButtonToolbar>
          <ButtonToolbar>
            <Button bsStyle="primary" bsSize="small">Small button</Button>
            <Button bsSize="small">Small button</Button>
          </ButtonToolbar>
          <ButtonToolbar>
            <Button bsStyle="primary" bsSize="xsmall">Extra small button</Button>
            <Button bsSize="xsmall">Extra small button</Button>
          </ButtonToolbar>
        </div>

        <h2 className="docs-title"><DocsAnchor id="buttons-sizes">Block level buttons</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <Button bsStyle="primary" bsSize="large" block>Block level button</Button>
          <Button bsSize="large" block>Block level button</Button>
        </div>

        <h2 className="docs-title"><DocsAnchor id="buttons-loading">Button loading state</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <Button onClick={this.handleClick} disabled={this.state.loading}>
              {!this.state.loading ? 'Click to load' : 'Loading...'}
            </Button>
          </ButtonToolbar>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={this.handleClick} disabled={this.state.loading}>
              {!this.state.loading ? 'Click to load' : 'Loading...'}
            </Button>
          </ButtonToolbar>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Button Groups
  renderButtonGroupsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="btn-groups">Button groups</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <ButtonGroup>
            <Button>Left</Button>
            <Button>Middle</Button>
            <Button>Right</Button>
          </ButtonGroup>
        </div>

        <h3 className="docs-title"><DocsAnchor id="btn-groups-toolbar">Button toolbar</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <ButtonGroup>
              <Button>1</Button>
              <Button>2</Button>
              <Button>3</Button>
              <Button>4</Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button>5</Button>
              <Button>6</Button>
              <Button>7</Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button>8</Button>
              <DropdownButton title="Dropdown" id="bg-nested-dropdown">
                <MenuItem eventKey="1">Dropdown link</MenuItem>
                <MenuItem eventKey="2">Dropdown link</MenuItem>
              </DropdownButton>
            </ButtonGroup>
          </ButtonToolbar>
        </div>

        <h3 className="docs-title"><DocsAnchor id="btn-groups-sizing">Sizing</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <ButtonGroup bsSize="large">
              <Button>Left</Button>
              <Button>Middle</Button>
              <Button>Right</Button>
            </ButtonGroup>
          </ButtonToolbar>

          <ButtonToolbar>
            <ButtonGroup>
              <Button>Left</Button>
              <Button>Middle</Button>
              <Button>Right</Button>
            </ButtonGroup>
          </ButtonToolbar>

          <ButtonToolbar>
            <ButtonGroup bsSize="small">
              <Button>Left</Button>
              <Button>Middle</Button>
              <Button>Right</Button>
            </ButtonGroup>
          </ButtonToolbar>

          <ButtonToolbar>
            <ButtonGroup bsSize="xsmall">
              <Button>Left</Button>
              <Button>Middle</Button>
              <Button>Right</Button>
            </ButtonGroup>
          </ButtonToolbar>
        </div>

        <h3 className="docs-title"><DocsAnchor id="btn-groups-vertical">Vertical variation</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ButtonGroup vertical>
            <Button>Button</Button>
            <Button>Button</Button>
            <DropdownButton title="Dropdown" id="bg-vertical-dropdown-1">
              <MenuItem eventKey="1">Dropdown link</MenuItem>
              <MenuItem eventKey="2">Dropdown link</MenuItem>
            </DropdownButton>
            <Button>Button</Button>
            <Button>Button</Button>
            <DropdownButton title="Dropdown" id="bg-vertical-dropdown-2">
              <MenuItem eventKey="1">Dropdown link</MenuItem>
              <MenuItem eventKey="2">Dropdown link</MenuItem>
            </DropdownButton>
            <DropdownButton title="Dropdown" id="bg-vertical-dropdown-3">
              <MenuItem eventKey="1">Dropdown link</MenuItem>
              <MenuItem eventKey="2">Dropdown link</MenuItem>
            </DropdownButton>
            </ButtonGroup>
        </div>

        <h3 className="docs-title"><DocsAnchor id="btn-groups-justified">Justified button groups</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ButtonGroup justified>
            <Button href="#">Left</Button>
            <Button href="#">Middle</Button>
            <DropdownButton title="Dropdown" id="bg-justified-dropdown">
              <MenuItem eventKey="1">Dropdown link</MenuItem>
              <MenuItem eventKey="2">Dropdown link</MenuItem>
            </DropdownButton>
          </ButtonGroup>

          <ButtonGroup justified>
            <Button bsStyle="primary" href="#">Left</Button>
            <Button bsStyle="primary" href="#">Middle</Button>
            <DropdownButton bsStyle="primary" title="Dropdown" id="bg-justified-dropdown">
              <MenuItem eventKey="1">Dropdown item</MenuItem>
              <MenuItem eventKey="2">Dropdown item</MenuItem>
            </DropdownButton>
          </ButtonGroup>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Button Dropdowns
  renderButtonDropdownsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="btn-dropdowns">Button dropdowns</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <DropdownButton bsStyle="default" title="Default" id="dropdown-basic-1">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="primary" title="Primary" id="dropdown-basic-2">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="success" title="Success" id="dropdown-basic-3">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="info" title="Info" id="dropdown-basic-4">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="warning" title="Warning" id="dropdown-basic-5">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="danger" title="Danger" id="dropdown-basic-6">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="link" title="Link" id="dropdown-basic-7">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>

          <ButtonToolbar>
            <DropdownButton bsStyle="default" title="Default" id="dropdown-basic-1" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="primary" title="Primary" id="dropdown-basic-2" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="success" title="Success" id="dropdown-basic-3" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="info" title="Info" id="dropdown-basic-4" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="warning" title="Warning" id="dropdown-basic-5" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="danger" title="Danger" id="dropdown-basic-6" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="link" title="Link" id="dropdown-basic-7" active>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>

          <ButtonToolbar>
            <DropdownButton bsStyle="default" title="Default" id="dropdown-basic-1" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="primary" title="Primary" id="dropdown-basic-2" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="success" title="Success" id="dropdown-basic-3" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="info" title="Info" id="dropdown-basic-4" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="warning" title="Warning" id="dropdown-basic-5" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="danger" title="Danger" id="dropdown-basic-6" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>

            <DropdownButton bsStyle="link" title="Link" id="dropdown-basic-7" disabled>
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3" active>Active Item</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>
        </div>

        <h3 className="docs-title"><DocsAnchor id="btn-dropdowns-split">Split button dropdowns</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <SplitButton bsStyle="default" title="Default" id="split-button-basic-1">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </SplitButton>

            <SplitButton bsStyle="primary" title="Primary" id="split-button-basic-2">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </SplitButton>

            <SplitButton bsStyle="success" title="Success" id="split-button-basic-3">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </SplitButton>

            <SplitButton bsStyle="info" title="Info" id="split-button-basic-4">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </SplitButton>

            <SplitButton bsStyle="warning" title="Warning" id="split-button-basic-5">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </SplitButton>

            <SplitButton bsStyle="danger" title="Danger" id="split-button-basic-6">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </SplitButton>
          </ButtonToolbar>
        </div>

        <h3 className="docs-title"><DocsAnchor id="btn-dropdowns-sizing">Sizing</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <DropdownButton bsSize="large" title="Large button" id="dropdown-size-large">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>

          <ButtonToolbar>
            <DropdownButton title="Default button" id="dropdown-size-medium">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>

          <ButtonToolbar>
            <DropdownButton bsSize="small" title="Small button" id="dropdown-size-small">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>

          <ButtonToolbar>
            <DropdownButton bsSize="xsmall" title="Extra small button" id="dropdown-size-extra-small">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </ButtonToolbar>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Loading Indicator
  renderLoadingIndicatorExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="loading-indicator">Loading Indicator</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <LoadingIndicator />
        </div>
        <div className="docs-demo-wrapper">
          <LoadingIndicator large />
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Snackbar
  renderSnackbarExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="panels">Snackbar</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <Button onClick={this.handleShowSnackbar('info')} bsStyle="info">Info Snackbar</Button>
            <Button onClick={this.handleShowSnackbar('warning')} bsStyle="warning">Warning Snackbar</Button>
            <Button onClick={this.handleShowSnackbar('error')} bsStyle="danger">Error Snackbar</Button>
          </ButtonToolbar>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Menu Items
  renderMenuItemsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="menu-item">Menu Item</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <div className="clearfix">
            <ul className="dropdown-menu open">
              <MenuItem eventKey="1">Action</MenuItem>
              <MenuItem eventKey="2">Another action</MenuItem>
              <MenuItem eventKey="3">
                Something else here
                <Badge eventKey='shared' pullRight>1</Badge>
              </MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </ul>
          </div>
        </div>
        <div className="docs-demo-wrapper">
          <div className="clearfix">
            <ul className="dropdown-menu open">
              <MenuItem header>Header</MenuItem>
              <MenuItem>link</MenuItem>
              <MenuItem divider/>
              <MenuItem header>Header</MenuItem>
              <MenuItem>link</MenuItem>
              <MenuItem disabled>disabled</MenuItem>
              <MenuItem title="See? I have a title.">
                link with title
              </MenuItem>
              <MenuItem href="#someHref">
                link that alerts
              </MenuItem>
            </ul>
          </div>
        </div>
        <div className="docs-demo-wrapper">
          <div className="clearfix">
            <ul className="dropdown-menu open">
              <MenuItem><Fa icon="pencil" />Rename Project</MenuItem>
              <MenuItem divider/>
              <MenuItem><Fa icon="globe" />Preview</MenuItem>
              <MenuItem><Fa icon="wrench" />Manage Ports</MenuItem>
              <MenuItem><Fa icon="rotate-left" />Snapshot...</MenuItem>
              <MenuItem divider/>
              <MenuItem><Fa icon="trash" />Delete Project</MenuItem>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Panels
  renderPanelExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="panels">Panels</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <Panel>
            Basic panel example
          </Panel>
        </div>

        <h3 className="docs-title"><DocsAnchor id="panels-heading">Panel with heading</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <div>
            <Panel header="Panel heading without title">
              Panel content
            </Panel>
            <Panel header={<h3>Panel title</h3>}>
              Panel content
            </Panel>
          </div>
        </div>

        <h3 className="docs-title"><DocsAnchor id="panels-footer">Panel with footer</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <Panel footer="Panel footer">
            Panel content
          </Panel>
        </div>

        <h3 className="docs-title"><DocsAnchor id="panels-contextual">Contextual alternatives</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <div>
            <Panel header="Title">
              Panel content
            </Panel>

            <Panel header="Title" bsStyle="primary">
              Panel content
            </Panel>

            <Panel header="Title" bsStyle="success">
              Panel content
            </Panel>

            <Panel header="Title" bsStyle="info">
              Panel content
            </Panel>

            <Panel header="Title" bsStyle="warning">
              Panel content
            </Panel>

            <Panel header="Title" bsStyle="danger">
              Panel content
            </Panel>
          </div>
        </div>

        <h3 className="docs-title"><DocsAnchor id="panels-uncontrolled">Uncontrolled PanelGroups</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <PanelGroup defaultActiveKey="1" accordion>
            <Panel header="Panel 1" eventKey="1">Panel 1 content</Panel>
            <Panel header="Panel 2" eventKey="2">Panel 2 content</Panel>
            <Panel header="Panel 3" eventKey="3">Panel 3 content</Panel>
          </PanelGroup>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Modals
  renderModalsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="modals">Modals</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <div className="static-modal">
            <Modal.Dialog onHide={() => {}}>
              <Modal.Header>
                <Modal.Title>Modal title</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                One fine body...
              </Modal.Body>

              <Modal.Footer>
                <Button>Close</Button>
              </Modal.Footer>

            </Modal.Dialog>
          </div>
        </div>

        <div className="docs-demo-wrapper">
          <div className="static-modal">
            <Modal.Dialog onHide={() => {}}>
              <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h4>Text in a modal</h4>
                <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
              </Modal.Body>
              <Modal.Footer>
                <Button>Cancel</Button>
                <Button bsStyle="primary">Save changes</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </div>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Tooltips
  renderTooltipExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="tooltips">Tooltip</DocsAnchor></h1>
        <div className="docs-demo-wrapper">
          <Tooltip placement="right" className="in">
            Tooltip right
          </Tooltip>

          <Tooltip placement="top" className="in">
            Tooltip top
          </Tooltip>

          <Tooltip placement="left" className="in">
            Tooltip left
          </Tooltip>

          <Tooltip placement="bottom" className="in">
            Tooltip bottom
          </Tooltip>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Popovers
  renderPopoverExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="popovers">Popovers</DocsAnchor></h1>
        <div className="docs-demo-wrapper">
          <div className="popover-wrapper">
            <Popover placement="right" positionLeft={200} positionTop={10} title="Popover right">
              And here's some <strong>amazing</strong> content. It's very engaging. right?
            </Popover>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Progress Bars
  renderProgressbarExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="progress">Progress bars</DocsAnchor></h1>

        <h2 className="docs-title"><DocsAnchor id="progress-basic">Basic example</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <ProgressBar now={60} />
        </div>

        <h2 className="docs-title"><DocsAnchor id="progress-label">With label</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <ProgressBar now={60} label="%(percent)s%" />
        </div>

        <h2 className="docs-title"><DocsAnchor id="progress-animated">Animated</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <ProgressBar active now={45} />
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Navbar
  renderNavbarExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="navbar">Navbar</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <Navbar>
            <div className="navbar-header">
              <a className="navbar-brand active" href="#/">
                <span>Nitrous</span>
              </a>
            </div>
            <Nav right>
              <NavDropdown eventKey={3} title={<span><img className="gravatar" src="https://secure.gravatar.com/avatar/2ccca9397738305d719dd73e3c47f638?default=retro&secure=true&size=40" /><span className="username">User</span></span>} id="basic-nav-dropdown" className='account-menu'>
                <MenuItem eventKey="1">Account Settings</MenuItem>
                <MenuItem eventKey="2">Billing</MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="3" disabled>Send Feedback</MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="4">Documentation</MenuItem>
                <MenuItem eventKey="5">Tutorials</MenuItem>
                <MenuItem eventKey="6">Blog</MenuItem>
                <MenuItem divider />
                <MenuItem eventKey="7">Log Out</MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Tabs
  renderTabsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="tabs">Tabs</DocsAnchor></h1>

        <h3 className="docs-title"><DocsAnchor id="tabs-uncontrolled">Uncontrolled</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <Tabs defaultActiveKey="2">
            <Tab eventKey="1" title="Tab 1">Tab 1 content</Tab>
            <Tab eventKey="2" title="Tab 2">Tab 2 content</Tab>
            <Tab eventKey="3" title="Tab 3">Tab 3 content</Tab>
            <Tab eventKey="4" title="Tab 4">Tab 4 content</Tab>
            <Tab eventKey="5" title="Tab 5" disabled>Tab 5 content</Tab>
          </Tabs>
        </div>

        <h3 className="docs-title"><DocsAnchor id="tabs-no-animation">No animation</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <Tabs defaultActiveKey="2" animation={false}>
            <Tab eventKey="1" title="Tab 1">Tab 1 content</Tab>
            <Tab eventKey="2" title="Tab 2">Tab 2 content</Tab>
            <Tab eventKey="3" title="Tab 3">Tab 3 content</Tab>
            <Tab eventKey="4" title="Tab 4">Tab 4 content</Tab>
            <Tab eventKey="5" title="Tab 5" disabled>Tab 5 content</Tab>
          </Tabs>
        </div>

        <h3 className="docs-title"><DocsAnchor id="tabs-centered">Centered Tabs</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <Tabs defaultActiveKey="2" animation={false} className='ui-centered-tabs'>
            <Tab eventKey="1" title="Tab 1">Tab 1 content</Tab>
            <Tab eventKey="2" title="Tab 2">Tab 2 content</Tab>
            <Tab eventKey="3" title="Tab 3">Tab 3 content</Tab>
            <Tab eventKey="4" title="Tab 4">Tab 4 content</Tab>
            <Tab eventKey="5" title="Tab 5" disabled>Tab 5 content</Tab>
          </Tabs>
        </div>

        <h3 className="docs-title"><DocsAnchor id="left-tabs">Left tabs</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <Tabs defaultActiveKey="2" position="left" tabWidth={2}>
            <Tab eventKey="1" title="Tab 1">Tab 1 content</Tab>
            <Tab eventKey="2" title="Tab 2">Tab 2 content</Tab>
            <Tab eventKey="3" title="Tab 3">Tab 3 content</Tab>
            <Tab eventKey="4" title="Tab 4">Tab 4 content</Tab>
            <Tab eventKey="5" title="Tab 5" disabled>Tab 5 content</Tab>
          </Tabs>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Alerts
  renderAlertsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="alerts">Alert messages</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <Alert bsStyle="success" onDismiss={() => {}}>
            <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
          </Alert>

          <Alert bsStyle="warning" onDismiss={() => {}}>
            <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
          </Alert>

          <Alert bsStyle="info" onDismiss={() => {}}>
            <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
          </Alert>

          <Alert bsStyle="danger" onDismiss={() => {}}>
            <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
          </Alert>
        </div>

        <h4 className="docs-title"><DocsAnchor id="alerts-closeable">Closeable alerts</DocsAnchor></h4>
        <div className="docs-demo-wrapper">
          <Alert bsStyle="danger" onDismiss={() => {}}>
            <h4>Oh snap! You got an error!</h4>
            <p>Change this and that and try again. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Cras mattis consectetur purus sit amet fermentum.</p>
            <p>
              <Button bsStyle="danger">Take this action</Button>
              <span> or </span>
              <Button>Hide Alert</Button>
            </p>
          </Alert>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // List Group
  renderListGroupExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="listgroup">List group</DocsAnchor></h1>

        <h3 className="docs-title"><DocsAnchor id="listgroup-default">Default</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ListGroup>
            <ListGroupItem>Item 1</ListGroupItem>
            <ListGroupItem>Item 2</ListGroupItem>
            <ListGroupItem>Item 3</ListGroupItem>
            <ListGroupItem>Item 4</ListGroupItem>
            <ListGroupItem>...</ListGroupItem>
          </ListGroup>
        </div>

        <h3 className="docs-title"><DocsAnchor id="listgroup-styling-state">Styling by state</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ListGroup>
            <ListGroupItem href="#" active>Link 1</ListGroupItem>
            <ListGroupItem href="#">Link 2</ListGroupItem>
            <ListGroupItem href="#" disabled>Link 3</ListGroupItem>
          </ListGroup>
        </div>

        <h3 className="docs-title"><DocsAnchor id="listgroup-styling-color">Styling by color</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ListGroup>
            <ListGroupItem bsStyle="success">Success</ListGroupItem>
            <ListGroupItem bsStyle="info">Info</ListGroupItem>
            <ListGroupItem bsStyle="warning">Warning</ListGroupItem>
            <ListGroupItem bsStyle="danger">Danger</ListGroupItem>
          </ListGroup>
        </div>

        <h3 className="docs-title"><DocsAnchor id="listgroup-with-header">With header</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <ListGroup>
            <ListGroupItem header="Heading 1">Some body text</ListGroupItem>
            <ListGroupItem header="Heading 2" href="#">Linked item</ListGroupItem>
            <ListGroupItem header="Heading 3" bsStyle="danger">Danger styling</ListGroupItem>
          </ListGroup>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Labels
  renderLabelsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="labels">Labels</DocsAnchor></h1>
        <div className="docs-demo-wrapper">
          <div>
            <h1>Label <Label>New</Label></h1>
            <h2>Label <Label>New</Label></h2>
            <h3>Label <Label>New</Label></h3>
            <h4>Label <Label>New</Label></h4>
            <h5>Label <Label>New</Label></h5>
            <p>Label <Label>New</Label></p>
          </div>
        </div>

        <h3 className="docs-title"><DocsAnchor id="labels-variations">Available variations</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <div>
            <Label bsStyle="default">Default</Label>&nbsp;
            <Label bsStyle="primary">Primary</Label>&nbsp;
            <Label bsStyle="success">Success</Label>&nbsp;
            <Label bsStyle="info">Info</Label>&nbsp;
            <Label bsStyle="warning">Warning</Label>&nbsp;
            <Label bsStyle="danger">Danger</Label>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Badges
  renderBadgesExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="badges">Badges</DocsAnchor></h1>
        <div className="docs-demo-wrapper">
          <p>Badges <Badge>42</Badge></p>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Wells
  renderWellsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="wells">Wells</DocsAnchor></h1>
        <Well>Look I'm in a well!</Well>
        <h2 className="docs-title"><DocsAnchor id="wells-optional">Optional classes</DocsAnchor></h2>
        <Well bsSize="large">Look I'm in a large well!</Well>
        <Well bsSize="small">Look I'm in a small well!</Well>
      </div>
    );
  }

  // ------------------------------------
  // Tables
  renderTablesExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="tables">Tables</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Lorem</td>
                <td>Ipsum</td>
                <td>LoremIpsum</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Lorem</td>
                <td>Ipsum</td>
                <td>LoremIpsum</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Lorem</td>
                <td>Ipsum</td>
                <td>LoremIpsum</td>
              </tr>
              <tr>
                <td>4</td>
                <td colSpan="2">Lorem Ipsum</td>
                <td>LoremIpsum</td>
              </tr>
            </tbody>
          </Table>
        </div>

        <h2><DocsAnchor id="table-responsive">Responsive</DocsAnchor></h2>
        <div className="docs-demo-wrapper">
          <Table responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Table heading</th>
                <th>Table heading</th>
                <th>Table heading</th>
                <th>Table heading</th>
                <th>Table heading</th>
                <th>Table heading</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
                <td>Table cell</td>
              </tr>
            </tbody>
          </Table>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Inputs
  renderInputsExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="inputs">Forms & Inputs</DocsAnchor></h1>

        <h3 className="docs-title"><DocsAnchor id="input-types">Types</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <form>
            <Input type="text" label="Text" placeholder="Enter text" />
            <Input type="email" label="Email Address" placeholder="Enter email" />
            <Input type="password" label="Password" />
            <Input type="file" label="File"/>
            <Input type="checkbox" label="Checkbox" checked readOnly />
            <Input type="checkbox" label="Checkbox" />
            <Input type="radio" label="Radio" id="optionsRadios1" name="optionsRadios" />
            <Input type="radio" label="Radio" id="optionsRadios2" name="optionsRadios" />
            <Input type="select" label="Select" placeholder="select">
              <option value="select">select</option>
              <option value="other">...</option>
            </Input>
            <Input type="select" label="Multiple Select" multiple>
              <option value="select">select (multiple)</option>
              <option value="other">...</option>
            </Input>
            <Input type="textarea" label="Text Area" placeholder="textarea" />
          </form>
        </div>

        <h3 className="docs-title"><DocsAnchor id="input-static">FormControls.Static</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <form className="form-horizontal">
            <FormControls.Static className="col-xs-10 col-xs-offset-2" value="I'm in a form" />
            <FormControls.Static label="First Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10" value="Billy" />
            <FormControls.Static label="Last Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10">Bob</FormControls.Static>
          </form>
        </div>

        <h3 className="docs-title"><DocsAnchor id="input-addons">Add-ons</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <form>
            <Input type="text" addonBefore="@" />
            <Input type="text" addonAfter=".00" />
            <Input type="text" addonBefore="$" addonAfter=".00" />
            <Input type="text" addonAfter={<Fa icon="terminal" />} />
            <Input type="text" addonBefore={<input type="checkbox" aria-label="..." />} />
            <Input type="text" buttonAfter={
              <DropdownButton title="Action" id="input-dropdown-addon">
              <MenuItem key="1">Item</MenuItem>
              </DropdownButton>
            } />
          </form>
        </div>

        <h3 className="docs-title"><DocsAnchor id="input-sizes">Sizes</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <form>
            <Input type="text" bsSize="large" placeholder="Large text" />
            <Input type="text" bsSize="medium" placeholder="Normal text" />
            <Input type="text" bsSize="small" placeholder="Small text" />
          </form>
        </div>

        <h3 className="docs-title"><DocsAnchor id="input-validation">Validation</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <form>
            <Input type="text" bsStyle="success" label="Success" hasFeedback />
            <Input type="text" bsStyle="warning" label="Warning" hasFeedback />
            <Input type="text" bsStyle="error" label="Error" hasFeedback />
          </form>
        </div>

        <h3 className="docs-title"><DocsAnchor id="input-horizontal">Horizontal forms</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <form className="form-horizontal">
            <Input type="text" label="Text" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
            <Input type="textarea" label="Textarea" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
            <Input type="checkbox" label="Checkbox" wrapperClassName="col-xs-offset-2 col-xs-10" />
          </form>
        </div>

        <h3 className="docs-title"><DocsAnchor id="input-wrapper">Use as a wrapper</DocsAnchor></h3>
        <div className="docs-demo-wrapper">
          <Input label="Input wrapper" help="Use this when you need something other than the available input types." wrapperClassName="wrapper">
            <Row>
              <Col xs={6}>
                <input type="text" className="form-control" />
              </Col>
              <Col xs={6}>
                <input type="text" className="form-control" />
              </Col>
            </Row>
          </Input>
        </div>

      </div>
    );
  }

  // ------------------------------------
  // Font Awesome
  renderFaExample() {
    return (
      <div className="bs-docs-section">
        <h1 className="page-header"><DocsAnchor id="fa">Font Awesome</DocsAnchor></h1>

        <div className="docs-demo-wrapper">
          <ButtonToolbar>
            <ButtonGroup>
              <Button><Fa icon="align-left" /></Button>
              <Button><Fa icon="align-center" /></Button>
              <Button><Fa icon="align-right" /></Button>
              <Button><Fa icon="align-justify" /></Button>
            </ButtonGroup>
          </ButtonToolbar>

          <ButtonToolbar>
            <ButtonGroup>
              <Button bsSize="large"><Fa icon="star" /> Star</Button>
              <Button><Fa icon="star" /> Star</Button>
              <Button bsSize="small"><Fa icon="star" /> Star</Button>
              <Button bsSize="xsmall"><Fa icon="star" /> Star</Button>
            </ButtonGroup>
          </ButtonToolbar>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='ui-component'>
        <div className='container'>
          <Navbar fixedTop>
            <div className="navbar-header">
              <a className="navbar-brand active" href="#/">
                <span>Nitrous</span>
              </a>
            </div>
            <Nav right>
              <NavDropdown title='Components' id="basic-nav-dropdown">
                <MenuItem href="#/ui?focus=typography">Typography</MenuItem>
                <MenuItem href="#/ui?focus=buttons">Buttons</MenuItem>
                <MenuItem href="#/ui?focus=btn-groups">Button Groups</MenuItem>
                <MenuItem href="#/ui?focus=btn-dropdowns">Button Dropdowns</MenuItem>
                <MenuItem href="#/ui?focus=loading-indicator">Loading Indicator</MenuItem>
                <MenuItem href="#/ui?focus=snackbar">Snackbar</MenuItem>
                <MenuItem href="#/ui?focus=menu-item">Menu Item</MenuItem>
                <MenuItem href="#/ui?focus=panels">Panels</MenuItem>
                <MenuItem href="#/ui?focus=modals">Modals</MenuItem>
                <MenuItem href="#/ui?focus=tooltips">Tooltips</MenuItem>
                <MenuItem href="#/ui?focus=popovers">Popovers</MenuItem>
                <MenuItem href="#/ui?focus=progress">Progress Bars</MenuItem>
                <MenuItem href="#/ui?focus=navbar">Navbar</MenuItem>
                <MenuItem href="#/ui?focus=tabs">Tabs</MenuItem>
                <MenuItem href="#/ui?focus=alerts">Alert Messages</MenuItem>
                <MenuItem href="#/ui?focus=listgroup">List Group</MenuItem>
                <MenuItem href="#/ui?focus=labels">Labels</MenuItem>
                <MenuItem href="#/ui?focus=badges">Badges</MenuItem>
                <MenuItem href="#/ui?focus=wells">Wells</MenuItem>
                <MenuItem href="#/ui?focus=tables">Tables</MenuItem>
                <MenuItem href="#/ui?focus=inputs">Forms & Inputs</MenuItem>
                <MenuItem href="#/ui?focus=fa">Font Awesome</MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar>

          <div className="container bs-docs-container">
            <div className="row">
              <div className="col-lg-12" role="main">

                {this.renderTypographyExample()}

                {this.renderButtonsExample()}

                {this.renderButtonGroupsExample()}

                {this.renderButtonDropdownsExample()}

                {this.renderLoadingIndicatorExample()}

                {this.renderSnackbarExample()}

                {this.renderMenuItemsExample()}

                {this.renderPanelExample()}

                {this.renderModalsExample()}

                {this.renderTooltipExample()}

                {this.renderPopoverExample()}

                {this.renderProgressbarExample()}

                {this.renderNavbarExample()}

                {this.renderTabsExample()}

                {this.renderAlertsExample()}

                {this.renderListGroupExample()}

                {this.renderLabelsExample()}

                {this.renderBadgesExample()}

                {this.renderWellsExample()}

                {this.renderTablesExample()}

                {this.renderInputsExample()}

                {this.renderFaExample()}

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
