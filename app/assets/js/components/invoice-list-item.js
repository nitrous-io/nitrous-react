import React, { PropTypes } from 'react';
import Invoice from 'records/invoice';
import { Modal, Button, Table } from 'react-bootstrap';
import Time from 'react-time';
import stringUtil from 'lib/string-util';
import format from 'lib/format';

export default class InvoiceListItem extends React.Component {
  displayName = 'InvoiceListItem';

  static propTypes = {
    invoice: PropTypes.instanceOf(Invoice).isRequired
  };

  state = {
    showModal: false
  };

  handleViewInvoice = () => {
    this.setState({ showModal: true });
  };

  hideModal = () => {
    this.setState({ showModal: false });
  };

  handleCloseModal = () => {
    this.hideModal();
  };

  render() {
    const { invoice } = this.props,
          invoiceTitle = stringUtil.titleize(invoice.title),
          invoiceCharge = format.currency(invoice.totalChargeDollars),
          invoiceCreditAvailable = format.currency(invoice.creditAvailableDollars);

    return (
      <tr>
        <td>{invoiceTitle}</td>
        <td><Time value={invoice.periodEnd} format="YYYY-MM-DD" /></td>
        <td>{invoiceCharge}</td>
        <td>
          <a onClick={this.handleViewInvoice} className='btn btn-default'>View</a>

          <Modal show={this.state.showModal} onHide={this.hideModal}>
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
              <Button ref='modalCancel' onClick={this.handleCloseModal}>Close</Button>
            </Modal.Footer>
          </Modal>
        </td>
      </tr>
    );
  }
}
