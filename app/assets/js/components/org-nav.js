import React, { PropTypes } from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import Org from 'records/org';
import Breadcrumb from 'components/bootstrap-backports/breadcrumb';
import BreadcrumbItem from 'components/bootstrap-backports/breadcrumb-item';

export default class OrgNav extends React.Component {
  displayName = 'OrgNav';

  static contextTypes = {
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    org: PropTypes.instanceOf(Org).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ])
  }

  render() {
    const { makeHref } = this.context.router,
          { activeTab, org } = this.props;

    const makeOrgHref = function(action) {
      return makeHref(`org-${action}`, { orgSlug: org.slug });
    };

    return (
      <div className='org-nav-component container'>
        <Breadcrumb>
          <BreadcrumbItem href={makeHref('dashboard')}>Dashboard</BreadcrumbItem>
          <BreadcrumbItem href={makeHref('orgs')}>Organizations</BreadcrumbItem>
          <BreadcrumbItem active>{org.displayName}</BreadcrumbItem>
        </Breadcrumb>

        <Grid className='ui-card-grid'>
          <Row>
            <Col lg={2} md={2} sm={3} xs={12}>
              <Nav bsStyle='pills' stacked activeKey={activeTab}>
                {org.roleAllowsMemberAdmin ? (
                  <NavItem href={makeOrgHref('members')} eventKey='members'>Members</NavItem>
                ) : ''}
                {org.roleAllowsBillingProfileAdmin ? (
                  <NavItem href={makeOrgHref('billing')} eventKey='billing'>Billing</NavItem>
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
