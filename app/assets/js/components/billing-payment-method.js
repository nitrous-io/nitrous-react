import React, { PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import Org from 'records/org';
import billingStore from 'stores/billing-store';
import PaymentMethod from 'components/payment-method';

export default class BillingPaymentMethod extends React.Component {
  displayName = 'BillingPaymentMethod';

  static contextTypes = {
    org: PropTypes.instanceOf(Org)
  }

  static propTypes = {
    nextURLHint: PropTypes.string,
    subscriptionSlug: PropTypes.string
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
  }

  render() {
    const { billingProfile } = this.state,
          { org } = this.context,
          { nextURLHint, subscriptionSlug } = this.props;

    return (
      <div className='billing-payment-method-component'>
        <Panel header={
          <h4>
            {billingProfile.hasCard ? (
              org ? `Update Credit Card for ${org.name}` : 'Update Credit Card'
            ) : (
              org ? `Add Credit Card for ${org.name}` : 'Add Credit Card'
            )}
          </h4>
        }>
          <PaymentMethod standalone
           nextURLHint={nextURLHint}
           subscriptionSlug={subscriptionSlug} />
        </Panel>
      </div>
    );
  }
}
