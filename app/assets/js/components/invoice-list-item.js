import { Modal, Button, Table } from 'react-bootstrap';
import React, { PropTypes } from 'react';

import Invoice from 'records/invoice';
import invoiceActions from 'actions/invoice-actions';
import invoiceStore from 'stores/invoice-store';
import snackbarActions from 'actions/snackbar-actions';
import Time from 'react-time';
import stringUtil from 'lib/string-util';
import format from 'lib/format';

export default class InvoiceListItem extends React.Component {
  displayName = 'InvoiceListItem';

  static propTypes = {
    invoice: PropTypes.instanceOf(Invoice).isRequired
  };

  state = {
    showModal: false,
    paying: false
  };

  componentDidMount() {
    invoiceStore.on('paid', this.onInvoicePaid);
    invoiceStore.on('pay-failed', this.onInvoicePayFailed);
  }

  componentWillUnmount() {
    invoiceStore.off('paid', this.onInvoicePaid);
    invoiceStore.off('pay-failed', this.onInvoicePayFailed);
  }

  onInvoicePaid = (data) => {
    const { inv } = data;

    if (this.props.invoice.id === inv.id) {
      this.setState({
        paying: false,
        showModal: false
      });
      snackbarActions.post(`Payment submitted successfully`);
    }
  }

  onInvoicePayFailed = (data) => {
    const { invoiceId } = data;

    if (this.props.invoice.id === invoiceId ) {
      this.setState({
        paying: false,
        showModal: false
      });
      snackbarActions.post(`Failed to submit payment!`);
    }
  }

  handleViewOrPayInvoice = () => {
    this.setState({ showModal: true });
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  handleCloseModal = () => {
    this.hideModal();
  };

  handlePayInvoice = () => {
    this.setState({ paying: true });
    invoiceActions.pay(this.props.invoice.id);
  };

  render() {
    const { invoice } = this.props,
          { paying } = this.state,
          invoiceTitle = stringUtil.titleize(invoice.title),
          invoiceCharge = format.currency(invoice.totalChargeDollars),
          invoiceCreditAvailable = format.currency(invoice.creditAvailableDollars);

    return (
      <tr>
        <td>{invoiceTitle}</td>
        <td><Time value={invoice.periodEnd} format="YYYY-MM-DD" /></td>
        <td>{invoiceCharge}</td>
        <td>
          <a onClick={this.handleViewOrPayInvoice} className='btn btn-default'>
            {invoice.manuallyPayable ? 'Pay Now' : 'View'}
          </a>

          <Modal show={this.state.showModal} onHide={this.hideModal} backdrop='static'>
            <Modal.Header>
              <Modal.Title><Time value={invoice.periodEnd} format="YYYY-MM-DD" /></Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table responsive>
                <tbody>
                  <tr>
                    <td>Subscription to {invoiceTitle}</td>
                    <td>{invoiceCharge}</td>
                  </tr>
                  {invoice.creditAvailable ? (
                    <tr>
                      <td>Credits applied</td>
                      <td>({invoiceCreditAvailable})</td>
                    </tr>
                  ) : ''}
                  <tr>
                    <td><strong>Total Charge</strong></td>
                    <td><strong>{invoiceCharge}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Modal.Body>
            <Modal.Footer>
              {!paying ? (
                <Button ref='modalCancel' onClick={this.handleCloseModal}>Close</Button>
              ) : ''}
              {invoice.manuallyPayable ? (
                <Button ref='modalPay' bsStyle='primary' disabled={paying} onClick={this.handlePayInvoice}>{paying ? 'Processing' : 'Pay Now'}</Button>
              ) : ''}
            </Modal.Footer>
          </Modal>
        </td>
      </tr>
    );
  }
}
