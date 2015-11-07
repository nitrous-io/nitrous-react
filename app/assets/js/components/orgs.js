import React, { PropTypes } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Link } from 'react-router';

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
    const { orgs } = this.state;

    return (
      <div className='orgs-component container'>
        <h1>Organizations</h1>

        <ListGroup>
          {orgs.toList().map((org) => {
            return (
              <ListGroupItem key={`org-${org.slug}`} className='clearfix'>
                <img className='gravatar' src={org.gravatar(72)} />
                <strong>{org.displayName}</strong>
                <Link to='org-invite-members' params={{ orgSlug: org.slug }}
                  className='btn btn-default pull-right'>
                  <Fa icon='users' /> Members
                </Link>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </div>
    );
  }
}
