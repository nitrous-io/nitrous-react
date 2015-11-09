import React, { PropTypes } from 'react';
import { Button, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap';

import orgActions from 'actions/org-actions';
import orgStore from 'stores/org-store';
import Fa from 'components/fa';

export default class Orgs extends React.Component {
  displayName = 'Orgs';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  state = {
    orgs: orgStore.orgs
  };

  componentDidMount() {
    orgStore.onChange(this.orgStoreDidChange);
    orgActions.fetchAll();
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
  }

  orgStoreDidChange = () => {
    this.setState({ orgs: orgStore.orgs });
  }

  render() {
    const { orgs } = this.state,
          { makeHref } = this.context.router;

    return (
      <div className='orgs-component container'>
        <h1>Organizations</h1>

        <ListGroup>
          {orgs.toList().map((org) => {
            return (
              <ListGroupItem key={`org-${org.slug}`} className='clearfix'>
                <img className='gravatar' src={org.gravatar(72)} />
                <strong>{org.displayName}</strong>

                <ButtonToolbar className='pull-right'>
                  {org.roleAllowsBillingProfileAdmin ? (
                    <Button href={makeHref('org-billing', { orgSlug: org.slug })}>
                      <Fa icon='credit-card' /> Billing
                    </Button>
                  ) : ''}

                  <Button href={makeHref('org-invite-members', { orgSlug: org.slug })}>
                    <Fa icon='users' /> Members
                  </Button>
                </ButtonToolbar>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </div>
    );
  }
}
