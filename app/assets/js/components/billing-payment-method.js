import React, { PropTypes } from 'react';
import billingStore from 'stores/billing-store';
import { Input, Button } from 'react-bootstrap';
import { card, expiration } from 'creditcards';
import billingActions from 'actions/billing-actions';
import snackbarActions from 'actions/snackbar-actions';
import Org from 'records/org';
import classNames from 'classnames';

export default class BillingPaymentMethod extends React.Component {
  displayName = 'BillingPaymentMethod';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  }

  state = {
    saving: false,
    cardholderName: null,
    ccNumber: null,
    type: null,
    cvc: null,
    expirationMonth: null,
    expirationYear: null,
    zipCode: null
  }

  componentDidMount() {
    billingStore.onChange(this.billingStoreDidChange);
    billingStore.on('update-failed', this.onBillingUpdateFailed);
  }

  componentWillUnmount() {
    billingStore.offChange(this.billingStoreDidChange);
    billingStore.off('update-failed', this.onBillingUpdateFailed);
  }

  billingStoreDidChange = () => {
    snackbarActions.post('Payment updated successfully');
    this.setState({ saving: false });
    const { org } = this.context;
    if (org) {
      this.context.router.transitionTo('org-billing', { orgSlug: org.slug });
    } else {
      this.context.router.transitionTo('billing');
    }
  }

  onBillingUpdateFailed = () => {
    snackbarActions.post('Payment update failed');
    this.setState({ saving: false });
  }

  handleChangecardholderNameField = (event) => {
    this.setState({ cardholderName: event.target.value });
  }

  handleChangeCcNumberField = (event) => {
    const num = event.target.value;
    if (num) {
      const parsed = card.parse(num);
      const type = card.type(parsed, true);
      this.setState({ ccNumber: parsed, type });
    } else {
      this.setState({ ccNumber: num, type: null });
    }
  }

  handleChangeCvcField = (event) => {
    this.setState({ cvc: event.target.value });
  }

  handleChangeExpirationMonthField = (event) => {
    this.setState({ expirationMonth: event.target.value });
  }

  handleChangeExpirationYearField = (event) => {
    this.setState({ expirationYear: event.target.value });
  }

  handleChangeZipCodeField = (event) => {
    this.setState({ zipCode: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.setState({ saving: true });

    const { cardholderName, ccNumber, cvc, expirationMonth, expirationYear, zipCode } = this.state;
    billingActions.updateCard({
      cardholderName,
      ccNumber,
      cvc,
      expirationMonth,
      expirationYear,
      zipCode,
      orgSlug: this.context.org && this.context.org.slug
    });
  }

  cardholderNameValid = () => {
    return (this.state.cardholderName && this.state.cardholderName.length > 0);
  }

  ccNumberValid = () => {
    return card.isValid(this.state.ccNumber);
  }

  cvcValid = () => {
    return (this.state.cvc && this.state.cvc.match(/\d+/));
  }

  expirationMonthValid = () => {
    const parsed = expiration.month.parse(this.state.expirationMonth);
    return expiration.month.isValid(parsed);
  }

  expirationYearValid = () => {
    const parsed = expiration.year.parse(this.state.expirationYear);
    return expiration.year.isValid(parsed);
  }

  expirationValidationMessage = () => {
    if (!this.expirationMonthValid()) {
      return "Please enter a valid month";
    }

    if (!this.expirationYearValid()) {
      return "Please enter a valid year";
    }
  }

  zipCodeValid = () => {
    return this.state.zipCode && this.state.zipCode.length > 0;
  }

  render() {
    const {
      saving,
      cardholderName,
      ccNumber,
      type,
      cvc,
      expirationMonth,
      expirationYear,
      zipCode
    } = this.state;

    const { org } = this.context;

    var ccNumberDisplay = card.format(ccNumber);
    // if people type longer than format displays, we fallback
    if (ccNumberDisplay && ccNumberDisplay.replace(/\s+/g, "") !== ccNumber) {
      ccNumberDisplay = ccNumber;
    }

    const cardholderNameValid = this.cardholderNameValid();
    const ccNumberValid = this.ccNumberValid();
    const cvcValid = this.cvcValid();
    const expirationMonthValid = this.expirationMonthValid();
    const expirationYearValid = this.expirationYearValid();
    const zipCodeValid = this.zipCodeValid();

    const expirationValidationMessage = this.expirationValidationMessage();

    const submitDisabled = (saving || !cardholderNameValid || !ccNumberValid || !expirationMonthValid || !expirationYearValid || !zipCodeValid);

    var expirationClasses = classNames({
      'form-group': true,
      'has-error': !!expirationValidationMessage
    });

    return (
      <div className='billing-payment-method-component'>
        <div className='container'>
          <h2>{org ? ('Update payment method for ' + org.name) : 'Update your payment method'}</h2>
          <form onSubmit={this.handleSubmit}>
            <div className='cardholderName'>
              <Input label="Cardholder's Name"
                id='cardholder-name'
                type='text'
                placeholder='Name'
                bsStyle={cardholderNameValid ? 'success' : 'error'}
                help={cardholderNameValid ? '' : 'Please enter a name'}
                required
                disabled={saving}
                value={cardholderName}
                onChange={this.handleChangecardholderNameField} />
            </div>
            <div className='ccNumber'>
              <Input label="Card Number"
                id='cc-number'
                type='text'
                placeholder='Number'
                bsStyle={ccNumberValid ? 'success' : 'error'}
                help={ccNumberValid ? '' : 'Please enter a valid number'}
                required
                disabled={saving}
                value={ccNumberDisplay}
                onChange={this.handleChangeCcNumberField} />
              {type}
            </div>
            <div className='cvc'>
              <Input label="CVC"
                id='cvc'
                type='password'
                placeholder='CVC'
                bsStyle={cvcValid ? 'success' : 'error'}
                help={cvcValid ? '' : 'Please enter your CVC'}
                required
                disabled={saving}
                value={cvc}
                onChange={this.handleChangeCvcField} />
            </div>
            <label htmlFor='expiration-month'>Expiration (MM/YYYY)</label>
            <div className='expiration'>
              <div className='form-inline'>
                <div className={expirationClasses}>
                  <Input type='text'
                    id='expiration-month'
                    placeholder='MM'
                    pattern="[0-9]{2}"
                    bsStyle={expirationMonthValid ? 'success' : 'error'}
                    required
                    disabled={saving}
                    value={expirationMonth}
                    onChange={this.handleChangeExpirationMonthField} />
                  /
                  <Input type='text'
                    id='expiration-year'
                    placeholder='YYYY'
                    pattern="20[0-9]{2}"
                    bsStyle={expirationYearValid ? 'success' : 'error'}
                    required
                    disabled={saving}
                    value={expirationYear}
                    onChange={this.handleChangeExpirationYearField} />

                  {expirationValidationMessage ? (
                    <span className='help-block'>{expirationValidationMessage}</span>
                   ) : ''}
                </div>
              </div>
            </div>
            <div className='zipcode'>
              <Input label="Zip/Postal Code"
                id='zip-code'
                type='text'
                placeholder='Code'
                bsStyle={zipCodeValid ? 'success' : 'error'}
                help={zipCodeValid ? '' : 'Please enter a zip/postal code'}
                required
                disabled={saving}
                value={zipCode}
                onChange={this.handleChangeZipCodeField} />
            </div>
            <Button disabled={submitDisabled} type='submit' bsStyle='primary'>{saving ? "Saving..." : "Save"}</Button>
          </form>
         </div>
      </div>
    );
  }
}
