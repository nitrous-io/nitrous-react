import React, { PropTypes } from 'react';
import billingStore from 'stores/billing-store';
import Org from 'records/org';

export default class Billing extends React.Component {
  displayName = 'Billing';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  };

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  state = {
    billingProfile: this.findBillingProfile()
  };

  render() {
    const { cardType,
           expMonth,
           expYear,
           lastFour
          } = this.state.billingProfile;

    const { makeHref } = this.context.router;

    var href = makeHref('payment-method');
    const { org } = this.context;
    if (org) {
      href = makeHref('org-payment-method', { orgSlug: org.slug });
    }

    return (
      <div className='billing-component'>
        <div className='container'>
          <h3>Payment Method</h3>
          <div>
            <p>
              <b>{cardType}</b> - {lastFour}
            </p>
            <p>
              Expires {expMonth}/{expYear}
            </p>
            <p><a href={href}>Change Payment Method</a></p>
          </div>
        </div>
      </div>
    );
  }
}
