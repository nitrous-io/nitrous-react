import React, { PropTypes } from 'react';
import billingStore from 'stores/billing-store';
import { Input, Button } from 'react-bootstrap';
import { card, expiration } from 'creditcards';
import billingActions from 'actions/billing-actions';
import snackbarActions from 'actions/snackbar-actions';
import Org from 'records/org';
import classNames from 'classnames';
import $ from 'jquery';

export default class BillingPaymentMethod extends React.Component {
  displayName = 'BillingPaymentMethod';

  static contextTypes = {
    org: PropTypes.instanceOf(Org),
    router: PropTypes.func.isRequired // Router.PropTypes.router.isRequired
  }

  findBillingProfile = () => {
    const org = this.context.org;
    if (org) {
      return billingStore.orgBillingProfiles.get(org.id);
    }
    return billingStore.userBillingProfile;
  }

  state = {
    billingProfile: this.findBillingProfile(),
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
    const { value } = event.target;
    this.setState({ expirationMonth: value });

    const parsed = expiration.month.parse(value);
    if (expiration.month.isValid(parsed) && value.toString().length === 2) {
      $("#expiration-year").focus();
    }
  }

  handleChangeExpirationYearField = (event) => {
    this.setState({ expirationYear: event.target.value });
  }

  handleChangeZipCodeField = (event) => {
    this.setState({ zipCode: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.submitDisabled()) {
      return;
    }

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

  submitDisabled = () => {
    return (this.state.saving
      || !this.cardholderNameValid()
      || !this.ccNumberValid()
      || !this.cvcValid()
      || !this.expirationMonthValid()
      || !this.expirationYearValid()
      || !this.zipCodeValid());
  }

  cardholderNameValid = () => {
    return (this.state.cardholderName && this.state.cardholderName.trim().length > 0);
  }

  ccNumberValid = () => {
    return card.isValid(this.state.ccNumber);
  }

  cvcValid = () => {
    return (this.state.cvc && this.state.cvc.match(/\d+/));
  }

  expirationMonthValid = () => {
    const { expirationMonth } = this.state,
          parsed = expiration.month.parse(expirationMonth);

    return expiration.month.isValid(parsed) && expirationMonth.toString().length === 2;
  }

  expirationYearValid = () => {
    const { expirationYear } = this.state,
          parsed = expiration.year.parse(expirationYear);

    return expiration.year.isValid(parsed) && expirationYear.toString().length === 4;
  }

  expirationValidationMessage = () => {
    const { expirationMonth, expirationYear } = this.state;
    if ((expirationMonth || expirationYear) && !this.expirationMonthValid()) {
      return "Please enter a valid month";
    }

    if ((expirationMonth || expirationYear) && !this.expirationYearValid()) {
      return "Please enter a valid year";
    }
  }

  zipCodeValid = () => {
    return this.state.zipCode && this.state.zipCode.length > 0;
  }

  validationStyle = (value, valid) => {
    if (value === null) {
      return null;
    }

    if (valid) {
      return 'success';
    } else {
      return 'error';
    }
  }

  validationMessage = (value, valid, failureMessage) => {
    if (value === null) {
      return null;
    }

    if (valid) {
      return '';
    } else {
      return failureMessage;
    }
  }

  render() {
    const {
      billingProfile,
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

    let ccNumberDisplay = card.format(ccNumber);
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

    const expirationClasses = classNames({
      'form-group': true,
      'has-success': expirationMonthValid && expirationYearValid,
      'has-error': !!expirationValidationMessage
    });

    return (
      <div className='billing-payment-method-component'>
        <div className='container'>
          {billingProfile.hasCard ? (
            <h2>{org ? `Update Payment Method for ${org.name}` : 'Update Payment Method'}</h2>
          ) : (
            <h2>{org ? `Add Payment Method for ${org.name}` : 'Add Payment Method'}</h2>
          )}

          <form onSubmit={this.handleSubmit}>
            <div className='cardholderName'>
              <Input label="Cardholder's Name"
                id='cardholder-name'
                type='text'
                placeholder='Name'
                bsStyle={this.validationStyle(cardholderName, cardholderNameValid)}
                help={this.validationMessage(cardholderName, cardholderNameValid, 'Please enter a name')}
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
                bsStyle={this.validationStyle(ccNumber, ccNumberValid)}
                help={this.validationMessage(ccNumber, ccNumberValid, 'Please enter a valid number')}
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
                bsStyle={this.validationStyle(cvc, cvcValid)}
                help={this.validationMessage(cvc, cvcValid, 'Please enter your CVC')}
                required
                disabled={saving}
                value={cvc}
                onChange={this.handleChangeCvcField} />
            </div>
            <div className='expiration'>
              <div className={expirationClasses}>
                <label className='control-label' htmlFor='expiration-month'>Expiration (MM/YYYY)</label>
                <div className='form-inline'>
                  <Input type='text'
                    id='expiration-month'
                    placeholder='MM'
                    pattern="[0-9]{2}"
                    bsStyle={this.validationStyle(expirationMonth, expirationMonthValid)}
                    required
                    disabled={saving}
                    value={expirationMonth}
                    onChange={this.handleChangeExpirationMonthField} />
                  /
                  <Input type='text'
                    id='expiration-year'
                    placeholder='YYYY'
                    pattern="20[0-9]{2}"
                    bsStyle={this.validationStyle(expirationYear, expirationYearValid)}
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
                bsStyle={this.validationStyle(zipCode, zipCodeValid)}
                help={this.validationMessage(zipCode, zipCodeValid, 'Please enter a zip/postal code')}
                required
                disabled={saving}
                value={zipCode}
                onChange={this.handleChangeZipCodeField} />
            </div>
            <Button disabled={this.submitDisabled()} type='submit' bsStyle='primary'>
              {billingProfile.hasCard ? (
                saving ? 'Updating...' : 'Update'
              ) : (
                saving ? 'Saving...' : 'Save'
              )}
            </Button>
          </form>
         </div>
      </div>
    );
  }
}
