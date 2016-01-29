import React, { PropTypes } from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';

import hostStore from 'stores/host-store';
import hostActions from 'actions/host-actions';

export default class UserNav extends React.Component {
  displayName = 'UserNav';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  constructor(props, context) {
    super(props, context);

    const hosts = hostStore.userHosts,
          hasFreeHost = !this.hasFreeHost(hosts).isEmpty();
 
    this.state = {
      hasFreeHost
    };
  }

  componentDidMount() {
    hostActions.fetchAll();
    hostStore.onChange(this.hostStoreDidChange);
  }

  componentWillUnmount() {
    hostStore.offChange(this.hostStoreDidChange);
  }

  hostStoreDidChange = () => {
    const hosts = hostStore.userHosts,
          hasFreeHost = !this.hasFreeHost(hosts).isEmpty();
    this.setState({ hasFreeHost });
  }

  hasFreeHost(hosts) {
    return hosts.find((h) => {
      return h.free;
    });
  }

  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ])
  }

  render() {
    const { makeHref } = this.context.router,
          { hasFreeHost } = this.state,
          { activeTab } = this.props;

    return (
      <div className='user-nav-component container'>
        <Breadcrumb className='no-margin'>
          <BreadcrumbItem href={makeHref('dashboard')}>Dashboard</BreadcrumbItem>
          <BreadcrumbItem active>Personal Account</BreadcrumbItem>
        </Breadcrumb>

        <Grid className='ui-card-grid'>
          <Row>
            <Col lg={2} md={2} sm={3} xs={12}>
              <Nav bsStyle='pills' stacked activeKey={activeTab}>
                <NavItem href={makeHref('account-settings')} eventKey='account'>Account Settings</NavItem>
                <NavItem href={makeHref('billing')} eventKey='billing'>Billing</NavItem>
                {hasFreeHost ? (
                  <NavItem href={makeHref('bonus')} eventKey='bonus'>Bonus Hours</NavItem>
                ) : ''}
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
