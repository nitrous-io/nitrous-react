import { Label, Modal, Button, Table } from 'react-bootstrap';
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
      snackbarActions.post(`Payment of ${inv.totalChargeDollars} processed successfully`);
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
          invoiceTitle = stringUtil.titleize(invoice.title),
          invoiceFailedNotice = invoice.manuallyPayable ? <Label bsStyle='default'>Charge failed!</Label> : null,
          invoiceCharge = format.currency(invoice.totalChargeDollars);

    return (
      <tr>
        <td>{invoiceTitle} {invoiceFailedNotice}</td>
        <td><Time value={invoice.periodEnd} format="YYYY-MM-DD" /></td>
        <td>{invoiceCharge}</td>
        <td>
          <Button onClick={this.handleViewOrPayInvoice} bsStyle={invoice.manuallyPayable ? 'danger' : 'default'}>
            {invoice.manuallyPayable ? 'Pay Now' : 'View'}
          </Button>
          {this.renderModal()}
        </td>
      </tr>
    );
  }

  renderModal() {
    const { invoice } = this.props,
          { paying } = this.state,
          invoiceTitle = stringUtil.titleize(invoice.title),
          invoiceCharge = format.currency(invoice.totalChargeDollars);

    return (
      <Modal show={this.state.showModal} onHide={this.hideModal}>
        <Modal.Header>
          <Modal.Title>{invoiceTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive>
            <tbody>
              {invoice.items.map((item) => {
                return (
                  <tr key={`invoiceitem-${item.id}`}>
                    <td>{item.description}</td>
                    <td>{format.currency(item.amountDollars)}</td>
                  </tr>
                );
              })}
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
            <Button ref='modalPay' bsStyle='danger' disabled={paying} onClick={this.handlePayInvoice}>{paying ? 'Processing...' : 'Pay Now'}</Button>
          ) : ''}
        </Modal.Footer>
      </Modal>
    );
  }
}
