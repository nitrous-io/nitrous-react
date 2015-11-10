import React, { PropTypes } from 'react';
import Org from 'records/org';
import OrgNav from 'components/org-nav';
import Billing from 'components/billing';

export default class OrgBilling extends React.Component {
  displayName = 'OrgBilling';

  static contextTypes = {
    org: PropTypes.instanceOf(Org).isRequired
  };

  render() {
    const { org } = this.context;

    return (
      <div className='org-billing-component'>
        <OrgNav org={org} activeTab='billing'>
          <Billing />
        </OrgNav>
      </div>
    );
  }
}
