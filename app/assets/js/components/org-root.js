import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';
import Org from 'records/org';
import orgStore from 'stores/org-store';

export default class OrgRoot extends React.Component {
  displayName = 'OrgRoot';

  static childContextTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      orgSlug: PropTypes.string.isRequired
    })
  };

  getChildContext() {
    return { org: orgStore.orgs.get(this.props.params.orgSlug) };
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
