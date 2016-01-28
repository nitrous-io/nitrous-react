import React, { PropTypes } from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';

export default class UserNav extends React.Component {
  displayName = 'UserNav';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ])
  }

  render() {
    const { makeHref } = this.context.router,
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
                <NavItem href={makeHref('bonus')} eventKey='bonus'>Bonus Hours</NavItem>
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
