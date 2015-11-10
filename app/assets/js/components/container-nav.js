import React, { PropTypes } from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import Host from 'records/host';
import Container from 'records/container';
import ContextSwitcher from 'components/context-switcher';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';


export default class ContainerNav extends React.Component {
  displayName = 'ContainerNav';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    // get slug as well because container gets loaded a little late
    // and we need slug to build links
    containerSlug: PropTypes.string.isRequired,
    container: PropTypes.instanceOf(Container),
    host: PropTypes.instanceOf(Host),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ])
  };

  render() {
    const { makeHref } = this.context.router,
          { containerSlug, container, host, activeTab } = this.props,
          shared = !host;

    const makeContainerHref = function(action) {
      return makeHref(`${shared ? 'shared-' : ''}container-${action}`, { containerSlug, hostSlug: (host ? host.slug : null) });
    };

    return (
      <div className='container-nav-component container'>
        {shared ? (
          <ContextSwitcher shared />
        ) : (
          <ContextSwitcher selectedHost={host} />
        )}

        <Breadcrumb>
          {shared ? (
            <BreadcrumbItem href={makeHref('shared-containers')}>Shared With Me</BreadcrumbItem>
          ) : (
            <BreadcrumbItem href={makeHref('containers', { hostSlug: host.slug })}>Projects</BreadcrumbItem>
          )}
          {container ? (
            <BreadcrumbItem active>{container.displayName}</BreadcrumbItem>
          ): ''}
        </Breadcrumb>

        <Grid className='ui-card-grid'>
          <Row>
            <Col lg={2} md={2} sm={3} xs={12}>
              <Nav bsStyle='pills' stacked activeKey={activeTab}>
                <NavItem href={makeContainerHref('collaborators')} eventKey='collaborators'>Collaborators</NavItem>
                <NavItem href={makeContainerHref('keys')} eventKey='keys'>SSH Keys</NavItem>
                <NavItem href={makeContainerHref('ports')} eventKey='ports'>Ports</NavItem>
              </Nav>
            </Col>
            <Col lg={10} md={10} sm={9} xs={12}>
              {this.props.children}
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
