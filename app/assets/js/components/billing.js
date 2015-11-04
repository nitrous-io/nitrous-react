import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';

import billingStore from 'stores/billing-store';
import Org from 'records/org';
import Fa from 'components/fa';

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
    const { billingProfile } = this.state,
          { hasCard, cardType, expMonth, expYear, lastFour } = billingProfile,
          { makeHref } = this.context.router;

    var href = makeHref('payment-method');
    const { org } = this.context;
    if (org) {
      href = makeHref('org-payment-method', { orgSlug: org.slug });
    }

    return (
      <div className='billing-component'>
        <div className='container'>
          <Panel header='Payment Method' className='payment-method'>
            {hasCard ? (
              <div>
                <p>
                  <b>{cardType}</b> - {lastFour}
                </p>
                <p>
                  Expires {expMonth}/{expYear}
                </p>
                <p><a href={href} className='btn btn-default'><Fa icon='credit-card' /> Update Payment Method</a></p>
              </div>
            ) : (
              <div>
                <p>No payment method on file.</p>
                <p><a href={href} className='btn btn-default'><Fa icon='credit-card' /> Add Payment Method</a></p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    );
  }
}
