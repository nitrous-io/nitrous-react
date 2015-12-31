import React, { PropTypes } from 'react';
import { RouteHandler } from 'react-router';

import Org from 'records/org';
import orgStore from 'stores/org-store';
import snackbarActions from 'actions/snackbar-actions';

export default class OrgRoot extends React.Component {
  displayName = 'OrgRoot';

  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static childContextTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      orgSlug: PropTypes.string.isRequired
    })
  };

  state = {
    org: orgStore.orgByOrgSlug(this.props.params.orgSlug)
  };

  componentDidMount() {
    orgStore.onChange(this.orgStoreDidChange);
  }

  componentWillUnmount() {
    orgStore.offChange(this.orgStoreDidChange);
  }

  getChildContext() {
    return { org: this.state.org };
  }

  orgStoreDidChange = () => {
    const org = orgStore.orgByOrgSlug(this.props.params.orgSlug);
    if (org) {
      this.setState({ org });
    } else {
      snackbarActions.post(`You have been removed from ${this.state.org.displayName}.`);
      this.context.router.transitionTo('dashboard');
    }
  }

  render() {
    return (
      <RouteHandler />
    );
  }
}
